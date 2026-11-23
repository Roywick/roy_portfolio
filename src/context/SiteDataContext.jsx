import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteDataContext } from './siteDataStore'
import { profile as defaultProfile, education as defaultEducation, experience as defaultExperience } from '../data/profile'
import { api, BASE } from '../utils/api'

// Static data from src/data/profile.js is the default. When the backend is running and has
// saved content (edited in /admin), that content replaces the defaults.
export function SiteDataProvider({ children }) {
  const [remote, setRemote] = useState(undefined) // undefined = still loading, null = backend unavailable

  const refresh = useCallback(async () => {
    try {
      setRemote(await api('/site'))
    } catch {
      setRemote(null) // backend not available: keep static data
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(() => {
    const files = remote?.files || { photo: null, resume: null }
    const profile = {
      ...defaultProfile,
      ...(remote?.profile || {}),
      photoUrl: files.photo ? `${BASE}/files/photo?v=${files.photo}` : defaultProfile.photoUrl,
      resumeUrl: files.resume ? `${BASE}/files/resume?v=${files.resume}` : defaultProfile.resumeUrl,
    }
    return {
      profile,
      education: remote?.education?.length ? remote.education : defaultEducation,
      experience: remote?.experience?.length ? remote.experience : defaultExperience,
      files,
      loaded: remote !== undefined,
      refresh,
    }
  }, [remote, refresh])

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}
