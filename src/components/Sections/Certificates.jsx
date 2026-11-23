import { motion } from 'framer-motion'
import { FiAward } from 'react-icons/fi'
import SectionHeading from '../UI/SectionHeading'
import GlassCard from '../UI/GlassCard'
import { certificates } from '../../data/profile'

export default function Certificates() {
  return (
    <section id="certificates" className="container-px py-24">
      <SectionHeading
        tab="06 — Certificates"
        title="Certificates & achievements"
        subtitle="Courses and recognitions along the way."
      />

      <div className="grid sm:grid-cols-2 gap-6">
        {certificates.map((cert, i) => (
          <motion.div
            key={cert.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <GlassCard className="h-full">
              <div className="flex items-start gap-4">
                <span className="h-10 w-10 shrink-0 rounded-full glass grid place-items-center text-signal">
                  <FiAward size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-lg font-semibold">{cert.title}</h3>
                    {cert.status && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-data/40 text-data">
                        {cert.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-data font-mono mt-1">{cert.issuer}</p>
                  <p className="text-sm text-muted-light dark:text-muted-dark mt-2">
                    {cert.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
