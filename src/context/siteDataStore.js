import { createContext } from 'react'
import { profile, education, experience } from '../data/profile'

export const SiteDataContext = createContext({
  profile,
  education,
  experience,
  files: { photo: null, resume: null },
  loaded: true,
  refresh: () => {},
})
