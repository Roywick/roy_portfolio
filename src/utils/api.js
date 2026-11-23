// Small fetch wrapper for the portfolio backend (server/).
// Dev: Vite proxies /api -> http://localhost:5000. Prod: set VITE_API_URL.
export const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const TOKEN_KEY = 'admin_token'

export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

export async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    const err = new Error('Server unreachable')
    err.status = 0
    throw err
  }

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON response (e.g. dev server fallback when backend is down) */
  }
  if (!res.ok || data === null) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    err.status = res.ok ? 502 : res.status
    throw err
  }
  return data
}

// Upload a raw file (photo / resume) as the request body
export async function apiUpload(path, file) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream', Authorization: `Bearer ${getToken()}` },
      body: file,
    })
  } catch {
    const err = new Error('Server unreachable')
    err.status = 0
    throw err
  }
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`
    try {
      msg = (await res.json()).error || msg
    } catch {
      /* ignore */
    }
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return res.json()
}
