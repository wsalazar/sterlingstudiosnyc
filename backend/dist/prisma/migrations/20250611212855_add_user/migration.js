"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log('Starting migration...');
        await prisma.$connect();
        console.log('Database connected');
        const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'defaultpassword', 10);
        console.log('Password hashed');
        console.log('Attempting to create user with email:', process.env.DEFAULT_USER || 'default@example.com');
        const user = await prisma.user.create({
            data: {
                email: process.env.DEFAULT_USER || 'default@example.com',
                name: 'Jorge Almodovar',
                password: hashedPassword,
                admin: true,
            },
        });
        console.log('User created successfully:', {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            admin: user.admin,
        });
    }
    catch (error) {
        console.error('Migration failed with error:', error);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.meta) {
            console.error('Error metadata:', error.meta);
        }
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
async function up() {
    await main();
}
async function down() {
    try {
        console.log('Starting rollback...');
        await prisma.$connect();
        const email = process.env.DEFAULT_USER || 'default@example.com';
        console.log('Attempting to delete user with email:', email);
        await prisma.user.delete({
            where: {
                email: email,
            },
        });
        console.log('User deleted successfully');
    }
    catch (error) {
        console.error('Rollback failed:', error);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.meta) {
            console.error('Error metadata:', error.meta);
        }
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
//# sourceMappingURL=migration.js.map