import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from './HomePage';
import ProjectCard from '@frontend/components/ProjectCard';
import Button from '@frontend/components/Button';

const categories = ['All', 'Full-stack Contract', 'Freelance', 'Consulting'];

function Projects() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <div className="page-shell">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="eyebrow">The menu</p>
        <h1 className="mb-4">Projects & case studies</h1>
        <p className="hero-text">
          A curated selection of work — each one a distinct roast.
        </p>

        {/* Filter pills */}
        <div className="flex gap-3 mb-12 flex-wrap mt-10">
          {categories.map((cat) => (
            <Button
              key={cat}
              mode={activeFilter === cat ? 'primary' : 'secondary'}
              label={cat === 'Full-stack Contract' ? 'Full-stack' : cat}
              onClick={() => setActiveFilter(cat)}
            />
          ))}
        </div>

        <motion.div layout className="project-grid">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={project.name}
                className="h-full"
              >
                <ProjectCard {...project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Projects;