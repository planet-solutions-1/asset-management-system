const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
    try {
        // Check if any company exists
        const companyCount = await prisma.company.count();
        if (companyCount > 0) {
            console.log('Database already seeded.');
            return;
        }

        console.log('Seeding database with default admin...');

        // Create Default Company
        const company = await prisma.company.create({
            data: {
                id: 'comp_default',
                name: 'Planet Solutions',
                address: 'HQ - Silicon Valley',
                logo: 'https://ui-avatars.com/api/?name=Planet+Solutions&background=0D8ABC&color=fff'
            }
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create Default Admin User
        const user = await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: 'admin@planet.com',
                password: hashedPassword, // admin123
                role: 'ADMIN',
                companyId: company.id,
                avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=random'
            }
        });

        console.log(`Default Admin Created: ${user.email} / admin123`);
        console.log('Database seeding completed.');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

module.exports = seed;
