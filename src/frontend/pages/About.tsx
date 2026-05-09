import React from 'react';
import { motion } from 'framer-motion';

function About() {
  return (
    <div className="page-shell">
      <div className="hero-panel">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-copy"
        >
          <p className="eyebrow">The Story</p>
        <h1>Hi, I'm Jack!</h1>
          <div className="hero-text flex flex-col gap-6 mt-6">
            <p>
              I'm a 24-year-old software engineer from Los Angeles, California. I started programming when I was 14,
              and what began as curiosity has grown into a craft I have spent the last decade sharpening across
              frontend, backend, and full-stack product work.
            </p>
            <blockquote className="italic border-l-4 border-[--accent] pl-4 my-2 text-[--text]">
              "That brain of mine is something more than merely mortal; as time will show." — Ada Lovelace
            </blockquote>
            <p>
              I care about building software that feels useful, thoughtful, and reliable. Whether I am shaping a clean
              interface, wiring up an API, or thinking through the database behind it, I like connecting the whole
              system so the final product feels smooth for the people using it. My priorities are simple: build with
              purpose, communicate clearly, and leave every project stronger than I found it. I want the software I
              create to solve real problems, respect the people using it, and give clients confidence that their product
              is secure, maintainable, and ready to grow.
            </p>
            <p>
              Outside of code, I find a lot of inspiration in nature, movies, games, and the community around me. I
              believe in continual learning, sharing what I know, and using technology to help people feel more capable
              in the work they are trying to do.
            </p>
          </div>
        </motion.div>

        {/* Portrait Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <img 
            src="/images/avatar.jpg" 
            alt="Jack Profile" 
            className="card !p-0 overflow-hidden aspect-[3/4] object-cover w-full shadow-2xl block" 
          />
        </motion.div>
      </div>
    </div>
  );
}

export default About
