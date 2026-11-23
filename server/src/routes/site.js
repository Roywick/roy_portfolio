import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError, str } from '../utils.js'

const router = Router()
const KEYS = ['profile', 'education', 'experience']

const list = (v, field, max = 30) => {
  if (v === undefined || v === null) return []
  if (!Array.isArray(v)) throw new HttpError(400, `${field} must be a list`)
  if (v.length > max) throw new HttpError(400, `${field} has too many items`)
  return v
}

const optUrl = (v, field) => {
  const s = str(v, 500, { field })
  if (!s) return ''
  try {
    const u = new URL(s)
    if (!['http:', 'https:'].includes(u.protocol)) throw new Error()
    return s
  } catch {
    throw new HttpError(400, `${field} must be a valid http(s) URL`)
  }
}

const cleanProfile = (b = {}) => ({
  name: str(b.name, 100, { required: true, field: 'name' }),
  brand: str(b.brand, 40, { required: true, field: 'brand' }),
  roles: list(b.roles, 'roles').map((r) => str(r, 80, { field: 'role' })).filter(Boolean),
  bio: str(b.bio, 1500, { field: 'bio' }),
  location: str(b.location, 150, { field: 'location' }),
  email: str(b.email, 200, { required: true, field: 'email' }),
  phone: str(b.phone, 40, { field: 'phone' }),
  whatsappUrl: optUrl(b.whatsappUrl, 'WhatsApp link'),
  github: optUrl(b.github, 'GitHub link'),
  githubUsername: str(b.githubUsername, 60, { field: 'GitHub username' }),
  linkedin: optUrl(b.linkedin, 'LinkedIn link'),
  medium: optUrl(b.medium, 'Medium link'),
  languages: list(b.languages, 'languages', 15)
    .map((l) => ({ name: str(l?.name, 40, { field: 'language' }), level: str(l?.level, 40, { field: 'level' }) }))
    .filter((l) => l.name),
  hobbies: list(b.hobbies, 'interests').map((h) => str(h, 80, { field: 'interest' })).filter(Boolean),
})

const cleanEducation = (b) =>
  list(b, 'education', 15)
    .map((e) => ({
      degree: str(e?.degree, 160, { field: 'degree' }),
      institution: str(e?.institution, 160, { field: 'institution' }),
      meta: str(e?.meta, 120, { field: 'details' }),
      period: str(e?.period, 60, { field: 'period' }),
    }))
    .filter((e) => e.degree)

const cleanExperience = (b) =>
  list(b, 'experience', 20)
    .map((e) => ({
      title: str(e?.title, 120, { field: 'title' }),
      organization: str(e?.organization, 160, { field: 'organization' }),
      period: str(e?.period, 60, { field: 'period' }),
      description: str(e?.description, 1500, { field: 'description' }),
    }))
    .filter((e) => e.title)

const cleaners = {
  profile: cleanProfile,
  education: cleanEducation,
  experience: cleanExperience,
}

// Public: saved overrides (null = use the defaults built into the frontend)
router.get('/', async (_req, res) => {
  const [content, files] = await Promise.all([
    query('SELECT key, value FROM site_content'),
    query('SELECT name, updated_at FROM uploads'),
  ])
  const out = { profile: null, education: null, experience: null, files: { photo: null, resume: null } }
  for (const r of content.rows) out[r.key] = r.value
  for (const f of files.rows) out.files[f.name] = f.updated_at.getTime()
  res.set('Cache-Control', 'no-cache')
  res.json(out)
})

router.put('/:key', requireAuth, async (req, res) => {
  const { key } = req.params
  if (!KEYS.includes(key)) throw new HttpError(404, 'Unknown content key')
  const value = cleaners[key](req.body)
  await query(
    `INSERT INTO site_content (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  )
  res.json(value)
})

// Revert one block to the defaults from src/data/profile.js
router.delete('/:key', requireAuth, async (req, res) => {
  if (!KEYS.includes(req.params.key)) throw new HttpError(404, 'Unknown content key')
  await query('DELETE FROM site_content WHERE key = $1', [req.params.key])
  res.status(204).end()
})

export default router
