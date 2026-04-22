import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLayers, FiActivity, FiLogOut, FiX } from "react-icons/fi";
import Button from "@frontend/components/Button";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [inquiries, setInquiries] = useState<any[]>([]);
  
  // Modal & Form State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [expForm, setExpForm] = useState({
    year: '',
    title: '',
    subtitle: '',
    bullets: '',
    type: 'work' as 'work' | 'education'
  });

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    thumbnail: '',
    tags: '',
    category: 'Full-stack Contract',
    githubUrl: '',
    liveUrl: '',
  });

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch(`${apiBase}/api/admin/inquiries`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setInquiries(data))
        .catch(console.error);
    }
  }, [user]);

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validations
    if (projectForm.name.trim().length < 2) return setFormError("Name must be at least 2 characters.");
    if (projectForm.description.trim().length < 10) return setFormError("Description must be at least 10 characters.");
    if (!projectForm.tags.trim()) return setFormError("Please add at least one tag.");

    try {
      const res = await fetch(`${apiBase}/api/admin/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm),
        credentials: 'include'
      });

      if (!res.ok) throw new Error();
      
      setIsProjectModalOpen(false);
      setProjectForm({ name: '', description: '', thumbnail: '', tags: '', category: 'Full-stack Contract', githubUrl: '', liveUrl: '' });
    } catch (err) {
      setFormError("The coffee machine is jammed. Failed to save project.");
    }
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (expForm.title.length < 2) return setFormError("Title is too short.");
    
    try {
      // Convert newline-separated bullets to a JSON string for the DB
      const bulletArray = expForm.bullets.split('\n').filter(b => b.trim() !== '');
      
      const res = await fetch(`${apiBase}/api/admin/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expForm,
          bullets: JSON.stringify(bulletArray)
        }),
        credentials: 'include'
      });

      if (!res.ok) throw new Error();
      setIsExperienceModalOpen(false);
      setExpForm({ year: '', title: '', subtitle: '', bullets: '', type: 'work' });
    } catch (err) {
      setFormError("Failed to brew this experience entry.");
    }
  };

  // Protect route and handle redirection back to target
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page-shell">
      <div className="flex justify-between items-center mb-12">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1>Welcome back, Jack</h1>
        </div>
        <div className="flex gap-4">
          <Button mode="secondary" label="Sign Out" onClick={signOut} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Stats */}
        <div className="feature-card flex flex-col gap-4">
          <div className="feature-icon"><FiActivity /></div>
          <h3>Overview</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-[--muted]">Total Inquiries</span>
              <span className="font-bold">{inquiries.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[--muted]">Site Status</span>
              <span className="text-green-500 font-bold">Live</span>
            </div>
          </div>
        </div>

        {/* Management Card */}
        <div className="feature-card flex flex-col gap-4">
          <div className="feature-icon"><FiLayers /></div>
          <h3>Inventory</h3>
          <p className="text-sm text-[--muted-soft]">Update your menu items, roasts, and certifications.</p>
          <div className="mt-auto flex flex-col gap-2">
            <Button mode="secondary" label="+ Add Project" onClick={() => setIsProjectModalOpen(true)} />
            <Button mode="secondary" label="+ Add Experience" onClick={() => setIsExperienceModalOpen(true)} />
          </div>
        </div>

        {/* Account Card */}
        <div className="feature-card flex flex-col gap-4">
          <div className="feature-icon"><FiLogOut /></div>
          <h3>System</h3>
          <p className="text-sm text-[--muted-soft]">Manage site global variables and security settings.</p>
          <div className="mt-auto">
            <Button mode="secondary" label="Settings" />
          </div>
        </div>
      </div>

      {/* Inquiries Section */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <FiMail className="text-[--accent]" />
          <h2 className="text-xl font-bold">Email Inquiries</h2>
        </div>

        <div className="card order-slip !p-0 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[--border]/30 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="p-4 border-b border-[--border]">Sender</th>
                <th className="p-4 border-b border-[--border]">Interest</th>
                <th className="p-4 border-b border-[--border]">Message</th>
                <th className="p-4 border-b border-[--border]">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {inquiries.length > 0 ? inquiries.map((iq) => (
                <tr key={iq.id} className="hover:bg-[--accent-soft]/5 transition-colors">
                  <td className="p-4 border-b border-[--border]">
                    <div className="font-bold">{iq.name}</div>
                    <div className="text-xs text-[--muted]">{iq.email}</div>
                  </td>
                  <td className="p-4 border-b border-[--border]">
                    <span className="bg-[--border] px-2 py-0.5 rounded text-[10px]">{iq.projectType}</span>
                  </td>
                  <td className="p-4 border-b border-[--border] max-w-xs truncate">{iq.message}</td>
                  <td className="p-4 border-b border-[--border] text-xs text-[--muted]">
                    {new Date(iq.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-12 text-center text-[--muted]">No orders yet. The machine is quiet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl card order-slip shadow-2xl overflow-y-auto max-h-[90vh] theme-transition"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="eyebrow">Inventory</p>
                    <h2 className="text-2xl font-bold">Add New Project</h2>
                  </div>
                  <button 
                    onClick={() => setIsProjectModalOpen(false)}
                    className="p-2 rounded-full hover:bg-[--border] transition-colors text-[--muted]"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleProjectSubmit} className="form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Project Name</label>
                      <input type="text" placeholder="e.g. Mocha Dashboard" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Category</label>
                      <select 
                        value={projectForm.category} 
                        onChange={e => setProjectForm({...projectForm, category: e.target.value})}
                        className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-3 text-sm focus:outline-[--focus]"
                      >
                        <option>Full-stack Contract</option>
                        <option>Freelance</option>
                        <option>Consulting</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Description</label>
                    <textarea rows={3} placeholder="Flavor notes — what did you build?" className="resize-none" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} required />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Tags (comma separated)</label>
                    <input type="text" placeholder="React, TypeScript, Bun" value={projectForm.tags} onChange={e => setProjectForm({...projectForm, tags: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">GitHub URL</label>
                      <input type="url" placeholder="https://github.com/..." value={projectForm.githubUrl} onChange={e => setProjectForm({...projectForm, githubUrl: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Live Site URL</label>
                      <input type="url" placeholder="https://..." value={projectForm.liveUrl} onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Thumbnail URL</label>
                    <input type="text" placeholder="/images/projects/preview.png" value={projectForm.thumbnail} onChange={e => setProjectForm({...projectForm, thumbnail: e.target.value})} />
                  </div>

                  {formError && (
                    <div className="message danger text-xs">{formError}</div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[--border]">
                    <Button mode="primary" label="Save to Menu ☕" />
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Experience Modal */}
      <AnimatePresence>
        {isExperienceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExperienceModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl card order-slip shadow-2xl overflow-y-auto max-h-[90vh] theme-transition"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="eyebrow">Roast Levels</p>
                    <h2 className="text-2xl font-bold">Add Experience / Education</h2>
                  </div>
                  <button onClick={() => setIsExperienceModalOpen(false)} className="p-2 rounded-full hover:bg-[--border] text-[--muted]">
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleExperienceSubmit} className="form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Year Range</label>
                      <input type="text" placeholder="e.g. 2023 — Present" value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Entry Type</label>
                      <select 
                        value={expForm.type} 
                        onChange={e => setExpForm({...expForm, type: e.target.value as any})}
                        className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-3 text-sm"
                      >
                        <option value="work">Work Experience</option>
                        <option value="education">Education / Cert</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Title / Role</label>
                      <input type="text" placeholder="e.g. Senior Barista" value={expForm.title} onChange={e => setExpForm({...expForm, title: e.target.value})} required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Company / School</label>
                      <input type="text" placeholder="e.g. Mocha Tech" value={expForm.subtitle} onChange={e => setExpForm({...expForm, subtitle: e.target.value})} required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Key Bullets (one per line)</label>
                    </div>
                    <textarea 
                      rows={5} 
                      className="resize-none" 
                      placeholder="Developed the rich blend...&#10;Optimized the pour-over process..." 
                      value={expForm.bullets}
                      onChange={e => setExpForm({...expForm, bullets: e.target.value})}
                      required 
                    />
                  </div>

                  {formError && (
                    <div className="message danger text-xs">{formError}</div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[--border]">
                    <Button mode="primary" label="Update Timeline ☕" />
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

