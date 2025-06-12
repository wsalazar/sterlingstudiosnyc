"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
console.log('Starting migration script...');
const migrationsDir = (0, path_1.join)(__dirname, 'migrations');
const migrationDirs = (0, fs_1.readdirSync)(migrationsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort();
console.log('hahahah', migrationDirs);
function generateChecksum(content) {
    return (0, crypto_1.createHash)('sha256').update(content).digest('hex');
}
async function executeSqlStatements(sql) {
    const statements = sql
        .split(';')
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);
    for (const statement of statements) {
        console.log('Executing SQL:', statement);
        await prisma.$executeRawUnsafe(statement);
    }
}
async function recordMigration(migrationName, content) {
    const checksum = generateChecksum(content);
    await prisma.$executeRaw `
    INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
    VALUES (${migrationName}, ${checksum}, NOW(), ${migrationName}, NULL, NULL, NOW(), 1)
    ON CONFLICT (id) DO NOTHING
  `;
}
async function runMigrations() {
    for (const dir of migrationDirs) {
        try {
            console.log(`\nRunning migration: ${dir}`);
            const migrationPath = (0, path_1.join)(migrationsDir, dir, 'migration');
            const isTypeScript = require.resolve(migrationPath + '.ts');
            if (isTypeScript) {
                console.log('Running TypeScript migration');
                const migration = require(migrationPath);
                const content = (0, fs_1.readFileSync)(migrationPath + '.ts', 'utf8');
                await migration.up();
                await recordMigration(dir, content);
            }
            else {
                console.log('Running SQL migration');
                const sqlPath = migrationPath + '.sql';
                const sql = (0, fs_1.readFileSync)(sqlPath, 'utf8');
                await executeSqlStatements(sql);
                await recordMigration(dir, sql);
            }
            console.log(`Migration ${dir} completed successfully`);
        }
        catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                try {
                    console.log('Running SQL migration');
                    const sqlPath = (0, path_1.join)(migrationsDir, dir, 'migration.sql');
                    const sql = (0, fs_1.readFileSync)(sqlPath, 'utf8');
                    await executeSqlStatements(sql);
                    await recordMigration(dir, sql);
                    console.log(`Migration ${dir} completed successfully`);
                }
                catch (sqlError) {
                    console.error(`SQL Migration ${dir} failed:`, sqlError);
                    throw sqlError;
                }
            }
            else {
                console.error(`Migration ${dir} failed:`, error);
                throw error;
            }
        }
    }
}
runMigrations()
    .then(async () => {
    console.log('\nAll migrations completed successfully');
    await prisma.$disconnect();
    process.exit(0);
})
    .catch(async (error) => {
    console.error('\nMigration process failed:', error);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=run-migration.js.map