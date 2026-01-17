const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// @route   GET /api/alerts
// @desc    Get all security alerts (Admin Only)
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    try {
        // Fetch unresolved alerts first, then recent resolved ones
        const alerts = await prisma.alert.findMany({
            orderBy: [
                { isResolved: 'asc' }, // Unresolved first (false < true)
                { createdAt: 'desc' }
            ],
            take: 20
        });
        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/alerts/:id/resolve
// @desc    Mark alert as resolved
// @access  Private/Admin
router.put('/:id/resolve', auth, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    try {
        const alert = await prisma.alert.update({
            where: { id: req.params.id },
            data: { isResolved: true }
        });
        res.json(alert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
