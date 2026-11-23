import { Router } from 'express'
import { config } from '../config.js'

const router = Router()
const TTL_MS = 10 * 60 * 1000
let cache = { at: 0, data: null }

async function gh(path) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'roywick-portfolio' }
  if (config.githubToken) headers.Authorization = `Bearer ${config.githubToken}`
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
  return res.json()
}

// Public: cached live stats so the browser never hits GitHub's rate limit
router.get('/stats', async (_req, res) => {
  if (cache.data && Date.now() - cache.at < TTL_MS) return res.json(cache.data)
  try {
    const u = encodeURIComponent(config.githubUsername)
    const [profile, repos] = await Promise.all([
      gh(`/users/${u}`),
      gh(`/users/${u}/repos?per_page=100&sort=updated`),
    ])
    const data = {
      repos: profile.public_repos,
      followers: profile.followers,
      stars: repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
    }
    cache = { at: Date.now(), data }
    res.json(data)
  } catch (err) {
    // Serve stale data if we have it; otherwise let the frontend fall back
    if (cache.data) return res.json(cache.data)
    res.status(502).json({ error: err.message })
  }
})

export default router
