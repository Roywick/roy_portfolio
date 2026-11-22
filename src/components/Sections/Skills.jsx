import { motion } from 'framer-motion'
import SectionHeading from '../UI/SectionHeading'
import GlassCard from '../UI/GlassCard'
import { skillGroups } from '../../data/skills'

function SkillBar({ name, level, delay }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span>{name}</span>
        <span className="font-mono text-xs text-muted-light dark:text-muted-dark">{level}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-signal to-data"
        />
      </div>
    </div>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="container-px py-24">
      <SectionHeading
        tab="03 — Skills"
        title="Tools I build with"
        subtitle="Proficiency is self-assessed and grows every sprint."
      />

      <div className="grid sm:grid-cols-2 gap-6">
        {skillGroups.map((group, gi) => (
          <motion.div
            key={group.category}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: gi * 0.08 }}
          >
            <GlassCard className="h-full">
              <h3 className="font-mono text-xs text-data mb-6">{group.category}</h3>
              <div className="space-y-5">
                {group.items.map((skill, i) => (
                  <SkillBar key={skill.name} {...skill} delay={i * 0.06} />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
