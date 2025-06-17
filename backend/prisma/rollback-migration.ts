import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

console.log('Starting rollback script...')

const migrationsDir = join(__dirname, 'migrations')
const migrationDirs = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .sort()
  .reverse() // Reverse to rollback in opposite order

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

async function removeMigrationRecord(migrationName: string) {
  await prisma.$executeRaw`
    DELETE FROM "_prisma_migrations" WHERE migration_name = ${migrationName}
  `
}

function generateRollbackSql(sql: string): string {
  const statements = sql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)
    .reverse() // Reverse the order of statements

  const rollbackStatements = statements
    .map((statement) => {
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE "([^"]+)"/)?.[1]
        return `DROP TABLE IF EXISTS "${tableName}" CASCADE;`
      } else if (statement.includes('ALTER TABLE')) {
        if (statement.includes('DROP DEFAULT')) {
          const tableName = statement.match(/ALTER TABLE "([^"]+)"/)?.[1]
          const columnName = statement.match(/ALTER COLUMN "([^"]+)"/)?.[1]
          return `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET DEFAULT true;`
        }
        // Add more ALTER TABLE cases as needed
      } else if (statement.includes('CREATE INDEX')) {
        const indexName = statement.match(/CREATE INDEX "([^"]+)"/)?.[1]
        return `DROP INDEX IF EXISTS "${indexName}";`
      } else if (statement.includes('ADD CONSTRAINT')) {
        const constraintName = statement.match(/CONSTRAINT "([^"]+)"/)?.[1]
        return `ALTER TABLE "Image" DROP CONSTRAINT IF EXISTS "${constraintName}";`
      }
      return null
    })
    .filter(Boolean)

  return rollbackStatements.join('\n')
}

async function runRollbacks() {
  for (const dir of migrationDirs) {
    try {
      console.log(`\nRolling back migration: ${dir}`)
      const sqlPath = join(migrationsDir, dir, 'migration.sql')

      try {
        const sql = readFileSync(sqlPath, 'utf8')
        const rollbackSql = generateRollbackSql(sql)
        if (rollbackSql) {
          await executeSqlStatements(rollbackSql)
          await removeMigrationRecord(dir)
          console.log(`Rollback ${dir} completed successfully`)
        } else {
          console.log(`Could not generate rollback SQL for ${dir}`)
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log(`No migration file found for ${dir}`)
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error(`Rollback ${dir} failed:`, error)
      throw error
    }
  }
}

runRollbacks()
  .then(async () => {
    console.log('\nAll rollbacks completed successfully')
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('\nRollback process failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
