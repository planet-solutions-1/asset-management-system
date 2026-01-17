const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users for the authenticated user's company
router.get('/', auth, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                companyId: req.user.companyId
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                role: true,
                sector: true,
                failedAttempts: true,
                lockoutUntil: true,
                plainPassword: true, // [NEW] Return plain password
                avatar: true,
                createdAt: true,
                company: {
                    select: {
                        logo: true,
                        name: true
                    }
                }
            }
        });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new user to the company (Admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized. Only Admins can create users.' });
    }

    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                email,
                password: hashedPassword,
                plainPassword: password, // [NEW] Save plain text
                role: role || 'USER',
                sector: req.body.sector || '',  // [NEW] Save Sector
                companyId: req.user.companyId,
                avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
            },
            include: { // [NEW] Include Company in response
                company: {
                    select: {
                        logo: true,
                        name: true
                    }
                }
            }
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        res.json(userWithoutPassword);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a user (Admin only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check company ownership
        if (user.companyId !== req.user.companyId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Prevent deleting self
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'User removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Unlock a user (Admin only)
router.put('/:id/unlock', auth, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.companyId !== req.user.companyId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await prisma.user.update({
            where: { id: req.params.id },
            data: {
                failedAttempts: 0,
                lockoutUntil: null
            }
        });

        // Also resolve associated Alerts for this user
        // This is a nice-to-have UX enhancement so Admin doesn't have to dismiss the alert manually after unlocking
        await prisma.alert.updateMany({
            where: {
                message: { contains: `Suspicious activity for user ${user.name}` },
                isResolved: false
            },
            data: { isResolved: true }
        });

        res.json({ message: 'User unlocked successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
