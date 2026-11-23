export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const str = (v, max, { required = false, field = 'value' } = {}) => {
  const s = typeof v === 'string' ? v.trim() : ''
  if (required && !s) throw new HttpError(400, `${field} is required`)
  if (s.length > max) throw new HttpError(400, `${field} must be at most ${max} characters`)
  return s
}

export const strList = (v, field) => {
  if (v === undefined || v === null) return []
  if (!Array.isArray(v)) throw new HttpError(400, `${field} must be a list`)
  return v
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean)
    .slice(0, 30)
}

export const url = (v, field) => {
  const s = str(v, 500, { field })
  if (!s) return null
  try {
    const u = new URL(s)
    if (!['http:', 'https:'].includes(u.protocol)) throw new Error()
    return s
  } catch {
    throw new HttpError(400, `${field} must be a valid http(s) URL`)
  }
}

export const intId = (v) => {
  const n = Number(v)
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'Invalid id')
  return n
}
