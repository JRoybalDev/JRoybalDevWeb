import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiGithub, FiLinkedin, FiClock, FiChevronDown } from 'react-icons/fi';
import Button from '@frontend/components/Button';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('Full-stack contract');
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [cooldown, setCooldown] = useState(false);

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";
  const messageCharCount = message.replace(/\s/g, '').length;

  const contactMethods = [
    { icon: FiMail, label: 'Email', value: 'contact@jroybal.dev', href: 'mailto:contact@jroybal.dev' },
    { icon: FiGithub, label: 'GitHub', value: 'github.com/jroybaldev', href: 'https://github.com/jroybaldev' },
    { icon: FiLinkedin, label: 'LinkedIn', value: 'linkedin.com/in/jroybaldev', href: 'https://linkedin.com/in/jroybaldev' },
  ];

  const options = ['Full-stack contract', 'Consulting', 'Freelance project'];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cooldown) return;

    // Basic Validations
    if (name.trim().length < 2 || name.length > 75) return setStatus({ type: 'error', msg: 'Name must be between 2 and 75 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus({ type: 'error', msg: 'Please enter a valid email address.' });
    if (messageCharCount < 50) return setStatus({ type: 'error', msg: 'Message must be at least 50 characters (excluding spaces).' });
    if (messageCharCount > 2000) return setStatus({ type: 'error', msg: 'Message is too long (max 2000 characters).' });

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          projectType,
          message: message.trim(), // Backend should do additional sanitization
        }),
      });

      if (!response.ok) throw new Error();

      setStatus({ type: 'success', msg: 'Order received! I’ll get back to you within 24 hours.' });
      setName('');
      setEmail('');
      setMessage('');
      setCooldown(true);
      // Anti-spam cooldown for 30 seconds
      setTimeout(() => setCooldown(false), 30000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'The machine is clogged. Please try again later or email me directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="hero-panel items-start lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-copy"
        >
          <p className="eyebrow">Get in touch</p>
          <h1 className="mb-4">Let's make something rich and smooth.</h1>
          <p className="hero-text">
            Ready to brew your next product? Drop me a line — I respond within one business day.
          </p>

          <div className="flex flex-col gap-6 mb-12 mt-10">
            {contactMethods.map((method) => (
              <a 
                key={method.label}
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-10 h-10 rounded-full bg-[--border] flex items-center justify-center text-[--accent] transition-colors group-hover:bg-[--accent] group-hover:text-[--bg]"
                >
                  <method.icon size={18} />
                </motion.div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[--muted]">{method.label}</p>
                  <p className="text-sm font-medium text-[--text] group-hover:text-[--accent] transition-colors">{method.value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-[--foam] border border-[--border] flex gap-4 items-center theme-transition">
            <div className="text-[--accent]">
              <FiClock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[--text] mb-1">Availability</p>
              <p className="text-xs text-[--muted-soft]">Open to new contracts · Remote only · Response &lt; 24h</p>
            </div>
          </div>
        </motion.div>

        {/* Right: Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="card order-slip"
        >
          <form className="form" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[--muted]">Name</label>
              <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[--muted]">Email</label>
              <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2 relative">
              <label className="text-xs font-bold uppercase tracking-widest text-[--muted]">Project Type</label>
              <div 
                className="cursor-pointer border border-[--input-border] bg-[--input-bg] rounded-[14px] p-[0.95rem_1rem] text-[--text] flex items-center justify-between transition-all duration-300 hover:border-[--accent-soft]"
                onClick={() => setIsOpen(!isDropdownOpen)}
              >
                <span className="text-sm">{projectType}</span>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <FiChevronDown className="text-[--muted]" />
                </motion.div>
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    {/* Transparent overlay to close dropdown when clicking outside */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <motion.ul 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 w-full mt-2 bg-[--surface-strong] border border-[--input-border] rounded-xl z-20 overflow-hidden shadow-2xl backdrop-blur-md"
                    >
                      {options.map((opt) => (
                        <li 
                          key={opt}
                          className="px-4 py-3 hover:bg-[--accent] hover:text-[--bg] cursor-pointer transition-colors text-sm text-[--text]"
                          onClick={() => {
                            setProjectType(opt);
                            setIsOpen(false);
                          }}
                        >
                          {opt}
                        </li>
                      ))}
                    </motion.ul>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold uppercase tracking-widest text-[--muted]">Message</label>
                <span className={`text-[10px] font-bold ${messageCharCount < 50 || messageCharCount > 2000 ? 'text-red-500' : 'text-[--muted]'}`}>
                  {messageCharCount} / 2000
                </span>
              </div>
              <textarea 
                rows={4} 
                className="resize-none" 
                placeholder="Tell me about your project — what you're building, your timeline, and budget range." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required 
              />
            </div>

            <AnimatePresence>
              {status && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`message ${status.type === 'success' ? 'success' : 'danger'}`}
                >
                  {status.msg}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4">
              <Button 
                mode="primary" 
                label={isSubmitting ? "Brewing..." : cooldown ? "Message Sent ☕" : "Pull the shot — Send message ☕"} 
              />
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
export default Contact;
