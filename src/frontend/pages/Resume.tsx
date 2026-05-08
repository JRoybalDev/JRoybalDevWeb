import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TimelineItem } from './Experience';
import type { Project } from './HomePage';
import Button from '@frontend/components/Button';
import { useReactToPrint } from 'react-to-print';

const skillCategories: Record<string, string[]> = {
  'Frontend': ['React', 'React Router', 'Next.js', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'TailwindCSS', 'DaisyUI', 'Framer Motion', 'Sass', 'Less', 'Webpack', 'Vite'],
  'Backend': ['Node.js', 'Bun', 'Hono', 'Express', 'Python', 'Go', 'Django', 'Flask', 'NestJS', 'GraphQL', 'REST API', 'Ruby on Rails', 'PHP', 'Java', 'Spring Boot', 'C#', '.NET', 'Resend'],
  'Database Management': ['PostgreSQL', 'Vercel Postgres', 'Drizzle ORM', 'MongoDB', 'SQLite', 'MySQL', 'Redis', 'SQL', 'NoSQL', 'Prisma', 'TypeORM', 'Mongoose', 'Sanity'],
  'CyberSecurity/SecOps': ['OWASP', 'Penetration Testing', 'Security Audits', 'Threat Modeling', 'Encryption', 'Authentication', 'Authorization', 'OAuth', 'JWT', 'SSO', 'MFA'],
  'Design Systems': ['Storybook', 'Figma', 'UI/UX', 'Design Tokens', 'Component Library', 'Material UI', 'Ant Design', 'Chakra UI', 'Lucide React', 'React Icons'],
  'Platform & Tooling': ['Vercel', 'GitHub Actions', 'ESLint', 'Prettier', 'PostCSS']
};

