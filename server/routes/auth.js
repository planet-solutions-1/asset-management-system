const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Register Company & Admin User
router.post('/register', async (req, res) => {
    const { companyName, email, password, sector, address, location, contact } = req.body;

    try {
        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Company and User transactionally
        const result = await prisma.$transaction(async (prisma) => {
            const company = await prisma.company.create({
                data: {
                    name: companyName,
                    address: address || 'Address Pending',
                    location: location || '',
                    contact: contact || '',
                    sector: sector || 'Other',
                    logo: `https://ui-avatars.com/api/?name=${companyName}&background=random`
                }
            });

            const newUser = await prisma.user.create({
                data: {
                    name: `${companyName} Admin`,
                    email,
                    password: hashedPassword,
                    role: 'USER', // Default role
                    companyId: company.id,
                    avatar: `https://ui-avatars.com/api/?name=${companyName}`
                },
                include: { // [NEW] Return company details
                    company: {
                        select: {
                            name: true,
                            logo: true
                        }
                    }
                }
            });

            return { company, user: newUser };
        });

        // Create Token
        const payload = {
            user: {
                id: result.user.id,
                role: result.user.role,
                companyId: result.user.companyId
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_key_change_me',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: result.user });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await prisma.user.findUnique({
            where: { email },
            include: {
                company: {
                    select: {
                        name: true,
                        logo: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Increment failed attempts
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: { failedAttempts: (user.failedAttempts || 0) + 1 },
                select: { failedAttempts: true, name: true, company: { select: { name: true } } }
            });

            // Check if threshold exceeded (Greater than 2 means at least 3rd failure)
            if (updatedUser.failedAttempts > 2) {
                // Create Security Alert for Super Admin if not already recent unresolved alert
                const pendingAlert = await prisma.alert.findFirst({
                    where: {
                        message: { contains: `Suspicious activity for user ${updatedUser.name}` },
                        isResolved: false
                    }
                });

                if (!pendingAlert) {
                    await prisma.alert.create({
                        data: {
                            message: `Suspicious activity for user ${updatedUser.name} (${user.email}) at ${updatedUser.company?.name || 'Unknown Company'} - ${updatedUser.failedAttempts} failed login attempts.`,
                            type: 'SECURITY'
                        }
                    });
                    console.log(`Security Alert Created for ${user.email}`);
                }
            }

            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Login Success - Reset Failed Attempts
        if (user.failedAttempts > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: { failedAttempts: 0 }
            });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                companyId: user.companyId
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_key_change_me',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
