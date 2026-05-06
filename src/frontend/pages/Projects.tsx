import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from './HomePage';
import ProjectCard from '@frontend/components/ProjectCard';
import Button from '@frontend/components/Button';
import ProjectLoadingGrid from '@frontend/components/ProjectLoadingGrid';

const categories = ['All', 'Full-stack', 'Consulting', 'Games'];

function getProjectStartTime(project: Project) {
  if (!project.startDate) return 0;

  const time = Date.parse(project.startDate);
  return Number.isNaN(time) ? 0 : time;
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  useEffect(() => {
    fetch(`${apiBase}/api/projects`)
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(console.error)
      .finally(() => setIsLoadingProjects(false));
  }, []);

  const filteredProjects = useMemo(() => {
    const recentFirstProjects = [...projects].sort((a, b) => {
      const dateDifference = getProjectStartTime(b) - getProjectStartTime(a);
      return dateDifference || a.name.localeCompare(b.name);
    });

    return activeFilter === 'All'
      ? recentFirstProjects
      : recentFirstProjects.filter(p => p.projectType === activeFilter);
  }, [activeFilter, projects]);

  return (
    <div className="page-shell">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="eyebrow">The menu</p>
        <h1 className="mb-4">Projects & Case Studies</h1>
        <p className="hero-text">
          A curated selection of work — each one a distinct roast.
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

        {isLoadingProjects ? (
          <ProjectLoadingGrid className="project-grid" count={6} />
        ) : (
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
        )}
      </motion.div>
    </div>
  );
}

export default Projects;
