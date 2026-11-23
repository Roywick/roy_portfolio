import { Router } from 'express'
import express from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError } from '../utils.js'

const router = Router()

const startsWith = (buf, bytes, offset = 0) => bytes.every((b, i) => buf[offset + i] === b)

// Only allow what we expect, checked by file signature (not just the header the client sends)
const FILES = {
  photo: {
    limit: '3mb',
    types: ['image/jpeg', 'image/png', 'image/webp'],
    detect: (b) => {
      if (startsWith(b, [0xff, 0xd8, 0xff])) return 'image/jpeg'
      if (startsWith(b, [0x89, 0x50, 0x4e, 0x47])) return 'image/png'
      if (startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp'
      return null
    },
  },
  resume: {
    limit: '5mb',
    types: ['application/pdf'],
    detect: (b) => (startsWith(b, [0x25, 0x50, 0x44, 0x46]) ? 'application/pdf' : null),
  },
}

function fileConfig(req) {
  const cfg = FILES[req.params.name]
  if (!cfg) throw new HttpError(404, 'Unknown file')
  return cfg
}

// Public
router.get('/:name', async (req, res) => {
  fileConfig(req)
  const { rows } = await query('SELECT mime, data FROM uploads WHERE name = $1', [req.params.name])
  if (!rows[0]) throw new HttpError(404, 'File not uploaded')
  res.set('Content-Type', rows[0].mime)
  res.set('Cache-Control', 'public, max-age=300')
  if (req.params.name === 'resume') res.set('Content-Disposition', 'inline; filename="resume.pdf"')
  res.send(rows[0].data)
})

// Admin: raw file body (Content-Type = file type)
router.put(
  '/:name',
  requireAuth,
  (req, res, next) => express.raw({ type: '*/*', limit: fileConfig(req).limit })(req, res, next),
  async (req, res) => {
    const cfg = fileConfig(req)
    const body = req.body
    if (!Buffer.isBuffer(body) || body.length === 0) throw new HttpError(400, 'No file received')
    const mime = cfg.detect(body)
    if (!mime) throw new HttpError(400, `Invalid file type. Allowed: ${cfg.types.join(', ')}`)
    await query(
      `INSERT INTO uploads (name, mime, data) VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data, updated_at = now()`,
      [req.params.name, mime, body]
    )
    res.json({ ok: true })
  }
)

router.delete('/:name', requireAuth, async (req, res) => {
  fileConfig(req)
  await query('DELETE FROM uploads WHERE name = $1', [req.params.name])
  res.status(204).end()
})

export default router
