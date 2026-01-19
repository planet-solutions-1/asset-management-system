const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all bills for the company
router.get('/', auth, async (req, res) => {
    try {
        const bills = await prisma.bill.findMany({
            where: {
                companyId: req.user.companyId
            },
            include: {
                asset: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(bills);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new bill
router.post('/', auth, async (req, res) => {
    try {
        const { amount, date, type, fileUrl, assetId } = req.body;

        const newBill = await prisma.bill.create({
            data: {
                amount: parseFloat(amount),
                date: new Date(date),
                type,
                fileUrl,
                assetId: assetId || null,
                companyId: req.user.role === 'ADMIN' ? (req.body.companyId || req.user.companyId) : req.user.companyId
            }
        });

        res.json(newBill);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a bill
router.delete('/:id', auth, async (req, res) => {
    try {
        const bill = await prisma.bill.findUnique({ where: { id: req.params.id } });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        if (bill.companyId !== req.user.companyId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await prisma.bill.delete({ where: { id: req.params.id } });
        res.json({ message: 'Bill removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
