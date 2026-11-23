import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError, intId, str } from '../utils.js'

const router = Router()

const level = (v) => {
  const n = Number(v)
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new HttpError(400, 'level must be 0-100')
  return n
}

// Public: same shape as src/data/skills.js -> [{ id, category, items: [{ id, name, level }] }]
router.get('/', async (_req, res) => {
  const { rows } = await query(
    `SELECT g.id AS gid, g.category, s.id AS sid, s.name, s.level
       FROM skill_groups g LEFT JOIN skills s ON s.group_id = g.id
      ORDER BY g.sort_order, g.id, s.sort_order, s.id`
  )
  const groups = new Map()
  for (const r of rows) {
    if (!groups.has(r.gid)) groups.set(r.gid, { id: r.gid, category: r.category, items: [] })
    if (r.sid) groups.get(r.gid).items.push({ id: r.sid, name: r.name, level: r.level })
  }
  res.json([...groups.values()])
})

router.post('/groups', requireAuth, async (req, res) => {
  const category = str(req.body?.category, 80, { required: true, field: 'category' })
  const { rows } = await query(
    `INSERT INTO skill_groups (category, sort_order)
     VALUES ($1, COALESCE((SELECT MAX(sort_order)+1 FROM skill_groups), 0)) RETURNING id, category`,
    [category]
  )
  res.status(201).json({ ...rows[0], items: [] })
})

router.put('/groups/:id', requireAuth, async (req, res) => {
  const category = str(req.body?.category, 80, { required: true, field: 'category' })
  const { rows } = await query(
    'UPDATE skill_groups SET category=$1 WHERE id=$2 RETURNING id, category',
    [category, intId(req.params.id)]
  )
  if (!rows[0]) throw new HttpError(404, 'Group not found')
  res.json(rows[0])
})

router.delete('/groups/:id', requireAuth, async (req, res) => {
  const { rowCount } = await query('DELETE FROM skill_groups WHERE id=$1', [intId(req.params.id)])
  if (!rowCount) throw new HttpError(404, 'Group not found')
  res.status(204).end()
})

router.post('/', requireAuth, async (req, res) => {
  const groupId = intId(req.body?.groupId)
  const name = str(req.body?.name, 80, { required: true, field: 'name' })
  const lvl = level(req.body?.level)
  const g = await query('SELECT 1 FROM skill_groups WHERE id=$1', [groupId])
  if (!g.rowCount) throw new HttpError(404, 'Group not found')
  const { rows } = await query(
    `INSERT INTO skills (group_id, name, level, sort_order)
     VALUES ($1,$2,$3, COALESCE((SELECT MAX(sort_order)+1 FROM skills WHERE group_id=$1), 0))
     RETURNING id, name, level`,
    [groupId, name, lvl]
  )
  res.status(201).json(rows[0])
})

router.put('/:id', requireAuth, async (req, res) => {
  const name = str(req.body?.name, 80, { required: true, field: 'name' })
  const lvl = level(req.body?.level)
  const { rows } = await query(
    'UPDATE skills SET name=$1, level=$2 WHERE id=$3 RETURNING id, name, level',
    [name, lvl, intId(req.params.id)]
  )
  if (!rows[0]) throw new HttpError(404, 'Skill not found')
  res.json(rows[0])
})

router.delete('/:id', requireAuth, async (req, res) => {
  const { rowCount } = await query('DELETE FROM skills WHERE id=$1', [intId(req.params.id)])
  if (!rowCount) throw new HttpError(404, 'Skill not found')
  res.status(204).end()
})

export default router
