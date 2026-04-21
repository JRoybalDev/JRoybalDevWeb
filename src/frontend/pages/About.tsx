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
              A paragraph about your story — where you come from, what drives you, and why you love building things. 
              Keep it warm and personal, like a coffee shop conversation. This is where the brand voice really shines.
            </p>
            <p>
              A second paragraph about your process, how you work with clients, and what makes JRoybalDev different 
              from other freelancers.
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
