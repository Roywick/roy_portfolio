import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError, intId, str, strList, url } from '../utils.js'

const router = Router()

const toProject = (r) => ({
  id: r.id,
  title: r.title,
  tagline: r.tagline,
  description: r.description,
  tags: r.tags,
  stack: r.stack,
  featured: r.featured,
  sortOrder: r.sort_order,
  links: { github: r.github_url, live: r.live_url },
})

function parseBody(b = {}) {
  return {
    title: str(b.title, 120, { required: true, field: 'title' }),
    tagline: str(b.tagline, 160, { field: 'tagline' }),
    description: str(b.description, 1200, { field: 'description' }),
    tags: strList(b.tags, 'tags'),
    stack: strList(b.stack, 'stack'),
    featured: Boolean(b.featured),
    github: url(b.links?.github ?? b.github, 'GitHub link'),
    live: url(b.links?.live ?? b.live, 'Live link'),
    sortOrder: Number.isInteger(b.sortOrder) ? b.sortOrder : 0,
  }
}

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM projects ORDER BY sort_order ASC, id ASC')
  res.json(rows.map(toProject))
})

router.post('/', requireAuth, async (req, res) => {
  const p = parseBody(req.body)
  const { rows } = await query(
    `INSERT INTO projects (title, tagline, description, tags, stack, featured, github_url, live_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [p.title, p.tagline, p.description, p.tags, p.stack, p.featured, p.github, p.live, p.sortOrder]
  )
  res.status(201).json(toProject(rows[0]))
})

router.put('/:id', requireAuth, async (req, res) => {
  const id = intId(req.params.id)
  const p = parseBody(req.body)
  const { rows } = await query(
    `UPDATE projects SET title=$1, tagline=$2, description=$3, tags=$4, stack=$5,
       featured=$6, github_url=$7, live_url=$8, sort_order=$9 WHERE id=$10 RETURNING *`,
    [p.title, p.tagline, p.description, p.tags, p.stack, p.featured, p.github, p.live, p.sortOrder, id]
  )
  if (!rows[0]) throw new HttpError(404, 'Project not found')
  res.json(toProject(rows[0]))
})

router.delete('/:id', requireAuth, async (req, res) => {
  const { rowCount } = await query('DELETE FROM projects WHERE id = $1', [intId(req.params.id)])
  if (!rowCount) throw new HttpError(404, 'Project not found')
  res.status(204).end()
})

export default router
