const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all assets (filtered by company)
router.get('/', auth, async (req, res) => {
    try {
        let where = {};
        if (req.user.role !== 'ADMIN') {
            where.companyId = req.user.companyId;
        }

        const assets = await prisma.asset.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(assets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });

        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        // Check ownership
        if (req.user.role !== 'ADMIN' && asset.companyId !== req.user.companyId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedAsset = await prisma.asset.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json(updatedAsset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Asset
router.delete('/:id', auth, async (req, res) => {
    try {
        const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });

        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        // Check ownership
        if (req.user.role !== 'ADMIN' && asset.companyId !== req.user.companyId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await prisma.asset.delete({ where: { id: req.params.id } });

        res.json({ message: 'Asset removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
