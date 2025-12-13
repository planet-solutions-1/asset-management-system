const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Register Company & Admin User
router.post('/register', async (req, res) => {
    const { companyName, email, password, sector } = req.body;

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
                    address: 'Address Pending',
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
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
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
