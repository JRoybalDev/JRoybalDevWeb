import { FiGithub, FiExternalLink } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import CloudinaryImage from './CloudinaryImage';

interface ProjectCardProps {
    thumbnail?: string
    name: string
    description: string
    tags: string[] | string
    projectType: string
    category: string
    githubUrl?: string
    liveUrl?: string
}

export default function ProjectCard({
    thumbnail,
    name,
    description,
    tags,
    projectType,
    category,
    githubUrl,
    liveUrl,
}: ProjectCardProps) {
    const normalizedTags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

    return (
        <div className="feature-card flex flex-col gap-4 h-full">
            {/* Thumbnail */}
            <div
                className="w-full h-40 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ background: 'var(--foam)', border: '1px solid var(--card-border)' }}
            >
                {thumbnail ? (
                    <CloudinaryImage
                        src={thumbnail}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-xs" style={{ color: 'var(--muted-soft)' }}>
                        No preview
                    </span>
                )}
            </div>

            {/* Category eyebrow */}
            <p
                className="text-xs font-bold uppercase tracking-[0.15em]"
                style={{ color: 'var(--accent)' }}
            >
                {projectType}
            </p>

            {/* Name & description */}
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {name}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-soft)' }}>
                    {description}
                </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {normalizedTags.map((tag) => (
                    <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                            background: 'rgba(156, 114, 75, 0.10)',
                            color: 'var(--muted)',
                            border: '1px solid var(--card-border)',
                        }}
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Links — only render if url exists */}
            {(githubUrl || liveUrl) && (
                <div className="flex items-center gap-3 mt-auto pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                    {githubUrl && (
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs transition-all duration-200 hover:-translate-y-px"
                            style={{ color: 'var(--muted)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-strong)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                        >
                            <FiGithub size={14} />
                            Source
                        </a>
                    )}
                    {liveUrl && (
                        <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs transition-all duration-200 hover:-translate-y-px"
                            style={{ color: 'var(--muted)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-strong)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                        >
                            <FiExternalLink size={14} />
                            Live site
                        </a>
                    )
                    }
                </div >
            )}

        </div >
    )
}