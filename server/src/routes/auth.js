import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { query } from '../db.js'
import { config } from '../config.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError, str } from '../utils.js'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
})

// Hash used to keep response time similar when the email does not exist
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12)

router.post('/login', loginLimiter, async (req, res) => {
  const email = str(req.body?.email, 200, { required: true, field: 'email' }).toLowerCase()
  const password = str(req.body?.password, 200, { required: true, field: 'password' })

  const { rows } = await query('SELECT id, email, password_hash FROM admins WHERE email = $1', [email])
  const admin = rows[0]
  const ok = await bcrypt.compare(password, admin ? admin.password_hash : DUMMY_HASH)
  if (!admin || !ok) throw new HttpError(401, 'Wrong email or password')

  const token = jwt.sign({ sub: admin.id, email: admin.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
  res.json({ token, email: admin.email })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ email: req.admin.email })
})

export default router
