import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

console.log('Starting migration script...')

const migrationsDir = join(__dirname, 'migrations')
const migrationDirs = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .sort()

console.log('hahahah', migrationDirs)

function generateChecksum(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

async function executeSqlStatements(sql: string) {
  const statements = sql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)

  for (const statement of statements) {
    console.log('Executing SQL:', statement)
    await prisma.$executeRawUnsafe(statement)
  }
}

async function recordMigration(migrationName: string, content: string) {
  const checksum = generateChecksum(content)
  await prisma.$executeRaw`
    INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
    VALUES (${migrationName}, ${checksum}, NOW(), ${migrationName}, NULL, NULL, NOW(), 1)
    ON CONFLICT (id) DO NOTHING
  `
}

// Run each migration
async function runMigrations() {
  for (const dir of migrationDirs) {
    try {
      console.log(`\nRunning migration: ${dir}`)
      const migrationPath = join(migrationsDir, dir, 'migration')

      const isTypeScript = require.resolve(migrationPath + '.ts')
      if (isTypeScript) {
        console.log('Running TypeScript migration')
        const migration = require(migrationPath)
        const content = readFileSync(migrationPath + '.ts', 'utf8')
        await migration.up()
        await recordMigration(dir, content)
      } else {
        console.log('Running SQL migration')
        const sqlPath = migrationPath + '.sql'
        const sql = readFileSync(sqlPath, 'utf8')
        await executeSqlStatements(sql)
        await recordMigration(dir, sql)
      }

      console.log(`Migration ${dir} completed successfully`)
    } catch (error: any) {
      if (error.code === 'MODULE_NOT_FOUND') {
        try {
          console.log('Running SQL migration')
          const sqlPath = join(migrationsDir, dir, 'migration.sql')
          const sql = readFileSync(sqlPath, 'utf8')
          await executeSqlStatements(sql)
          await recordMigration(dir, sql)
          console.log(`Migration ${dir} completed successfully`)
        } catch (sqlError) {
          console.error(`SQL Migration ${dir} failed:`, sqlError)
          throw sqlError
        }
      } else {
        console.error(`Migration ${dir} failed:`, error)
        throw error
      }
    }
  }
}

runMigrations()
  .then(async () => {
    console.log('\nAll migrations completed successfully')
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('\nMigration process failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
