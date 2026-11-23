import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeading from '../UI/SectionHeading'
import ProjectCard from '../UI/ProjectCard'
import { projects as staticProjects, filterTags } from '../../data/projects'
import { api } from '../../utils/api'

export default function Projects() {
  const [activeTag, setActiveTag] = useState('All')
  const [projects, setProjects] = useState(staticProjects)

  // Use backend data when the API is reachable and has projects; otherwise keep the static list
  useEffect(() => {
    let cancelled = false
    api('/projects')
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setProjects(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (activeTag === 'All') return projects
    return projects.filter((p) => p.tags.includes(activeTag))
  }, [activeTag, projects])

  return (
    <section id="projects" className="container-px py-24">
      <SectionHeading
        tab="04 — Projects"
        title="Selected work"
        subtitle="A few things I've built, from web apps to experiments."
      />

      <div className="flex flex-wrap gap-2 mb-10">
        {filterTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            data-cursor-hover
            className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-colors ${
              activeTag === tag
                ? 'bg-signal text-white border-signal'
                : 'border-black/10 dark:border-white/15 hover:border-signal hover:text-signal'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
