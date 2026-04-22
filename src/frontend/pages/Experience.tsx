import { useState, useEffect } from 'react';
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

const categories = ['All', 'Work', 'Education'];

function Experience() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  useEffect(() => {
    fetch(`${apiBase}/api/experience`)
      .then(res => res.json())
      .then(setTimelineData)
      .catch(console.error);
  }, []);

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