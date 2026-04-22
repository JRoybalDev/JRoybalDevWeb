import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TimelineItem } from './Experience';
import Button from '@frontend/components/Button';
import { useReactToPrint } from 'react-to-print';

const skills = [
  { name: 'Frontend (React/Next.js)', level: 95 },
  { name: 'Backend (Node/Python)', level: 85 },
  { name: 'PostgreSQL', level: 85 },
  { name: 'Cybersecurity/SecOps', level: 80 },
  { name: 'Design Systems', level: 75 },
];

const certifications = [
  { title: 'Google Cybersecurity Certificate', issuer: 'Coursera/Google', year: '2025' },
  { title: 'Software Engineering Professional', issuer: 'App Academy', year: '2023' },
];

function Resume() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const componentRef = useRef<HTMLDivElement>(null); // Create a ref for the component to be printed
  const experience = timelineData.filter((item) => item.type === 'work');
  const education = timelineData.filter((item) => item.type === 'education');
  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  useEffect(() => {
    fetch(`${apiBase}/api/experience`)
      .then(res => res.json())
      .then(setTimelineData)
      .catch(console.error);
  }, []);

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
            <section>
              <p className="eyebrow !text-[10px] mb-6">Signature brew — Skills</p>
              <div className="flex flex-col gap-5">
                {skills.map(skill => (
                  <div key={skill.name} className="flex flex-col gap-2">
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
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="eyebrow !text-[10px] mb-4">Education</p>
              <div className="flex flex-col gap-4">
                {education.map(edu => (
                  <div key={edu.title} className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-[--text]">{edu.title}</p>
                    <p className="text-xs text-[--muted]">{edu.subtitle} · {edu.year}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="eyebrow !text-[10px] mb-4">Certifications</p>
              <div className="flex flex-col gap-4">
                {certifications.map(cert => (
                  <div key={cert.title} className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-[--text]">{cert.title}</p>
                    <p className="text-xs text-[--muted]">{cert.issuer} · {cert.year}</p>
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
