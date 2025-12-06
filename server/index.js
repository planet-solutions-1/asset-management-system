const express = require('express');
// Trigger deployment refresh
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

const seed = require('./seed');

// Run Seeder then start server
seed().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// Handle shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
