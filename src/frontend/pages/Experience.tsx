import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@frontend/components/Button';
import ExperienceCard from '@frontend/components/ExperienceCard';

export interface TimelineItem {
  year: string;
  title: string;
  subtitle: string;
  bullets: string[];
  type: 'work' | 'education';
}

export const timelineData: TimelineItem[] = [
  {
    year: 'Nov 2023 — Present',
    title: 'Frontend Developer',
    subtitle: 'African Marine Conservation Organization (AMCO)',
    bullets: [
      'Developed and maintained the main webpage using JavaScript, React, Next.js, and Bootstrap, ensuring a seamless user experience and adherence to design specifications.',
      'Collaborated with team members to implement new features, optimize code, and troubleshoot issues, resulting in improved website performance and user engagement.',
    ],
    type: 'work',
  },
  {
    year: 'Aug 2019 — May 2022',
    title: 'Freelance Mod Developer',
    subtitle: 'JRoybalDev',
    bullets: [
      'Engineered diverse Lua, JavaScript, and Java-based mods and plugins for multiple video game platforms, elevating user experiences through innovative enhancements.',
      'Self-taught technical skills to proficiently troubleshoot stack traces and errors, significantly streamlining the debugging process for enhanced efficiency.',
    ],
    type: 'work',
  },
  {
    year: 'Jun 2025',
    title: 'Google Cybersecurity Certificate',
    subtitle: 'Coursera',
    bullets: [
      'Mastered core cybersecurity concepts including incident management, network security, and SIEM tools.',
      'Gained hands-on experience in identifying vulnerabilities and implementing secure, resilient data protection solutions.',
    ],
    type: 'education',
  },
  {
    year: 'Jun 2023',
    title: 'Software Engineering Bootcamp',
    subtitle: 'App Academy',
    bullets: [
      'Intensive immersion in full-stack web development, data structures, algorithms, and object-oriented programming.',
    ],
    type: 'education',
  },
  {
    year: 'Present',
    title: 'CIS: Programmer — A.A.',
    subtitle: 'Cerritos College',
    bullets: [
      'Learned advanced programming topics such as system design, data structures and algorithms, and object-oriented programming.',
      'Covered topics including programming in C/C++ and object-oriented programming in Java.',
    ],
    type: 'education',
  },
];

const categories = ['All', 'Work', 'Education'];

function Experience() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredData =
    activeFilter === 'All'
      ? timelineData
      : timelineData.filter((item) => item.type === activeFilter.toLowerCase());

  return (
    <div className="page-shell">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="eyebrow">The roast levels</p>
        <h1 className="mb-4">Experience &amp; Education</h1>
        <p className="hero-text">
          A journey through different stages of development — from the first bean to the final pour.
        </p>

        {/* Filter pills */}
        <div className="flex gap-3 mb-12 flex-wrap mt-10">
          {categories.map((cat) => (
            <Button
              key={cat}
              mode={activeFilter === cat ? 'primary' : 'secondary'}
              label={cat}
              onClick={() => setActiveFilter(cat)}
            />
          ))}
        </div>

        {/* Timeline */}
        <motion.div
          layout
          className="flex flex-col gap-8 relative border-l-2 border-[--border] ml-4 pl-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredData.map((item, index) => (
              <motion.div
                layout
                key={item.title + item.year}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, x: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className=""
              >
                {/* Timeline dot */}
                <div className="absolute -left-[41px] top-8 w-4 h-4 rounded-full border-4 border-[--bg] shadow-sm"
                  style={{ background: 'var(--accent)' }}
                />

                <ExperienceCard {...item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Experience;