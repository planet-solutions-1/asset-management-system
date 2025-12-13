const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all departments for the authenticated user's company
router.get('/', authenticateToken, async (req, res) => {
    try {
        const where = {};
        if (req.user.role !== 'ADMIN') {
            where.companyId = req.user.companyId;
        }

        const departments = await prisma.department.findMany({
            where,
            include: {
                _count: {
                    select: { assets: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

// Create a new department
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        const department = await prisma.department.create({
            data: {
                name,
                companyId: req.user.companyId
            }
        });

        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create department' });
    }
});

// Delete a department
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if department has assets
        const department = await prisma.department.findUnique({
            where: { id },
            include: { _count: { select: { assets: true } } }
        });

        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        if (department.companyId !== req.user.companyId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (department._count.assets > 0) {
            return res.status(400).json({ error: 'Cannot delete department with assigned assets' });
        }

        await prisma.department.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

module.exports = router;
