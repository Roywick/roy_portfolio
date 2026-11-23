import { useContext } from 'react'
import { SiteDataContext } from '../context/siteDataStore'

export function useSiteData() {
  return useContext(SiteDataContext)
}
