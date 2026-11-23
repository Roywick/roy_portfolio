import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pool } from '../src/db.js'

const sql = readFileSync(fileURLToPath(new URL('../schema.sql', import.meta.url)), 'utf8')

try {
  await pool.query(sql)
  console.log('Database tables are ready.')
} catch (err) {
  console.error('Failed to create tables:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
