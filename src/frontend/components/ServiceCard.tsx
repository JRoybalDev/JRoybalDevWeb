import React from 'react'
import type { IconType } from 'react-icons'

interface ServiceCardProps {
  icon: IconType
  title: string
  description: string
}

export default function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <Icon size={18} />
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
        {title}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-soft)' }}>
        {description}
      </p>
    </div>
  )
}