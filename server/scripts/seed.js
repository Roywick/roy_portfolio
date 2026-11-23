// Creates the admin account and imports the skills from src/data/skills.js.
// Projects are NOT seeded on purpose: add your real projects from the admin panel.
import bcrypt from 'bcryptjs'
import { pool } from '../src/db.js'
import { skillGroups } from '../../src/data/skills.js'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

async function main() {
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first')
  }
  if (password.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters')

  const hash = await bcrypt.hash(password, 12)
  await pool.query(
    `INSERT INTO admins (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email.toLowerCase(), hash]
  )
  console.log(`Admin ready: ${email.toLowerCase()}`)

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM skill_groups')
  if (rows[0].n > 0) {
    console.log('Skills already exist, skipping skills import.')
    return
  }
  for (const [gi, group] of skillGroups.entries()) {
    const g = await pool.query(
      'INSERT INTO skill_groups (category, sort_order) VALUES ($1, $2) RETURNING id',
      [group.category, gi]
    )
    for (const [si, item] of group.items.entries()) {
      await pool.query(
        'INSERT INTO skills (group_id, name, level, sort_order) VALUES ($1, $2, $3, $4)',
        [g.rows[0].id, item.name, item.level, si]
      )
    }
  }
  console.log('Skills imported.')
}

try {
  await main()
} catch (err) {
  console.error('Seed failed:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
