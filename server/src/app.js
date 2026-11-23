import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config.js'
import authRouter from './routes/auth.js'
import projectsRouter from './routes/projects.js'
import skillsRouter from './routes/skills.js'
import githubRouter from './routes/github.js'
import siteRouter from './routes/site.js'
import filesRouter from './routes/files.js'
import { contactRouter, messagesRouter } from './routes/messages.js'

export const app = express()

app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: config.corsOrigins }))
app.use(express.json({ limit: '50kb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/skills', skillsRouter)
app.use('/api/contact', contactRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/github', githubRouter)
app.use('/api/site', siteRouter)
app.use('/api/files', filesRouter)

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' })
  if (err.status) return res.status(err.status).json({ error: err.message })
  if (err.code === '23505') return res.status(409).json({ error: 'Already exists' })
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})
