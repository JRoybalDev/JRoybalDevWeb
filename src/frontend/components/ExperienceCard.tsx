import React from 'react';

interface ExperienceCardProps {
  year: string;
  title: string;
  subtitle: string;
  bullets: string[];
}

export default function ExperienceCard({ year, title, subtitle, bullets }: ExperienceCardProps) {
  return (
    <div className="feature-card flex flex-col gap-3 h-full">
      {/* Year */}
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        {year}
      </p>

      {/* Title & subtitle */}
      <div>
        <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
          {title}
        </h3>
        <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
          {subtitle}
        </p>
      </div>

      {/* Divider */}
      <div className="w-full h-px" style={{ background: 'var(--card-border)' }} />

      {/* Bullet points */}
      <ul className="flex flex-col gap-2">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--muted-soft)' }}>
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-soft)' }} />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}