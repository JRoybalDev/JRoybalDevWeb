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
              I'm a versatile Software Engineer and Frontend Developer passionate about creating exceptional user experiences while 
              maintaining a keen eye on the entire application ecosystem. My approach to problem-solving is holistic—I bridge the 
              gap between the user interface and the database to brew seamless digital products.
            </p>
            <blockquote className="italic border-l-4 border-[--accent] pl-4 my-2 text-[--text]">
              "That brain of mine is something more than merely mortal; as time will show." — Ada Lovelace
            </blockquote>
            <p>
              Beyond standard development, my background in cybersecurity ensures that I design and implement secure, 
              resilient solutions that protect valuable data. Whether it's a custom freelance mod or a large-scale 
              non-profit platform, I focus on delivering code that is as rich and smooth as a perfect roast.
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
