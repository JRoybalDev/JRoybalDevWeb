import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TimelineItem } from './Experience';
import type { Project } from './HomePage';
import Button from '@frontend/components/Button';
import { useReactToPrint } from 'react-to-print';

const skillCategories: Record<string, string[]> = {
  'Frontend': ['React', 'Next.js', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'TailwindCSS', 'Framer Motion', 'Sass', 'Less', 'Webpack', 'Vite'],
  'Backend': ['Node.js', 'Python', 'Go', 'Express', 'Django', 'Flask', 'NestJS', 'GraphQL', 'REST API', 'Ruby on Rails', 'PHP', 'Java', 'Spring Boot', 'C#', '.NET'],
  'Database Management': ['PostgreSQL', 'MongoDB', 'SQLite', 'MySQL', 'Redis', 'SQL', 'NoSQL', 'Prisma', 'TypeORM', 'Mongoose', 'Sanity'],
  'CyberSecurity/SecOps': ['OWASP', 'Penetration Testing', 'Security Audits', 'Threat Modeling', 'Encryption', 'Authentication', 'Authorization', 'OAuth', 'JWT', 'SSO', 'MFA'],
  'Design Systems': ['Storybook', 'Figma', 'UI/UX', 'Design Tokens', 'Component Library', 'Material UI', 'Ant Design', 'Chakra UI']
};

function Resume() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
  }, []);

  const calculatedSkills = useMemo(() => {
    if (projects.length === 0) return [];
    const total = projects.length;

    return Object.entries(skillCategories).map(([category, items]) => {
      const skillsInCategory = items.map(skill => {
        const count = projects.filter(p => {
          const tags = Array.isArray(p.tags) ? p.tags : (p.tags as string)?.split(',').map(t => t.trim()) || [];
          const stack = p.stack?.split(',').map(s => s.trim()) || [];
          const allProjectSkills = [...tags, ...stack].map(s => s.toLowerCase());
          return allProjectSkills.some(ps => ps.includes(skill.toLowerCase()));
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

  console.log(projects)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "JRoybal_Resume",
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
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
        <div ref={componentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Skills & Info */}
          <div className="lg:col-span-4 flex flex-col gap-10">
             <section className="flex flex-col gap-6">
              {calculatedSkills.map(group => (
                <div key={group.category} className="p-5 rounded-2xl bg-[--bg-alt]/50 border border-[--border] shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[--accent] mb-5 border-b border-[--border] pb-2">{group.category}</p>
                  <div className="flex flex-col gap-4">
                    {group.skills.map(skill => (
                      <div key={skill.name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-bold text-[--text]">
                          <span>{skill.name}</span>
                          <span className="opacity-50">{skill.level}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[--border] rounded-full overflow-hidden">
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
              <p className="eyebrow !text-[10px] mb-6">House blend — Experience</p>
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
                <p className="eyebrow !text-[10px] mb-6">Selected roasts — Recent Projects</p>
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
              <p className="eyebrow !text-[10px] mb-4">Expert roast — Summary</p>
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
