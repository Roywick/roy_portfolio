import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiLogOut, FiTrash2, FiEdit2, FiPlus, FiCheck } from 'react-icons/fi'
import GlassCard from '../components/UI/GlassCard'
import { api, apiUpload, BASE, getToken, setToken } from '../utils/api'
import { useSiteData } from '../hooks/useSiteData'
import { filterTags } from '../data/projects'

const inputCls =
  'w-full bg-transparent border-b border-black/15 dark:border-white/20 py-2 text-sm focus:border-signal outline-none transition-colors'
const btnCls =
  'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-signal text-white text-xs font-medium hover:bg-signal-dim transition-colors disabled:opacity-60'
const ghostBtn =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 text-xs hover:border-signal hover:text-signal transition-colors'
const labelCls = 'text-xs font-mono text-muted-light dark:text-muted-dark'

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { token } = await api('/auth/login', { method: 'POST', body: form })
      setToken(token)
      onLogin()
    } catch (err) {
      setError(err.status === 0 ? 'Backend is not running.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center container-px">
      <GlassCard className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold mb-1">Admin</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark mb-6">Sign in to manage content.</p>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className={labelCls} htmlFor="a-email">Email</label>
            <input id="a-email" type="email" required className={inputCls} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className={labelCls} htmlFor="a-pass">Password</label>
            <input id="a-pass" type="password" required className={inputCls} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p className="text-sm text-signal">{error}</p>}
          <button className={btnCls} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-xs hover:text-signal">
          <FiArrowLeft size={12} /> Back to site
        </Link>
      </GlassCard>
    </section>
  )
}

const csv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)
const emptyProject = { title: '', tagline: '', description: '', tags: '', stack: '', github: '', live: '', featured: false }

