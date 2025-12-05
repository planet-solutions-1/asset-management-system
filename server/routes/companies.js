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

module.exports = router;
