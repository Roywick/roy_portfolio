import 'dotenv/config'

function required(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required environment variable: ${name} (see server/.env.example)`)
    process.exit(1)
  }
  return value
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  databaseUrl: required('DATABASE_URL'),
  databaseSsl: process.env.DATABASE_SSL === 'true',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  githubUsername: process.env.GITHUB_USERNAME || 'Roywick',
  githubToken: process.env.GITHUB_TOKEN || '',
}
