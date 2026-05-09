import { FiCoffee } from 'react-icons/fi'

interface Stat {
    value: string
    label: string
}

interface HeroCardProps {
  projectCount?: number
}

export default function HeroCard({ projectCount = 0 }: HeroCardProps) {
  const stats: Stat[] = [
    { value: '6+', label: 'Years exp.' },
    { value: `${projectCount}+`, label: 'Projects' },
    { value: '100%', label: 'Remote' },
    { value: '3', label: 'Services' },
  ]

  return (
    <div className="hero-card w-full">
      <div className="hero-card-inner bg-[--surface] theme-transition">

        {/* Icon */}
        <div className="hero-icon theme-transition">
          <FiCoffee size={20} />
        </div>

        {/* Heading */}
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Currently available
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-soft)' }}>
            Open to new contracts &amp; consulting
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: 'var(--card-border)' }} />

        {/* Stats grid */}
        <div className="hero-stats">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="hero-stat flex flex-col gap-0.5 p-3 rounded-2xl theme-transition"
              style={{
                background: 'var(--foam)',
                border: '1px solid var(--card-border)',
              }}
            >
              <span
                className="text-xl font-semibold leading-none"
                style={{ color: 'var(--accent-strong)' }}
              >
                {value}
              </span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Availability indicator */}
        <div
          className="hero-status flex items-center gap-2 text-xs rounded-full px-3 py-1.5 w-fit theme-transition"
          style={{ background: 'rgba(156, 114, 75, 0.10)', color: 'var(--muted)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-600"
          />
          Available for new work
        </div>

      </div>
    </div>
  )
}
