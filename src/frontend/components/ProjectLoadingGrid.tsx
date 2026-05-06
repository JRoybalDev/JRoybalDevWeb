import React from "react";

interface ProjectLoadingGridProps {
  count?: number;
  className?: string;
}

function ProjectLoadingGrid({ count = 3, className = "feature-grid" }: ProjectLoadingGridProps) {
  return (
    <div className={className} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading projects</span>
      {Array.from({ length: count }).map((_, index) => (
        <div className="feature-card project-loading-card" key={index}>
          <div className="project-loading-thumb project-loading-shimmer" />
          <div className="project-loading-line project-loading-line-short project-loading-shimmer" />
          <div className="project-loading-line project-loading-line-title project-loading-shimmer" />
          <div className="project-loading-copy">
            <span className="project-loading-line project-loading-shimmer" />
            <span className="project-loading-line project-loading-line-medium project-loading-shimmer" />
          </div>
          <div className="project-loading-tags">
            <span className="project-loading-pill project-loading-shimmer" />
            <span className="project-loading-pill project-loading-shimmer" />
            <span className="project-loading-pill project-loading-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectLoadingGrid;
