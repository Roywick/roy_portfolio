import pg from 'pg'
import { config } from './config.js'

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
})

pool.on('error', (err) => console.error('Unexpected PostgreSQL error', err))

export const query = (text, params) => pool.query(text, params)
