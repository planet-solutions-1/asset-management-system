const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all companies (Admin only) or current company
router.get('/', auth, async (req, res) => {
    try {
        let where = {};
        if (req.user.role !== 'ADMIN') {
            where.id = req.user.companyId;
        }

        const companies = await prisma.company.findMany({ where });
        res.json(companies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create new company (Admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    const { name, address, location, contact, sector, logo } = req.body;

    try {
        const newCompany = await prisma.company.create({
            data: {
                name,
                address,
                location,
                contact,
                sector,
                logo
            }
        });
        res.json(newCompany);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update company details (Admin only or Company Admin?) -> Admin only for now as requested
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    const { name, address, location, contact, sector, logo } = req.body;

    try {
        const updatedCompany = await prisma.company.update({
            where: { id: req.params.id },
            data: {
                name,
                address,
                location,
                contact,
                sector,
                logo
            }
        });
        res.json(updatedCompany);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
