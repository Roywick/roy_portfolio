import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError, intId, str } from '../utils.js'

export const contactRouter = Router()
export const messagesRouter = Router()

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' },
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public: contact form submission
contactRouter.post('/', contactLimiter, async (req, res) => {
  // Honeypot: real users never fill this hidden field, bots do
  if (req.body?.website) return res.status(201).json({ ok: true })

  const name = str(req.body?.name, 100, { required: true, field: 'name' })
  const email = str(req.body?.email, 200, { required: true, field: 'email' })
  const message = str(req.body?.message, 5000, { required: true, field: 'message' })
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'email is not valid')

  await query('INSERT INTO messages (name, email, message, ip) VALUES ($1,$2,$3,$4)', [
    name,
    email,
    message,
    req.ip,
  ])
  res.status(201).json({ ok: true })
})

// Admin only
messagesRouter.use(requireAuth)

messagesRouter.get('/', async (_req, res) => {
  const { rows } = await query(
    'SELECT id, name, email, message, is_read AS "isRead", created_at AS "createdAt" FROM messages ORDER BY created_at DESC LIMIT 500'
  )
  res.json(rows)
})

messagesRouter.patch('/:id/read', async (req, res) => {
  const isRead = req.body?.isRead !== false
  const { rowCount } = await query('UPDATE messages SET is_read=$1 WHERE id=$2', [
    isRead,
    intId(req.params.id),
  ])
  if (!rowCount) throw new HttpError(404, 'Message not found')
  res.json({ ok: true })
})

messagesRouter.delete('/:id', async (req, res) => {
  const { rowCount } = await query('DELETE FROM messages WHERE id=$1', [intId(req.params.id)])
  if (!rowCount) throw new HttpError(404, 'Message not found')
  res.status(204).end()
})
