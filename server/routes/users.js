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
                avatar: true,
                createdAt: true
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
                password: hashedPassword,
                role: role || 'USER',
                companyId: req.user.companyId,
                avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
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

module.exports = router;
