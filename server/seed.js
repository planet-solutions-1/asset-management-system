const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
    try {
        // Check if Default Admin exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@planet.com' }
        });

        if (existingAdmin) {
            console.log('Default admin already exists.');
            return;
        }

        console.log('Seeding database with default admin...');

        // Check/Create Default Company
        let company = await prisma.company.findFirst({
            where: { name: 'Planet Solutions' }
        });

        if (!company) {
            company = await prisma.company.create({
                data: {
                    id: 'comp_default',
                    name: 'Planet Solutions',
                    address: 'HQ - Silicon Valley',
                    logo: 'https://ui-avatars.com/api/?name=Planet+Solutions&background=0D8ABC&color=fff'
                }
            });
        }

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
