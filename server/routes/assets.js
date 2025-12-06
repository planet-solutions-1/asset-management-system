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
    }
});

// Add Asset
router.post('/', auth, async (req, res) => {
    try {
        console.log('Received add asset request:', { ...req.body, image: req.body.image ? 'IMAGE_DATA_TRUNCATED' : null });
        const { name, type, status, location, purchaseDate, warrantyExpiry, amcExpiry, image, companyId, maintenanceHistory } = req.body;

        // Verify company ownership or admin status
        if (req.user.role !== 'ADMIN' && req.user.companyId !== companyId) {
            console.error('Unauthorized asset addition: User company mismatch');
            return res.status(403).json({ message: 'Unauthorized to add assets to this company' });
        }

        const effectiveCompanyId = req.user.role === 'ADMIN' ? (companyId || req.user.companyId) : req.user.companyId;

        const asset = await prisma.asset.create({
            data: {
                name,
                type,
                status,
                location,
                purchaseDate,
                warrantyExpiry,
                amcExpiry,
                image,
                companyId: effectiveCompanyId,
                maintenanceHistory: maintenanceHistory || [],
            },
        });
        console.log('Asset created successfully:', asset.id);
        res.json(asset);
    } catch (err) {
        console.error('Error creating asset:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// Update Asset
router.put('/:id', auth, async (req, res) => {
    try {
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