const normalizeSkill = (skill: string) => skill.toLowerCase().replace(/[^a-z0-9+#]/g, '');

const skillAliases: Record<string, string[]> = {
  'Bun': ['Bun.js'],
  'Drizzle ORM': ['Drizzle', 'Drizzle Kit'],
  'Lucide React': ['lucide-react', 'Lucide'],
  'Node.js': ['Node'],
  'PostgreSQL': ['Postgres', 'pg'],
  'React Icons': ['react-icons'],
  'React Router': ['react-router-dom'],
  'TailwindCSS': ['Tailwind CSS', 'Tailwind'],
  'Vercel Postgres': ['@vercel/postgres']
};

const getSkillMatchers = (skill: string) => [skill, ...(skillAliases[skill] || [])].map(normalizeSkill);

type ResumeContact = {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
};

const toProjectSkillList = (project: Project) => {
  const tags = Array.isArray(project.tags)
    ? project.tags
    : (project.tags as string)?.split(',').map(tag => tag.trim()) || [];
  const stack = project.stack?.split(',').map(skill => skill.trim()) || [];

  return [...tags, ...stack].filter(Boolean).map(normalizeSkill);
};

function Resume() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resumeContact, setResumeContact] = useState<ResumeContact | null>(null);
  const componentRef = useRef<HTMLDivElement>(null); // Create a ref for the component to be printed
  const experience = timelineData.filter((item) => item.type === 'work');
  const education = timelineData.filter((item) => item.type === 'education');
  const certifications = timelineData.filter((item) => item.type === 'certificate');
  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  useEffect(() => {
    fetch(`${apiBase}/api/experience`)
      .then(res => res.json())
      .then(setTimelineData)
      .catch(console.error);

    fetch(`${apiBase}/api/projects`)
      .then(res => res.json())
      .then(setProjects)
      .catch(console.error);

    fetch(`${apiBase}/api/admin/resume-contact`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(setResumeContact)
      .catch(() => setResumeContact(null));
  }, []);

  const calculatedSkills = useMemo(() => {
    if (projects.length === 0) return [];
    const total = projects.length;

    return Object.entries(skillCategories).map(([category, items]) => {
      const skillsInCategory = items.map(skill => {
        const skillMatchers = getSkillMatchers(skill);
        const count = projects.filter(p => {
          const projectSkills = toProjectSkillList(p);
          return skillMatchers.some(skillMatcher => projectSkills.includes(skillMatcher));
        }).length;
        return { name: skill, level: Math.round((count / total) * 100) };
      })
      .filter(s => s.level > 0)
      // Sort by level descending (most used first)
      .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
      // Limit to top 5 skills
      .slice(0, 5);

      return { category, skills: skillsInCategory };
    }).filter(c => c.skills.length > 0);
  }, [projects]);

  const recentProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    
    return [...projects]
      .filter((project) => project.isPublic === true || project.isPublic === null)
      .sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : -Infinity;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : -Infinity;
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [projects]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "JRoybal_Resume",
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        * {
          box-shadow: none !important;
          text-shadow: none !important;
        }

        body {
          background: #fff !important;
          color: #111 !important;
          font-family: Arial, Helvetica, sans-serif !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .resume-print {
          display: grid !important;
          grid-template-columns: 32% 1fr !important;
          grid-template-rows: auto 1fr !important;
          gap: 16px 18px !important;
          width: 100% !important;
          min-height: 277mm !important;
          color: #111 !important;
          font-size: 8.7pt !important;
          line-height: 1.28 !important;
        }

        .resume-print,
        .resume-print * {
          background: transparent !important;
          border-color: #d4d4d4 !important;
          color: #111 !important;
          animation: none !important;
          transition: none !important;
        }

        .resume-print section,
        .resume-print .feature-card,
        .resume-print [class*="rounded"],
        .resume-print [class*="border"] {
          border: 0 !important;
          border-radius: 0 !important;
          padding: 0 !important;
        }

        .resume-print .eyebrow,
        .resume-print p[class*="uppercase"] {
          margin: 0 0 6px !important;
          padding: 0 0 3px !important;
          border-bottom: 1px solid #9a9a9a !important;
          color: #111 !important;
          font-size: 7.4pt !important;
          font-weight: 700 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
        }

        .resume-print h3 {
          margin: 0 !important;
          font-size: 9pt !important;
          line-height: 1.15 !important;
        }

        .resume-print-header {
          display: block !important;
          grid-column: 1 / -1 !important;
          padding-bottom: 9px !important;
          border-bottom: 2px solid #111 !important;
        }

        .resume-print-name {
          margin: 0 !important;
          font-size: 18pt !important;
          line-height: 1.05 !important;
          font-weight: 700 !important;
        }

        .resume-print-title {
          margin: 3px 0 6px !important;
          font-size: 10pt !important;
          font-weight: 600 !important;
        }

        .resume-print-contact {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 3px 12px !important;
          font-size: 8pt !important;
          color: #333 !important;
        }

        .resume-screen-label {
          display: none !important;
        }

        .resume-pdf-label {
          display: inline !important;
        }

        .resume-pdf-skills {
          display: block !important;
        }

        .resume-web-skills {
          display: none !important;
        }

        .resume-web-skills-note {
          display: none !important;
        }

        .resume-print p,
        .resume-print li,
        .resume-print span {
          font-size: inherit !important;
          line-height: inherit !important;
        }

        .resume-print ul {
          margin: 5px 0 0 !important;
          padding-left: 13px !important;
          gap: 0 !important;
        }

        .resume-print li {
          display: list-item !important;
          margin: 0 0 3px !important;
        }

        .resume-print li > span:first-child,
        .resume-skill-meter {
          display: none !important;
        }

        .resume-print > div:not(.resume-print-header),
        .resume-print section,
        .resume-print .feature-card {
          gap: 10px !important;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .resume-print .lg\\:col-span-4,
        .resume-print .lg\\:col-span-8 {
          display: flex !important;
          flex-direction: column !important;
          gap: 13px !important;
        }

        .resume-print .flex {
          gap: 5px !important;
        }

        .resume-print .mt-2,
        .resume-print .mt-4,
        .resume-print .mb-4,
        .resume-print .mb-5,
        .resume-print .mb-6 {
          margin-top: 0 !important;
          margin-bottom: 6px !important;
        }
      }
    `,
  });

  return (
    <div className="page-shell">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex justify-between items-end mb-12 flex-wrap gap-6">
          <div>
            <p className="eyebrow">The tasting board</p>
            <h1>Professional Resume</h1>
          </div>
          <Button
            mode="secondary"
            label="Download PDF — Order slip"
            onClick={() => handlePrint()}
          />
        </div>

        {/* Wrap the content that needs to be printed with the ref */}
        <div ref={componentRef} className="resume-print grid grid-cols-1 lg:grid-cols-12 gap-12">
          {resumeContact && (
            <div className="resume-print-header hidden">
              <h1 className="resume-print-name">{resumeContact.name || "JRoybalDev"}</h1>
              {resumeContact.title && <p className="resume-print-title">{resumeContact.title}</p>}
              <div className="resume-print-contact">
                {resumeContact.email && <span>{resumeContact.email}</span>}
                {resumeContact.phone && <span>{resumeContact.phone}</span>}
                {resumeContact.location && <span>{resumeContact.location}</span>}
                {resumeContact.website && <span>{resumeContact.website}</span>}
                {resumeContact.linkedin && <span>{resumeContact.linkedin}</span>}
                {resumeContact.github && <span>{resumeContact.github}</span>}
              </div>
            </div>
          )}
          {/* Left Column: Skills & Info */}
          <div className="lg:col-span-4 flex flex-col gap-10">
             <section className="flex flex-col gap-6">
              {calculatedSkills.map(group => (
                <div key={group.category} className="p-5 rounded-2xl bg-[--bg-alt]/50 border border-[--border] shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[--accent] mb-5 border-b border-[--border] pb-2">{group.category}</p>
                  <p className="resume-pdf-skills hidden">
                    {skillCategories[group.category].join(', ')}
                  </p>
                  <div className="resume-web-skills flex flex-col gap-4">
                    {group.skills.map(skill => (
                      <div key={skill.name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-bold text-[--text]">
                          <span>{skill.name}</span>
                          <span className="opacity-50">{skill.level}%</span>
                        </div>
                        <div className="resume-skill-meter h-1.5 w-full bg-[--border] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[--accent] rounded-full"
                          /></div>
                      </div>
                    ))}
                    </div>
                  </div>
                ))}
                {calculatedSkills.length > 0 && (
                  <p className="resume-web-skills-note ml-3 text-[9px] leading-relaxed text-[--muted-soft]">
                    * Percentage reflects how many total projects include each skill.
                  </p>
                )}
            </section>

            <section className="p-5 rounded-2xl border border-[--border]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-4 border-b border-[--border] pb-2">Education</p>
              <div className="flex flex-col gap-4">
                {education.map(edu => (
                  <div key={edu.title} className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-[--text]">{edu.title}</p>
                    <p className="text-xs text-[--muted]">{edu.subtitle} · {edu.year}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-5 rounded-2xl border border-[--border]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-4 border-b border-[--border] pb-2">Certifications</p>
              <div className="flex flex-col gap-4">
                {certifications.map(cert => (
                  <div key={cert.title} className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-[--text]">{cert.title}</p>
                    <p className="text-xs text-[--muted]">{cert.subtitle} · {cert.year}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Experience & Summary */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <section className="feature-card !p-8">
              <p className="eyebrow !text-[10px] mb-6">
                <span className="resume-screen-label">House blend — Experience</span>
                <span className="resume-pdf-label hidden">Professional Experience</span>
              </p>
              <div className="flex flex-col gap-8">
                {experience.map(job => (
                  <div key={job.title + job.year} className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-lg font-bold text-[--text]">{job.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-[--accent] bg-[--border] px-2 py-1 rounded whitespace-nowrap">
                        {job.year}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[--muted]">{job.subtitle}</p>
                    <ul className="flex flex-col gap-2 mt-2">
                      {job.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-3 text-xs leading-relaxed text-[--muted-soft]">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[--accent-soft] shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {recentProjects.length > 0 && (
              <section className="feature-card !p-8">
                <p className="eyebrow !text-[10px] mb-6">
                  <span className="resume-screen-label">Selected roasts — Recent Projects</span>
                  <span className="resume-pdf-label hidden">Selected Projects</span>
                </p>
                <div className="flex flex-col gap-6">
                  {recentProjects.map(project => (
                    <div key={project.name} className="flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-md font-bold text-[--text]">{project.name}</h3>
                        <span className="text-[9px] font-bold uppercase tracking-tighter text-[--accent] bg-[--border] px-2 py-1 rounded whitespace-nowrap">
                          {project.projectType}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[--muted-soft]">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(project.tags) ? project.tags : (project.tags as string)?.split(',')).map((tag) => (
                          <span key={tag} className="text-[9px] bg-[--bg-alt] border border-[--border] px-1.5 py-0.5 rounded text-[--muted]">{tag.trim()}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="feature-card !p-8 bg-[--foam]">
              <p className="eyebrow !text-[10px] mb-4">
                <span className="resume-screen-label">Expert roast — Summary</span>
                <span className="resume-pdf-label hidden">Professional Summary</span>
              </p>
              <p className="text-sm text-[--muted-soft] leading-relaxed">
                Versatile Frontend Developer passionate about creating exceptional user experiences while maintaining 
                a keen eye on the entire application ecosystem. My full-stack development capabilities allow for a 
                holistic approach to problem-solving, from user interface to database. My understanding of core 
                cybersecurity concepts ensures I design and implement secure, resilient solutions that protect valuable data.
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Resume;