function ProjectsTab({ onAuthError }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyProject)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => api('/projects').then(setItems).catch(() => {}), [])
  useEffect(() => {
    load()
  }, [load])

  const fail = (err) => (err.status === 401 ? onAuthError() : setError(err.message))

  async function save(e) {
    e.preventDefault()
    setError('')
    const body = {
      title: form.title,
      tagline: form.tagline,
      description: form.description,
      tags: csv(form.tags),
      stack: csv(form.stack),
      featured: form.featured,
      links: { github: form.github, live: form.live },
    }
    try {
      if (editId) await api(`/projects/${editId}`, { method: 'PUT', body, auth: true })
      else await api('/projects', { method: 'POST', body, auth: true })
      setForm(emptyProject)
      setEditId(null)
      load()
    } catch (err) {
      fail(err)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this project?')) return
    try {
      await api(`/projects/${id}`, { method: 'DELETE', auth: true })
      load()
    } catch (err) {
      fail(err)
    }
  }

  function edit(p) {
    setEditId(p.id)
    setForm({
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      tags: p.tags.join(', '),
      stack: p.stack.join(', '),
      github: p.links.github || '',
      live: p.links.live || '',
      featured: p.featured,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
      <GlassCard>
        <h2 className="font-mono text-xs text-data mb-4">{editId ? 'Edit project' : 'Add project'}</h2>
        <form onSubmit={save} className="space-y-4">
          <div><label className={labelCls}>Title</label><input required className={inputCls} value={form.title} onChange={set('title')} /></div>
          <div><label className={labelCls}>Tagline</label><input className={inputCls} value={form.tagline} onChange={set('tagline')} /></div>
          <div><label className={labelCls}>Description</label><textarea rows={3} className={`${inputCls} resize-none`} value={form.description} onChange={set('description')} /></div>
          <div>
            <label className={labelCls}>Tags (comma separated)</label>
            <input className={inputCls} value={form.tags} onChange={set('tags')} placeholder="Full-Stack, Backend" />
            <p className="text-[11px] mt-1 text-muted-light dark:text-muted-dark">Filters: {filterTags.slice(1).join(', ')}</p>
          </div>
          <div><label className={labelCls}>Tech stack (comma separated)</label><input className={inputCls} value={form.stack} onChange={set('stack')} placeholder="React, Node.js, PostgreSQL" /></div>
          <div><label className={labelCls}>GitHub URL</label><input className={inputCls} value={form.github} onChange={set('github')} placeholder="https://github.com/Roywick/…" /></div>
          <div><label className={labelCls}>Live URL (optional)</label><input className={inputCls} value={form.live} onChange={set('live')} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
          </label>
          {error && <p className="text-sm text-signal">{error}</p>}
          <div className="flex gap-2">
            <button className={btnCls}><FiCheck size={13} /> {editId ? 'Update' : 'Add'}</button>
            {editId && (
              <button type="button" className={ghostBtn} onClick={() => { setEditId(null); setForm(emptyProject) }}>Cancel</button>
            )}
          </div>
        </form>
      </GlassCard>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-light dark:text-muted-dark">
            No projects in the database yet. Until you add one, the website shows the static list from
            <code> src/data/projects.js</code>.
          </p>
        )}
        {items.map((p) => (
          <GlassCard key={p.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-muted-light dark:text-muted-dark truncate">{p.tags.join(' · ')}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className={ghostBtn} onClick={() => edit(p)}><FiEdit2 size={12} /> Edit</button>
              <button className={ghostBtn} onClick={() => remove(p.id)}><FiTrash2 size={12} /> Delete</button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

function SkillsTab({ onAuthError }) {
  const [groups, setGroups] = useState([])
  const [newGroup, setNewGroup] = useState('')
  const [drafts, setDrafts] = useState({})
  const [error, setError] = useState('')

  const load = useCallback(() => api('/skills').then(setGroups).catch(() => {}), [])
  useEffect(() => {
    load()
  }, [load])

  async function run(fn) {
    setError('')
    try {
      await fn()
      load()
    } catch (err) {
      if (err.status === 401) onAuthError()
      else setError(err.message)
    }
  }

  const draft = (gid) => drafts[gid] || { name: '', level: 70 }
  const setDraft = (gid, patch) => setDrafts({ ...drafts, [gid]: { ...draft(gid), ...patch } })

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-signal">{error}</p>}
      <form
        className="flex gap-3 items-end max-w-md"
        onSubmit={(e) => {
          e.preventDefault()
          run(async () => {
            await api('/skills/groups', { method: 'POST', body: { category: newGroup }, auth: true })
            setNewGroup('')
          })
        }}
      >
        <div className="flex-1">
          <label className={labelCls}>New category</label>
          <input required className={inputCls} value={newGroup} onChange={(e) => setNewGroup(e.target.value)} />
        </div>
        <button className={btnCls}><FiPlus size={13} /> Add</button>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        {groups.map((g) => (
          <GlassCard key={g.id}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs text-data">{g.category}</h3>
              <button className={ghostBtn} onClick={() => window.confirm(`Delete "${g.category}" and its skills?`) && run(() => api(`/skills/groups/${g.id}`, { method: 'DELETE', auth: true }))}>
                <FiTrash2 size={12} />
              </button>
            </div>
            <ul className="space-y-2 mb-4">
              {g.items.map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{s.name}</span>
                  <input
                    type="number" min="0" max="100" defaultValue={s.level}
                    className="w-16 bg-transparent border-b border-black/15 dark:border-white/20 text-sm text-right outline-none focus:border-signal"
                    onBlur={(e) => Number(e.target.value) !== s.level && run(() => api(`/skills/${s.id}`, { method: 'PUT', body: { name: s.name, level: Number(e.target.value) }, auth: true }))}
                  />
                  <button className={ghostBtn} onClick={() => run(() => api(`/skills/${s.id}`, { method: 'DELETE', auth: true }))}><FiTrash2 size={12} /></button>
                </li>
              ))}
            </ul>
            <form
              className="flex gap-2 items-end"
              onSubmit={(e) => {
                e.preventDefault()
                run(async () => {
                  const d = draft(g.id)
                  await api('/skills', { method: 'POST', body: { groupId: g.id, name: d.name, level: Number(d.level) }, auth: true })
                  setDrafts({ ...drafts, [g.id]: { name: '', level: 70 } })
                })
              }}
            >
              <input required placeholder="Skill" className={inputCls} value={draft(g.id).name} onChange={(e) => setDraft(g.id, { name: e.target.value })} />
              <input type="number" min="0" max="100" className={`${inputCls} w-16 text-right`} value={draft(g.id).level} onChange={(e) => setDraft(g.id, { level: e.target.value })} />
              <button className={btnCls}><FiPlus size={13} /></button>
            </form>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

function MessagesTab({ onAuthError }) {
  const [items, setItems] = useState([])
  const load = useCallback(
    () => api('/messages', { auth: true }).then(setItems).catch((e) => e.status === 401 && onAuthError()),
    [onAuthError]
  )
  useEffect(() => {
    load()
  }, [load])

  async function act(fn) {
    try {
      await fn()
      load()
    } catch (err) {
      if (err.status === 401) onAuthError()
    }
  }

  if (items.length === 0) return <p className="text-sm text-muted-light dark:text-muted-dark">No messages yet.</p>

  return (
    <div className="space-y-3 max-w-3xl">
      {items.map((m) => (
        <GlassCard key={m.id} className={m.isRead ? 'opacity-70' : ''}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{m.name} {!m.isRead && <span className="ml-1 text-[10px] font-mono text-signal">NEW</span>}</p>
              <a href={`mailto:${m.email}`} className="text-xs text-data hover:underline">{m.email}</a>
              <p className="text-[11px] text-muted-light dark:text-muted-dark mt-0.5">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className={ghostBtn} onClick={() => act(() => api(`/messages/${m.id}/read`, { method: 'PATCH', body: { isRead: !m.isRead }, auth: true }))}>
                {m.isRead ? 'Mark unread' : 'Mark read'}
              </button>
              <button className={ghostBtn} onClick={() => window.confirm('Delete message?') && act(() => api(`/messages/${m.id}`, { method: 'DELETE', auth: true }))}><FiTrash2 size={12} /></button>
            </div>
          </div>
          <p className="text-sm mt-3 whitespace-pre-wrap break-words">{m.message}</p>
        </GlassCard>
      ))}
    </div>
  )
}

const lines = (arr) => arr.join('\n')
const fromLines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean)

function FileUpload({ label, name, accept, hint, uploadedAt, onDone, onAuthError }) {
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setMsg('')
    try {
      await apiUpload(`/files/${name}`, file)
      setMsg('Uploaded.')
      onDone()
    } catch (err) {
      if (err.status === 401) onAuthError()
      else setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm(`Remove uploaded ${label.toLowerCase()}?`)) return
    try {
      await api(`/files/${name}`, { method: 'DELETE', auth: true })
      setMsg('Removed.')
      onDone()
    } catch (err) {
      if (err.status === 401) onAuthError()
      else setMsg(err.message)
    }
  }

  return (
    <div>
      <p className={labelCls}>{label}</p>
      {name === 'photo' && uploadedAt && (
        <img
          src={`${BASE}/files/photo?v=${uploadedAt}`}
          alt="Current profile"
          className="mt-2 h-24 w-24 rounded-full object-cover border border-signal/40"
        />
      )}
      {name === 'resume' && uploadedAt && (
        <a href={`${BASE}/files/resume?v=${uploadedAt}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-data hover:underline">
          View current resume
        </a>
      )}
      {!uploadedAt && <p className="text-xs mt-1 text-muted-light dark:text-muted-dark">Nothing uploaded yet.</p>}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <label className={`${btnCls} cursor-pointer ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
          {busy ? 'Uploading…' : uploadedAt ? 'Replace' : 'Upload'}
          <input type="file" accept={accept} className="hidden" onChange={pick} />
        </label>
        {uploadedAt && (
          <button type="button" className={ghostBtn} onClick={remove}><FiTrash2 size={12} /> Remove</button>
        )}
      </div>
      <p className="text-[11px] mt-2 text-muted-light dark:text-muted-dark">{hint}</p>
      {msg && <p className="text-xs mt-1 text-data">{msg}</p>}
    </div>
  )
}

function ListEditor({ title, items, setItems, fields, empty }) {
  const update = (i, key, value) => setItems(items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)))
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs text-data">{title}</h3>
        <button type="button" className={ghostBtn} onClick={() => setItems([...items, { ...empty }])}><FiPlus size={12} /> Add</button>
      </div>
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-black/10 dark:border-white/10 p-4 space-y-3">
          {fields.map(([key, label, multiline]) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              {multiline ? (
                <textarea rows={4} className={`${inputCls} resize-none`} value={it[key] || ''} onChange={(e) => update(i, key, e.target.value)} />
              ) : (
                <input className={inputCls} value={it[key] || ''} onChange={(e) => update(i, key, e.target.value)} />
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" className={ghostBtn} onClick={() => move(i, -1)}>Up</button>
            <button type="button" className={ghostBtn} onClick={() => move(i, 1)}>Down</button>
            <button type="button" className={ghostBtn} onClick={() => setItems(items.filter((_, idx) => idx !== i))}><FiTrash2 size={12} /> Remove</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfileTab({ onAuthError }) {
  const { profile, education, experience, files, loaded, refresh } = useSiteData()
  const [form, setForm] = useState(null)
  const [edu, setEdu] = useState([])
  const [exp, setExp] = useState([])
  const [status, setStatus] = useState('')

  // Fill the form once from whatever the site currently shows
  useEffect(() => {
    if (!loaded) return
    setForm((f) =>
      f || {
        name: profile.name,
        brand: profile.brand,
        roles: lines(profile.roles),
        bio: profile.bio,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        whatsappUrl: profile.whatsappUrl,
        github: profile.github,
        githubUsername: profile.githubUsername,
        linkedin: profile.linkedin || '',
        medium: profile.medium || '',
        languages: profile.languages.map((l) => `${l.name} | ${l.level}`).join('\n'),
        hobbies: lines(profile.hobbies),
      }
    )
    setEdu((e) => (e.length ? e : education.map((x) => ({ ...x }))))
    setExp((e) => (e.length ? e : experience.map((x) => ({ ...x }))))
  }, [loaded, profile, education, experience])

  if (!form) return null
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function saveAll(e) {
    e.preventDefault()
    setStatus('Saving…')
    try {
      await api('/site/profile', {
        method: 'PUT',
        auth: true,
        body: {
          ...form,
          roles: fromLines(form.roles),
          hobbies: fromLines(form.hobbies),
          languages: fromLines(form.languages).map((l) => {
            const [name, level = ''] = l.split('|').map((x) => x.trim())
            return { name, level }
          }),
        },
      })
      await api('/site/education', { method: 'PUT', auth: true, body: edu })
      await api('/site/experience', { method: 'PUT', auth: true, body: exp })
      await refresh()
      setStatus('Saved. Refresh the site to see the changes.')
    } catch (err) {
      if (err.status === 401) onAuthError()
      else setStatus(err.message)
    }
  }

  return (
    <form onSubmit={saveAll} className="space-y-6 max-w-3xl">
      <GlassCard>
        <h2 className="font-mono text-xs text-data mb-4">Photo & resume</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <FileUpload label="Profile photo" name="photo" accept="image/jpeg,image/png,image/webp" hint="JPG, PNG or WebP, up to 3 MB. Square photos look best." uploadedAt={files.photo} onDone={refresh} onAuthError={onAuthError} />
          <FileUpload label="Resume" name="resume" accept="application/pdf" hint="PDF, up to 5 MB." uploadedAt={files.resume} onDone={refresh} onAuthError={onAuthError} />
        </div>
      </GlassCard>

      <GlassCard className="space-y-4">
        <h2 className="font-mono text-xs text-data">About me</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Display name</label><input required className={inputCls} value={form.name} onChange={set('name')} /></div>
          <div><label className={labelCls}>Brand (navbar / footer)</label><input required className={inputCls} value={form.brand} onChange={set('brand')} /></div>
        </div>
        <div><label className={labelCls}>Bio</label><textarea rows={5} className={`${inputCls} resize-none`} value={form.bio} onChange={set('bio')} /></div>
        <div><label className={labelCls}>Typing roles in the hero (one per line)</label><textarea rows={6} className={`${inputCls} resize-none`} value={form.roles} onChange={set('roles')} /></div>
        <div><label className={labelCls}>Languages (one per line, format: Name | Level)</label><textarea rows={3} className={`${inputCls} resize-none`} value={form.languages} onChange={set('languages')} /></div>
        <div><label className={labelCls}>Interests (one per line)</label><textarea rows={5} className={`${inputCls} resize-none`} value={form.hobbies} onChange={set('hobbies')} /></div>
      </GlassCard>

      <GlassCard className="space-y-4">
        <h2 className="font-mono text-xs text-data">Contact & links</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Location</label><input className={inputCls} value={form.location} onChange={set('location')} /></div>
          <div><label className={labelCls}>Email</label><input required type="email" className={inputCls} value={form.email} onChange={set('email')} /></div>
          <div><label className={labelCls}>Phone / WhatsApp number</label><input className={inputCls} value={form.phone} onChange={set('phone')} /></div>
          <div><label className={labelCls}>WhatsApp link (https://wa.me/...)</label><input className={inputCls} value={form.whatsappUrl} onChange={set('whatsappUrl')} /></div>
          <div><label className={labelCls}>GitHub URL</label><input className={inputCls} value={form.github} onChange={set('github')} /></div>
          <div><label className={labelCls}>GitHub username</label><input className={inputCls} value={form.githubUsername} onChange={set('githubUsername')} /></div>
          <div><label className={labelCls}>LinkedIn URL (empty = hidden)</label><input className={inputCls} value={form.linkedin} onChange={set('linkedin')} /></div>
          <div><label className={labelCls}>Medium URL (empty = hidden)</label><input className={inputCls} value={form.medium} onChange={set('medium')} /></div>
        </div>
      </GlassCard>

      <GlassCard>
        <ListEditor
          title="Education (most recent first)"
          items={edu}
          setItems={setEdu}
          empty={{ degree: '', institution: '', meta: '', period: '' }}
          fields={[['degree', 'Degree / certificate'], ['institution', 'Institution'], ['meta', 'Details (e.g. GPA)'], ['period', 'Period (e.g. 2023 — 2026)']]}
        />
      </GlassCard>

      <GlassCard>
        <ListEditor
          title="Experience"
          items={exp}
          setItems={setExp}
          empty={{ title: '', organization: '', period: '', description: '' }}
          fields={[['title', 'Title'], ['organization', 'Organization / area'], ['period', 'Period (optional)'], ['description', 'Description', true]]}
        />
      </GlassCard>

      <div className="flex items-center gap-3">
        <button className={btnCls}><FiCheck size={13} /> Save profile</button>
        {status && <p className="text-sm text-data">{status}</p>}
      </div>
    </form>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(Boolean(getToken()))
  const [tab, setTab] = useState('profile')

  const logout = useCallback(() => {
    setToken(null)
    setAuthed(false)
  }, [])

  // Verify a stored token is still valid
  useEffect(() => {
    if (authed) api('/auth/me', { auth: true }).catch((e) => e.status === 401 && logout())
  }, [authed, logout])

  if (!authed) return <Login onLogin={() => setAuthed(true)} />

  const tabs = [['profile', 'Profile'], ['projects', 'Projects'], ['skills', 'Skills'], ['messages', 'Messages']]

  return (
    <section className="container-px py-10 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-semibold">Admin panel</h1>
        <div className="flex gap-2">
          <Link to="/" className={ghostBtn}><FiArrowLeft size={12} /> Site</Link>
          <button className={ghostBtn} onClick={logout}><FiLogOut size={12} /> Log out</button>
        </div>
      </div>
      <div className="flex gap-2 mb-8">
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-colors ${tab === key ? 'bg-signal text-white border-signal' : 'border-black/10 dark:border-white/15 hover:border-signal hover:text-signal'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'profile' && <ProfileTab onAuthError={logout} />}
      {tab === 'projects' && <ProjectsTab onAuthError={logout} />}
      {tab === 'skills' && <SkillsTab onAuthError={logout} />}
      {tab === 'messages' && <MessagesTab onAuthError={logout} />}
    </section>
  )
}
