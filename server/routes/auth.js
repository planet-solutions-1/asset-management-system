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

        // [NEW] Check for Lockout (Skip for Admin)
        if (user.role !== 'ADMIN' && user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
            const minutesLeft = Math.ceil((new Date(user.lockoutUntil) - new Date()) / 60000);
            return res.status(403).json({
                message: `Account is temporarily locked due to multiple failed attempts. Please try again in ${minutesLeft} minutes or contact Admin.`,
                isLocked: true
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Increment failed attempts
            const failedAttempts = (user.failedAttempts || 0) + 1;
            let lockoutUntil = null;
            let alertMessage = `Suspicious activity for user ${user.name} (${user.email}) - ${failedAttempts} failed login attempts.`;

            // Check if threshold exceeded (Greater than 2 means at least 3rd failure)
            if (failedAttempts > 2) {
                // Set Lockout for 30 minutes (Only for non-Admins)
                if (user.role !== 'ADMIN') {
                    lockoutUntil = new Date(Date.now() + 30 * 60 * 1000);
                    alertMessage = `USER LOCKED: ${user.name} (${user.email}) has been locked out for 30 minutes after ${failedAttempts} failed attempts.`;
                } else {
                    alertMessage = `ADMIN LOGIN FAILED: Super Admin ${user.name} (${user.email}) has ${failedAttempts} consecutive failed attempts.`;
                }
            }

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts,
                    lockoutUntil
                }
            });

            if (failedAttempts > 2) {
                // Create Security Alert
                const pendingAlert = await prisma.alert.findFirst({
                    where: {
                        message: { contains: `Suspicious activity for user ${user.name}` },
                        isResolved: false
                    }
                });

                if (!pendingAlert) {
                    await prisma.alert.create({
                        data: {
                            message: alertMessage,
                            type: 'SECURITY'
                        }
                    });
                }
            }

            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Login Success - Reset Failed Attempts and Lockout
        if (user.failedAttempts > 0 || user.lockoutUntil) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts: 0,
                    lockoutUntil: null
                }
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
