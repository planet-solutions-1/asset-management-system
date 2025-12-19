const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all companies (Admin only) or current company
router.get('/', auth, async (req, res) => {
    try {
        // Allow all users to see all companies (for Dashboard stats and directory)
        let where = {};
        // if (req.user.role !== 'ADMIN') {
        //     where.id = req.user.companyId;
        // }

        const companies = await prisma.company.findMany({ where });
        res.json(companies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create new company and admin user (Admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    const { name, address, location, contact, sector, logo, email, password } = req.body;

    try {
        // Check if user exists
        let existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const bcrypt = require('bcryptjs'); // Ensure bcrypt is available
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await prisma.$transaction(async (prisma) => {
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

            const newAdmin = await prisma.user.create({
                data: {
                    name: `${name} Admin`,
                    email,
                    password: hashedPassword,
                    role: 'USER', // Or 'COMPANY_ADMIN' if we had that role, but logic suggests 'USER' for now, acting as admin for that company
                    companyId: newCompany.id,
                    avatar: `https://ui-avatars.com/api/?name=${name}`
                }
            });

            return newCompany;
        });

        res.json(result);
    } catch (err) {
        console.error('Registration Error:', err);
        // Check for Prisma unique constraint error
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'A duplicate record exists (Email or Company Name).' });
        }
        res.status(500).json({ message: err.message || 'Server Error' });
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

// Delete company (Admin only)
// Delete company (Admin only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    const companyId = req.params.id;

    try {
        // Transaction to delete all related data first
        await prisma.$transaction([
            prisma.bill.deleteMany({ where: { companyId } }),
            prisma.asset.deleteMany({ where: { companyId } }),
            prisma.department.deleteMany({ where: { companyId } }),
            prisma.user.deleteMany({ where: { companyId } }),
            prisma.company.delete({ where: { id: companyId } })
        ]);

        res.json({ msg: 'Company and all related data removed' });
    } catch (err) {
        console.error('Delete Error:', err.message);
        res.status(500).json({ msg: 'Server Error during deletion', error: err.message });
    }
});

module.exports = router;
