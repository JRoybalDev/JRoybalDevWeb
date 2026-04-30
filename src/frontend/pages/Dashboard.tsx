import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../providers/AuthProvider";
import { Navigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence, Variants, LayoutGroup } from "framer-motion";
import { FiMail, FiLogOut, FiX, FiPlus, FiSettings, FiClock, FiSearch, FiTrash2, FiEdit2, FiEye, FiGrid, FiPlusSquare, FiCircle, FiChevronDown, FiCheckSquare, FiXSquare, FiCreditCard, FiTrendingUp, FiUsers, FiMessageSquare, FiMenu, FiArrowLeft, FiChevronLeft, FiChevronRight, FiExternalLink, FiBell, FiAlertTriangle, FiCheck, FiUploadCloud, FiImage, FiChevronUp } from "react-icons/fi";
import Button from "@frontend/components/Button";
import CloudinaryImage from "@frontend/components/CloudinaryImage";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeNotification, setActiveDropdown] = useState<'overdue' | 'inquiries' | null>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  // Client List Sorting
  const [clientListStatusFilter, setClientListStatusFilter] = useState('All');
  const [clientListSortColumn, setClientListSortColumn] = useState<string | null>(null);
  const [clientListSortDirection, setClientListSortDirection] = useState<'asc' | 'desc'>('asc');
  // Notes & Comms Filtering/Sorting
  const [inquiryFilterReadStatus, setInquiryFilterReadStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [inquirySortColumn, setInquirySortColumn] = useState<string | null>('createdAt'); // Default sort by date
  const [inquirySortDirection, setInquirySortDirection] = useState<'desc' | 'asc'>('desc'); // Default sort desc
  
  // Skill Usage State
  const [skillUsage, setSkillUsage] = useState<any[]>([]);
  // Available Tags State
  const [availableTags, setAvailableTags] = useState<{name: string, count: number}[]>([]);

  // Time Tracking State
  const [timeEntryForm, setTimeEntryForm] = useState({
    projectId: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    hours: '',
    notes: ''
  });
  const [isLoggingTime, setIsLoggingTime] = useState(false);

  // Form State
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [expForm, setExpForm] = useState({
    startDate: '', // YYYY-MM
    endDate: '',   // YYYY-MM
    isPresent: false,
    title: '',
    subtitle: '',
    bullets: '', // Newline separated
    type: 'work' as 'work' | 'education' | 'certificate'
  });

  const [projectForm, setProjectForm] = useState({
    projectId: '',
    name: '',
    clientName: '',
    clientEmail: '',
    clientContact: '',
    contractType: 'Fixed-price',
    projectType: 'Full-stack',
    status: 'Active',
    contractValue: '',
    amountInvoiced: '',
    amountOutstanding: '',
    paymentTerms: 'Net-30',
    depositPaid: 'No',
    startDate: '',
    deadline: '',
    estHours: '',
    loggedHours: '',
    effectiveRate: '',
    revisionRounds: '0 of 3',
    scopeChanges: '0',
    stack: '',
    hosting: '',
    repo: '',
    stagingUrl: '',
    ndaSigned: 'No',
    contractSigned: 'No',
    lastMilestone: '',
    nextMilestone: '',
    priority: 'Medium',
    internalNotes: '',
    description: '',
    isPublic: true,
    thumbnail: '',
    tags: '',
    category: 'Full-stack Contract',
    githubUrl: '',
    liveUrl: '',
  });

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

  // Define skill categories and keywords for calculation
  const skillCategories: Record<string, string[]> = {
    'Frontend': ['React', 'Next.js', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'TailwindCSS', 'Framer Motion', 'Sass', 'Less', 'Webpack', 'Vite'],
    'Backend': ['Node.js', 'Python', 'Go', 'Express', 'Django', 'Flask', 'NestJS', 'GraphQL', 'REST API', 'Ruby on Rails', 'PHP', 'Java', 'Spring Boot', 'C#', '.NET'],
    'Database Management': ['PostgreSQL', 'MongoDB', 'SQLite', 'MySQL', 'Redis', 'SQL', 'NoSQL', 'Prisma', 'TypeORM', 'Mongoose', 'Sanity'],
    'CyberSecurity/SecOps': ['OWASP', 'Penetration Testing', 'Security Audits', 'Threat Modeling', 'Encryption', 'Authentication', 'Authorization', 'OAuth', 'JWT', 'SSO', 'MFA'],
    'Design Systems': ['Storybook', 'Figma', 'UI/UX', 'Design Tokens', 'Component Library', 'Material UI', 'Ant Design', 'Chakra UI']
  };

  const resetExpForm = () => {
    setExpForm({ startDate: '', endDate: '', isPresent: false, title: '', subtitle: '', bullets: '', type: 'work' });
    setEditingExperienceId(null);
    setFormError(null);
  };

  const closeExpForm = () => {
    setEditingExperienceId(null);
    setIsCreatingNew(false);
    resetExpForm();
  };

  const resetTimeEntryForm = () => {
    setTimeEntryForm({
      projectId: '',
      date: new Date().toISOString().split('T')[0],
      hours: '',
      notes: ''
    });
    setIsLoggingTime(false);
    setFormError(null);
  };
  // --- Data Fetching ---

  const fetchData = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      const [inqRes, projRes, expRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/inquiries`, { credentials: 'include' }),
        fetch(`${apiBase}/api/projects`),
        fetch(`${apiBase}/api/admin/experience`, { credentials: 'include' })
        // TODO: Add fetch for time entries once backend is ready
        // fetch(`${apiBase}/api/admin/time-entries`, { credentials: 'include' })
      ]);
      
      if (inqRes.ok) setInquiries(await inqRes.json());
      if (projRes.ok) setProjects(await projRes.json());
      if (expRes.ok) setExperiences(await expRes.json());
      // if (timeRes.ok) setTimeEntries(await timeRes.json());
    } catch (error) {
      console.error("Dashboard sync error:", error);
    }
  };

  // --- Effects ---

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (projects.length > 0) {
      const totalProjects = projects.length;
      const categoryCounts: { [key: string]: number } = {};

      for (const category in skillCategories) {
        categoryCounts[category] = 0;
      }

      projects.forEach(project => {
        const projectSkills = new Set<string>(); // Use a Set to avoid double counting skills within one project

        // Process project.stack (assuming it's a comma-separated string or array)
        if (typeof project.stack === 'string' && project.stack) {
          project.stack.split(',').forEach((s: string) => projectSkills.add(s.trim()));
        } else if (Array.isArray(project.stack)) {
          project.stack.forEach((s: string) => projectSkills.add(s.trim()));
        }

        // Process project.tags (assuming it's a comma-separated string or array)
        if (typeof project.tags === 'string' && project.tags) {
          project.tags.split(',').forEach((t: string) => projectSkills.add(t.trim()));
        } else if (Array.isArray(project.tags)) {
          project.tags.forEach((t: string) => projectSkills.add(t.trim()));
        }

        const categoriesMatchedForProject = new Set<string>(); // Track categories this project has already contributed to

        projectSkills.forEach(pSkill => {
          for (const category in skillCategories) {
            if (!categoriesMatchedForProject.has(category) && skillCategories[category].some(keyword => pSkill.toLowerCase().includes(keyword.toLowerCase()))) {
              categoryCounts[category]++;
              categoriesMatchedForProject.add(category); // Mark this category as matched for this project
            }
          }
        });
      });

      const calculatedSkillUsage = Object.keys(categoryCounts).map(category => ({
        name: category,
        percentage: totalProjects > 0 ? (categoryCounts[category] / totalProjects) * 100 : 0
      }));
      setSkillUsage(calculatedSkillUsage);
    } else {
      setSkillUsage([]); // Clear skill usage if no projects
    }

    // Calculate tag frequency for the tag input dropdown
    if (projects.length >= 0) {
      const tagMap: Record<string, number> = {};
      
      // Seed with default skills from categories so they always appear as options
      Object.values(skillCategories).flat().forEach(skill => {
        tagMap[skill] = 0;
      });

      projects.forEach(p => {
        const pTags = typeof p.tags === 'string' ? p.tags.split(',') : p.tags;
        if (Array.isArray(pTags)) {
          pTags.forEach(t => {
            const trimmed = t.trim();
            if (trimmed) {
              tagMap[trimmed] = (tagMap[trimmed] || 0) + 1;
            }
          });
        }
      });
      const sortedTags = Object.entries(tagMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      setAvailableTags(sortedTags);
    }
  }, [projects]); // Recalculate when projects change

  // --- Project Management ---

  const deleteProject = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this project from the menu?")) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/projects/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  const openEditProject = (project: any) => {
    // If clicking the same one, just close it
    if (editingProjectId === project.id) {
      return closeProjectForm();
    }

    setIsCreatingNew(false);
    setEditingProjectId(project.id);
    setProjectForm({
      projectId: project.projectId || '',
      name: project.name,
      clientName: project.clientName || '',
      clientEmail: project.clientEmail || '',
      clientContact: project.clientContact || '',
      contractType: project.contractType || 'Fixed-price',
      projectType: project.projectType || 'Full-stack',
      status: project.status || 'Active',
      contractValue: project.contractValue || '',
      amountInvoiced: project.amountInvoiced || '',
      amountOutstanding: project.amountOutstanding || '',
      paymentTerms: project.paymentTerms || 'Net-30',
      depositPaid: project.depositPaid || 'No',
      startDate: project.startDate || '',
      deadline: project.deadline || '',
      estHours: project.estHours || '',
      loggedHours: project.loggedHours || '',
      effectiveRate: project.effectiveRate || '',
      revisionRounds: project.revisionRounds || '0 of 3',
      scopeChanges: project.scopeChanges || '0',
      stack: project.stack || '',
      hosting: project.hosting || '',
      repo: project.repo || '',
      stagingUrl: project.stagingUrl || '',
      ndaSigned: project.ndaSigned || 'No',
      contractSigned: project.contractSigned || 'No',
      lastMilestone: project.lastMilestone || '',
      nextMilestone: project.nextMilestone || '',
      priority: project.priority || 'Medium',
      internalNotes: project.internalNotes || '',
      description: project.description,
      isPublic: project.isPublic ?? true,
      thumbnail: project.thumbnail || '',
      tags: typeof project.tags === 'string' ? project.tags : project.tags.join(', '),
      category: project.category,
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
    });
    setFormError(null);
  };

  const openEditExperience = (exp: any) => {
    setEditingExperienceId(exp.id);
    
    setExpForm({
      startDate: exp.startDate || '',
      endDate: '', // End date is part of the formatted 'year' string, we leave it to user to adjust
      isPresent: exp.year.toLowerCase().includes('present'),
      title: exp.title,
      subtitle: exp.subtitle,
      bullets: Array.isArray(exp.bullets) ? exp.bullets.join('\n') : '',
      type: exp.type
    });
  };

  const deleteExperience = async (id: number) => {
    if (!window.confirm("Remove this experience entry?")) return;
    try {
      const res = await fetch(`${apiBase}/api/admin/experience/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Delete experience error:", err);
    }
  };

  const deleteInquiry = async (id: number) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await fetch(`${apiBase}/api/admin/inquiries/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const markInquiryRead = async (id: number) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/inquiries/${id}/read`, { method: 'PATCH', credentials: 'include' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validations
    if (projectForm.name.trim().length < 2) return setFormError("Name must be at least 2 characters.");
    if (projectForm.description.trim().length < 10) return setFormError("Description must be at least 10 characters.");
    if (!projectForm.tags.trim()) return setFormError("Please add at least one tag.");

    // Auto-generate ID if missing
    const finalForm = { ...projectForm };
    if (!finalForm.projectId && !editingProjectId) {
      finalForm.projectId = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Auto-calc outstanding
    const val = parseFloat(finalForm.contractValue) || 0;
    const inv = parseFloat(finalForm.amountInvoiced) || 0;
    finalForm.amountOutstanding = (val - inv).toString();

    const method = editingProjectId ? 'PUT' : 'POST';
    const url = editingProjectId 
      ? `${apiBase}/api/admin/projects/${editingProjectId}` 
      : `${apiBase}/api/admin/projects`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalForm),
        credentials: 'include'
      });

      if (!res.ok) throw new Error();
      
      closeProjectForm();
      fetchData();
    } catch (err) {
      setFormError("The coffee machine is jammed. Failed to save project.");
    }
  };

  const closeProjectForm = () => {
    setEditingProjectId(null);
    setIsCreatingNew(false);
    setProjectForm({
      projectId: '',
      name: '',
      clientName: '',
      clientEmail: '',
      clientContact: '',
      contractType: 'Fixed-price',
      projectType: 'Full-stack',
      status: 'Active',
      contractValue: '',
      amountInvoiced: '',
      amountOutstanding: '',
      paymentTerms: 'Net-30',
      depositPaid: 'No',
      startDate: '',
      deadline: '',
      estHours: '',
      loggedHours: '',
      effectiveRate: '',
      revisionRounds: '0 of 3',
      scopeChanges: '0',
      stack: '',
      hosting: '',
      repo: '',
      stagingUrl: '',
      ndaSigned: 'No',
      contractSigned: 'No',
      lastMilestone: '',
      nextMilestone: '',
      priority: 'Medium',
      internalNotes: '',
      description: '',
      isPublic: true,
      thumbnail: '',
      tags: '',
      category: 'Full-stack Contract',
      githubUrl: '',
      liveUrl: '',
    });
    setFormError(null);
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (expForm.title.length < 2) return setFormError("Title is too short.");
    
    const formatDisplayDate = (val: string) => {
      if (!val) return '';
      const [y, m] = val.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const yearRange = `${formatDisplayDate(expForm.startDate)} — ${expForm.isPresent ? 'Present' : formatDisplayDate(expForm.endDate)}`;

    const method = editingExperienceId ? 'PUT' : 'POST';
    const url = editingExperienceId 
      ? `${apiBase}/api/admin/experience/${editingExperienceId}` 
      : `${apiBase}/api/admin/experience`;

    try {
      // Convert newline-separated bullets to a JSON string for the DB
      const bulletArray = expForm.bullets.split('\n').filter(b => b.trim() !== '');
      
      const finalEntry = {
        title: expForm.title,
        subtitle: expForm.subtitle,
        type: expForm.type,
        year: yearRange,
        startDate: expForm.startDate,
        bullets: JSON.stringify(bulletArray)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalEntry),
        credentials: 'include'
      });

      if (!res.ok) throw new Error();
      closeExpForm();
      fetchData();
    } catch (err) {
      setFormError("Failed to brew this experience entry.");
    }
  };

  const handleTimeEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!timeEntryForm.projectId) return setFormError("Please select a project.");
    if (parseFloat(timeEntryForm.hours) <= 0) return setFormError("Hours must be greater than 0.");
    if (!timeEntryForm.date) return setFormError("Please select a date.");

    try {
      // First, save the time entry
      const timeEntryRes = await fetch(`${apiBase}/api/admin/time-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeEntryForm),
        credentials: 'include'
      });

      if (!timeEntryRes.ok) throw new Error("Failed to save time entry.");

      // Then, update the project's logged hours
      const projectToUpdate = projects.find(p => p.id === parseInt(timeEntryForm.projectId));
      if (projectToUpdate) {
        const newLoggedHours = (parseFloat(projectToUpdate.loggedHours || '0') + parseFloat(timeEntryForm.hours)).toString();
        
        const updatedProject = {
          ...projectToUpdate,
          loggedHours: newLoggedHours,
          // Recalculate amountOutstanding if contractType is Hourly
          amountOutstanding: projectToUpdate.contractType === 'Hourly' 
            ? (parseFloat(projectToUpdate.estHours || '0') * parseFloat(projectToUpdate.effectiveRate || '0') - parseFloat(newLoggedHours) * parseFloat(projectToUpdate.effectiveRate || '0')).toString()
            : projectToUpdate.amountOutstanding // Keep existing for fixed-price
        };

        const projectUpdateRes = await fetch(`${apiBase}/api/admin/projects/${projectToUpdate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProject),
          credentials: 'include'
        });

        if (!projectUpdateRes.ok) throw new Error("Failed to update project logged hours.");
      }
      resetTimeEntryForm();
      fetchData(); // Re-fetch all data to update dashboard
    } catch (err: any) {
      setFormError(err.message || "Failed to log time.");
    }
  };

  // --- Client List Sorting Logic ---
  const handleClientListSort = (column: string) => {
    if (clientListSortColumn === column) {
      setClientListSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setClientListSortColumn(column);
      setClientListSortDirection('asc');
    }
  };

  const sortedClientProjects = useMemo(() => {
    let sortableProjects = [...projects];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      sortableProjects = sortableProjects.filter(p => 
        p.name?.toLowerCase().includes(term) ||
        p.clientName?.toLowerCase().includes(term) ||
        p.clientEmail?.toLowerCase().includes(term)
      );
    }

    if (clientListStatusFilter !== 'All') {
      sortableProjects = sortableProjects.filter(p => p.status === clientListStatusFilter);
    }

    if (clientListSortColumn) {
      sortableProjects.sort((a, b) => {
        const aValue = a[clientListSortColumn] || '';
        const bValue = b[clientListSortColumn] || '';

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return clientListSortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        // Fallback for other types or if values are not strings
        if (aValue < bValue) return clientListSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return clientListSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableProjects;
  }, [projects, clientListSortColumn, clientListSortDirection, searchTerm, clientListStatusFilter]);

  // --- Notes & Comms Filtering/Sorting Logic ---
  const handleInquirySort = (column: string) => {
    if (inquirySortColumn === column) {
      setInquirySortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setInquirySortColumn(column);
      setInquirySortDirection('asc');
    }
  };

  const filteredAndSortedInquiries = useMemo(() => {
    let filtered = inquiries;
    if (inquiryFilterReadStatus === 'unread') {
      filtered = inquiries.filter(iq => !iq.isRead);
    } else if (inquiryFilterReadStatus === 'read') {
      filtered = inquiries.filter(iq => iq.isRead);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(iq => 
        iq.name?.toLowerCase().includes(term) ||
        iq.email?.toLowerCase().includes(term) ||
        iq.message?.toLowerCase().includes(term)
      );
    }

    if (inquirySortColumn) {
      filtered.sort((a, b) => {
        const aValue = inquirySortColumn === 'createdAt' ? new Date(a[inquirySortColumn]).getTime() : a[inquirySortColumn] || '';
        const bValue = inquirySortColumn === 'createdAt' ? new Date(b[inquirySortColumn]).getTime() : b[inquirySortColumn] || '';

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return inquirySortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return inquirySortDirection === 'asc' ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
      });
    }
    return filtered;
  }, [inquiries, inquiryFilterReadStatus, inquirySortColumn, inquirySortDirection, searchTerm]);

  // Protect route and handle redirection back to target
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Filter projects based on active sidebar tab
  const filteredProjects = projects.filter(p => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!p.name?.toLowerCase().includes(term) && !p.description?.toLowerCase().includes(term)) {
        return false;
      }
    }

    if (activeTab === 'projects-active') return p.status === 'Active';
    if (activeTab === 'projects-review') return p.status === 'Review';
    if (activeTab === 'projects-completed') return p.status === 'Completed';
    if (activeTab === 'projects-archived') return p.status === 'Archived';
    return true;
  });

  // KPI: Active Count for the Overview section
  const activeCount = projects.filter(p => p.status === 'Active').length;

  // Notifications Logic
  const overdueProjects = projects.filter(p => {
    if (p.status !== 'Active' || !p.deadline) return false;
    const deadlineDate = new Date(p.deadline);
    return !isNaN(deadlineDate.getTime()) && deadlineDate < new Date();
  });

  const unreadInquiries = inquiries.filter(iq => !iq.isRead);

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex h-screen bg-[--bg-alt] overflow-hidden">
      {/* Animated Sidebar */}
      <motion.aside 
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        className="border-r border-[--border] bg-[--bg] hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-50"
      >
        <div className="p-6 border-b border-[--border] flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-full bg-[--accent] text-[--bg] flex items-center justify-center font-bold shrink-0">J</div>
                <span className="font-bold tracking-tight">JRoybalDev</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-[--border] text-[--muted] transition-colors"
          >
            {isSidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {/* Category: Overview */}
          <div className="flex flex-col gap-1">
            <SidebarLink 
              icon={FiGrid} label="Dashboard" 
              isActive={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')} 
              collapsed={isSidebarCollapsed} 
            />
            <SidebarLink 
              icon={FiPlusSquare} label="New Project" 
              onClick={() => { setActiveTab('projects-active'); setIsCreatingNew(true); }} 
              collapsed={isSidebarCollapsed} 
            />
            <SidebarLink
              icon={FiClock} label="Manage Timeline"
              isActive={activeTab === 'experience-list'}
              onClick={() => setActiveTab('experience-list')}
              collapsed={isSidebarCollapsed}
            />
          </div>
          <div className="border-b rounded-md border-[--border]"/>
          {/* Accordion Categories */}
          <LayoutGroup>
            <AccordionCategory 
              id="projects" label="Projects" icon={FiCircle} 
              isOpen={openAccordion === 'projects'} 
              onToggle={() => setOpenAccordion(openAccordion === 'projects' ? null : 'projects')}
              collapsed={isSidebarCollapsed}
            >
              <SidebarLink icon={FiCircle} label="Active" isActive={activeTab === 'projects-active'} onClick={() => setActiveTab('projects-active')} />
              <SidebarLink icon={FiChevronDown} label="In Review" isActive={activeTab === 'projects-review'} onClick={() => setActiveTab('projects-review')} />
              <SidebarLink icon={FiCheckSquare} label="Completed" isActive={activeTab === 'projects-completed'} onClick={() => setActiveTab('projects-completed')} />
              <SidebarLink icon={FiXSquare} label="Archived" isActive={activeTab === 'projects-archived'} onClick={() => setActiveTab('projects-archived')} />
            </AccordionCategory>

            <AccordionCategory 
              id="finance" label="Finance" icon={FiCreditCard} 
              isOpen={openAccordion === 'finance'} 
              onToggle={() => setOpenAccordion(openAccordion === 'finance' ? null : 'finance')}
              collapsed={isSidebarCollapsed}
            >
              <SidebarLink icon={FiCreditCard} label="Invoices" isActive={activeTab === 'finance-invoices'} onClick={() => setActiveTab('finance-invoices')} />
              <SidebarLink icon={FiTrendingUp} label="Revenue" isActive={activeTab === 'finance-revenue'} onClick={() => setActiveTab('finance-revenue')} />
              <SidebarLink icon={FiClock} label="Time Tracking" isActive={activeTab === 'finance-time'} onClick={() => setActiveTab('finance-time')} />
            </AccordionCategory>

            <AccordionCategory 
              id="clients" label="Clients" icon={FiUsers} 
              isOpen={openAccordion === 'clients'} 
              onToggle={() => setOpenAccordion(openAccordion === 'clients' ? null : 'clients')}
              collapsed={isSidebarCollapsed}
            >
              <SidebarLink icon={FiUsers} label="Client List" isActive={activeTab === 'clients-list'} onClick={() => setActiveTab('clients-list')} />
              <SidebarLink icon={FiMessageSquare} label="Notes & Comms" isActive={activeTab === 'clients-notes'} onClick={() => setActiveTab('clients-notes')} />
            </AccordionCategory>

            <AccordionCategory 
              id="system" label="System" icon={FiSettings} 
              isOpen={openAccordion === 'system'} 
              onToggle={() => setOpenAccordion(openAccordion === 'system' ? null : 'system')}
              collapsed={isSidebarCollapsed}
            >
              <SidebarLink icon={FiSettings} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </AccordionCategory>
          </LayoutGroup>
        </nav>

        <div className="p-4 border-t border-[--border]">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={signOut} 
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 text-sm transition-colors w-full overflow-hidden"
          >
            <FiLogOut size={16} className="shrink-0" /> 
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto h-screen">
        {/* Utility Top Bar */}
        <div className="flex justify-between items-center mb-6 pb-4 rounded-md border-[--border] border-b">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[--muted] hover:text-[--accent] transition-colors">
            <FiArrowLeft size={12} /> Back to Website
          </Link>
          <div className="flex items-center gap-4 relative">
             {/* Overdue Projects Notification */}
             <div className="relative">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setActiveDropdown(activeNotification === 'overdue' ? null : 'overdue')}
                 className={`relative p-2 rounded-full transition-colors ${activeNotification === 'overdue' ? 'bg-red-500/20 text-red-500' : 'text-[--muted] hover:text-red-500 hover:bg-red-500/10'}`}
               >
                 <FiAlertTriangle size={16} />
                 {overdueProjects.length > 0 && (
                   <motion.span 
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-red-600 text-white rounded-full border-2 border-[--bg]"
                   >{overdueProjects.length}</motion.span>
                 )}
               </motion.button>
               <AnimatePresence>
                 {activeNotification === 'overdue' && (
                   <NotificationDropdown 
                     title="Overdue Projects"
                     items={overdueProjects.map(p => ({ id: p.id, label: p.name, sub: `Due: ${p.deadline}` }))}
                     onItemClick={(id: number) => {
                        const p = projects.find(proj => proj.id === id);
                        setActiveTab('projects-active');
                        setOpenAccordion('projects');
                        openEditProject(p);
                        setActiveDropdown(null);
                     }}
                     onClose={() => setActiveDropdown(null)}
                   />
                 )}
               </AnimatePresence>
             </div>

             {/* Inquiries Notification */}
             <div className="relative">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setActiveDropdown(activeNotification === 'inquiries' ? null : 'inquiries')}
                 className={`relative p-2 rounded-full transition-colors ${activeNotification === 'inquiries' ? 'bg-[--accent-soft]/20 text-[--accent]' : 'text-[--muted] hover:text-[--text] hover:bg-[--border]/30'}`}
               >
                 <FiBell size={16} />
                 {unreadInquiries.length > 0 && (
                   <motion.span 
                     key={unreadInquiries.length}
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-[--accent] text-[--bg] rounded-full"
                   >{unreadInquiries.length}</motion.span>
                 )}
               </motion.button>
               <AnimatePresence>
                 {activeNotification === 'inquiries' && (
                   <NotificationDropdown 
                     title="Unread Inquiries"
                     items={unreadInquiries.map(i => ({ id: i.id, label: i.name, sub: i.projectType }))}
                     actionIcon={<FiCheck size={12} />}
                     onActionClick={(id: number) => markInquiryRead(id)}
                     onItemClick={() => {
                        setActiveTab('clients-notes');
                        setOpenAccordion('clients');
                        setActiveDropdown(null);
                     }}
                     onClose={() => setActiveDropdown(null)}
                   />
               )}
               </AnimatePresence>
             </div>
          </div>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <p className="eyebrow !mb-1">Control Center</p>
            <h1 className="text-2xl font-bold tracking-tight capitalize">
              {activeTab === 'overview' && 'Overview'}
              {activeTab.startsWith('projects') && 'Projects'}
              {activeTab === 'finance-invoices' && 'Invoices'}
              {activeTab === 'finance-revenue' && 'Revenue'}
              {activeTab === 'finance-time' && 'Time Entries'}
              {activeTab === 'clients-list' && 'Clients'}
              {activeTab === 'experience-management' && 'Experience Management'}
              {activeTab === 'experience-list' && 'Timeline History'}
              {activeTab === 'clients-notes' && 'Communications'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" />
              <input 
                type="text" 
                placeholder="Search data..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[--bg] border border-[--border] rounded-full text-sm w-full md:w-64 focus:outline-none focus:border-[--accent]" 
              />
            </div>
            <Button mode="primary" label="+ Create" onClick={() => {
              if (activeTab === 'experience-list') {
                closeExpForm();
                setIsCreatingNew(true);
                return;
              } else if (activeTab === 'finance-time') {
                resetTimeEntryForm();
                setIsLoggingTime(true);
                setFormError(null);
                return;
              }
              closeProjectForm();
              setIsCreatingNew(true);
              setFormError(null);
              setActiveTab('projects-active');
            }} />
          </div>
        </header>

        <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Metrics Row */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <motion.div variants={itemVariants} className="bg-[--bg] border border-[--border] p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-1">Active Projects</p>
                <h2 className="text-2xl font-bold">{activeCount}</h2>
                <p className="text-[10px] text-green-500 mt-1 font-bold">+2 from last month</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-[--bg] border border-[--border] p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-1">YTD Revenue</p>
                <h2 className="text-2xl font-bold">$48,200</h2>
                <p className="text-[10px] text-green-500 mt-1 font-bold">+18% vs prior year</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-[--bg] border border-[--border] p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-1">Billable Rate</p>
                <h2 className="text-2xl font-bold">84%</h2>
                <p className="text-[10px] text-amber-500 mt-1 font-bold">Healthy capacity</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-[--bg] border border-[--border] p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-1">New Inquiries</p>
                <h2 className="text-2xl font-bold">{inquiries.length}</h2>
                <p className="text-[10px] text-[--muted] mt-1 font-bold">Pending review</p>
              </motion.div>
            </motion.div>

            {/* Skill Usage Section */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold flex items-center gap-2"><FiTrendingUp className="text-[--accent]" /> Skill Usage</h3>
              </div>
              <div className="bg-[--bg] border border-[--border] rounded-2xl overflow-hidden shadow-sm p-6">
                <div className="flex flex-col gap-4">
                  {skillUsage.length > 0 ? skillUsage.map((skill, index) => (
                    <div key={skill.name} className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[--text]">
                        <span>{skill.name}</span>
                        <span className="opacity-50">{skill.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[--border] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-[--accent] rounded-full"
                        />
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-[--muted]">No projects to calculate skill usage.</p>
                  )}
                </div>
              </div>
            </motion.section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left: Snapshots */}
              <div className="xl:col-span-2 flex flex-col gap-8">
                {/* Inquiries Snapshot */}
                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold flex items-center gap-2"><FiMail className="text-[--accent]" /> Recent Inquiries</h3>
                    <button onClick={() => setActiveTab('clients-notes')} className="text-[10px] font-bold uppercase tracking-widest text-[--accent] hover:underline">View inbox</button>
                  </div>
                  <div className="bg-[--bg] border border-[--border] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[--bg-alt]/30 text-[10px] font-bold uppercase tracking-widest border-b border-[--border]">
                          <tr>
                            <th className="px-6 py-4">Sender</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {inquiries.slice(0, 5).map((iq) => (
                            <tr key={iq.id} className="hover:bg-[--accent-soft]/5 transition-colors group">
                              <td className="px-6 py-4 font-bold">{iq.name}</td>
                              <td className="px-6 py-4"><span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[--border]">{iq.projectType}</span></td>
                              <td className="px-6 py-4 text-xs text-[--muted]">{new Date(iq.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.section>
              </div>

              {/* Right: Activity */}
              <div className="flex flex-col gap-8">
                <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-[--bg] border border-[--border] p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><FiClock className="text-[--accent]" /> Recent Activity</h3>
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[--accent] mt-2 shrink-0"></div>
                        <div>
                          <p className="text-xs font-medium leading-relaxed">System sync successful.</p>
                          <p className="text-[10px] text-[--muted] mt-0.5">Automated Task</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'clients-notes' && (
          <motion.div 
            key="notes"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-[--bg] border border-[--border] rounded-2xl overflow-hidden shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-[--border] flex-wrap gap-4">
                <h3 className="text-sm font-bold">Inbox</h3>
                <div className="flex gap-2">
                  {(['all', 'unread', 'read'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setInquiryFilterReadStatus(status)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                        inquiryFilterReadStatus === status
                          ? 'bg-[--accent] text-[--bg]'
                          : 'bg-[--bg-alt] text-[--muted] hover:text-[--text] border border-[--border]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[--bg-alt]/50 text-[10px] font-bold uppercase tracking-widest border-b border-[--border]">
                    <tr>
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleInquirySort('name')}>
                        <div className="flex items-center gap-1">Sender {inquirySortColumn === 'name' && (inquirySortDirection === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}</div>
                      </th>
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleInquirySort('projectType')}>
                        <div className="flex items-center gap-1">Type {inquirySortColumn === 'projectType' && (inquirySortDirection === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}</div>
                      </th>
                      <th className="px-6 py-4">Message</th>
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleInquirySort('createdAt')}>
                        <div className="flex items-center gap-1">Date {inquirySortColumn === 'createdAt' && (inquirySortDirection === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}</div>
                      </th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[--border]">
                    {filteredAndSortedInquiries.length > 0 ? filteredAndSortedInquiries.map((iq) => (
                      <tr key={iq.id} className={`hover:bg-[--accent-soft]/5 transition-colors group ${!iq.isRead ? 'bg-[--accent-soft]/5 border-l-2 border-l-[--accent]' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {!iq.isRead && <div className="w-1.5 h-1.5 rounded-full bg-[--accent]" title="Unread" />}
                            <div className="font-bold group-hover:text-[--accent] transition-colors">{iq.name}</div>
                          </div>
                          <div className="text-[10px] text-[--muted]">{iq.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[--border]">{iq.projectType}</span>
                        </td>
                        <td className="px-6 py-4 text-[--muted] max-w-[400px] break-words">{iq.message}</td>
                        <td className="px-6 py-4 text-xs text-[--muted]">{new Date(iq.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => deleteInquiry(iq.id)}
                            className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                          ><FiTrash2 size={14} /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-12 text-center text-[--muted]">No inquiries found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'clients-list' && (
          <motion.div 
            key="clients-list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-[--bg] border border-[--border] rounded-2xl overflow-hidden shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-[--border] flex-wrap gap-4">
                <h3 className="text-sm font-bold">Project Leads & Contacts</h3>
                <div className="flex gap-2">
                  {['All', 'Active', 'Completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setClientListStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                        clientListStatusFilter === status
                          ? 'bg-[--accent] text-[--bg]'
                          : 'bg-[--bg-alt] text-[--muted] hover:text-[--text] border border-[--border]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[--bg-alt]/50 text-[10px] font-bold uppercase tracking-widest border-b border-[--border]">
                    <tr>
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleClientListSort('name')}><div className="flex items-center gap-1">Project Name {clientListSortColumn === 'name' && (clientListSortDirection === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}</div></th>
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleClientListSort('status')}><div className="flex items-center gap-1">Status {clientListSortColumn === 'status' && (clientListSortDirection === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}</div></th>
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleClientListSort('clientName')}><div className="flex items-center gap-1">Client Name {clientListSortColumn === 'clientName' && (clientListSortDirection === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}</div></th>
                      <th className="px-6 py-4 cursor-pointer" onClick={() => handleClientListSort('clientEmail')}><div className="flex items-center gap-1">Client Email {clientListSortColumn === 'clientEmail' && (clientListSortDirection === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}</div></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[--border]">
                    {sortedClientProjects.length > 0 ? sortedClientProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-[--accent-soft]/5 transition-colors group">
                        <td className="px-6 py-4 font-bold group-hover:text-[--accent] transition-colors">{p.name}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            p.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                            p.status === 'Review' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-[--border] text-[--muted]'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{p.clientName || <span className="text-[--muted] italic">N/A</span>}</td>
                        <td className="px-6 py-4">{p.clientEmail || <span className="text-[--muted] italic">N/A</span>}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-12 text-center text-[--muted]">No clients found in projects.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'finance-time' && (
          <motion.div
            key="finance-time"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-[--bg] border border-[--border] rounded-2xl overflow-hidden shadow-sm">
              <div className="flex justify-between items-center p-4 border-b border-[--border] flex-wrap gap-4">
                <h3 className="text-sm font-bold">Time Entries</h3>
                {/* Add filter/sort for time entries if needed later */}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[--bg-alt]/50 text-[10px] font-bold uppercase tracking-widest border-b border-[--border]">
                    <tr>
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Hours</th>
                      <th className="px-6 py-4">Notes</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[--border]">
                    {isLoggingTime && (
                      <tr>
                        <td colSpan={5} className="bg-[--bg-alt]/30 p-0 border-b-2 border-[--accent-soft]">
                          <div className="p-8 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-[--accent]">Log New Time Entry</h3>
                              <button onClick={resetTimeEntryForm} className="text-[10px] uppercase font-bold text-[--muted] hover:text-red-500">Cancel</button>
                            </div>
                            <TimeEntryForm
                              form={timeEntryForm}
                              setForm={setTimeEntryForm}
                              onSubmit={handleTimeEntrySubmit}
                              error={formError}
                              projects={projects} // Pass projects for selection
                              onCancel={resetTimeEntryForm}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                    {timeEntries.length > 0 ? timeEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[--accent-soft]/5 transition-colors">
                        <td className="px-6 py-4 font-bold">{projects.find(p => p.id === entry.projectId)?.name || 'N/A'}</td>
                        <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{entry.hours}</td>
                        <td className="px-6 py-4 text-[--muted] max-w-[400px] break-words">{entry.notes}</td>
                        <td className="px-6 py-4 text-right">
                          {/* Add edit/delete for time entries if needed */}
                          <button
                            onClick={() => console.log('Edit time entry', entry.id)} // Placeholder
                            className="p-2 text-[--muted] hover:text-blue-500 transition-colors"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => console.log('Delete time entry', entry.id)} // Placeholder
                            className="p-2 text-[--muted] hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-12 text-center text-[--muted]">No time entries found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab.startsWith('projects') && (
          <motion.div 
            key="projects"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-[--bg] border border-[--border] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[--bg-alt]/50 text-[10px] font-bold uppercase tracking-widest border-b border-[--border]">
                  <tr>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Tags</th>
                    <th className="px-6 py-4">Repository</th>
                    <th className="px-6 py-4 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[--border]">
                  {/* Inline Creation Row */}
                  {isCreatingNew && (
                    <tr>
                      <td colSpan={5} className="bg-[--bg-alt]/30 p-0 border-b-2 border-[--accent-soft]">
                        <div className="p-8 animate-in slide-in-from-top-4 duration-300">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[--accent]">Brew New Project</h3>
                            <button onClick={closeProjectForm} className="text-[10px] uppercase font-bold text-[--muted] hover:text-red-500">Cancel</button>
                          </div>
                          <ProjectInlineForm 
                            form={projectForm} 
                            setForm={setProjectForm} 
                            onSubmit={handleProjectSubmit} 
                            error={formError} 
                            availableTags={availableTags}
                          />
                        </div>
                      </td>
                    </tr>
                  )}

                  {filteredProjects.map((project) => (
                    <React.Fragment key={project.id}>
                    <motion.tr layout key={project.id} className="hover:bg-[--accent-soft]/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{project.name}</td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[--accent-soft]/20 text-[--accent]">{project.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {typeof project.tags === 'string' ? project.tags.split(',').map((t: string) => <span key={t} className="text-[10px] bg-[--border] px-1.5 rounded">{t.trim()}</span>) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs truncate max-w-[150px]">
                        {project.githubUrl ? <a href={project.githubUrl} target="_blank" className="text-blue-500 hover:underline">View Repo</a> : "Private"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {project.liveUrl && (
                            <a 
                              href={project.liveUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 text-[--muted] hover:text-[--accent] transition-colors"
                              title="Preview Live"
                            >
                              <FiEye size={16} />
                            </a>
                          )}
                          <button 
                            onClick={() => openEditProject(project)}
                            className="p-2 text-[--muted] hover:text-blue-500 transition-colors"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteProject(project.id)}
                            className="p-2 text-[--muted] hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                    {/* Inline Edit Dropdown Row */}
                    {editingProjectId === project.id && (
                      <tr>
                        <td colSpan={5} className="bg-[--bg-alt]/30 p-0 border-y-2 border-[--accent-soft]">
                          <div className="p-8 animate-in slide-in-from-top-2 duration-300">
                            <ProjectInlineForm 
                              form={projectForm} 
                              setForm={setProjectForm} 
                              onSubmit={handleProjectSubmit} 
                              error={formError} 
                              availableTags={availableTags}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'experience-list' && (
          <motion.div key="exp-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-[--bg] border border-[--border] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[--bg-alt]/50 text-[10px] font-bold uppercase tracking-widest border-b border-[--border]">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Timeline</th>
                    <th className="px-6 py-4 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[--border]">
                  {/* Inline Creation Row for Experience */}
                  {activeTab === 'experience-list' && isCreatingNew && (
                    <tr>
                      <td colSpan={4} className="bg-[--bg-alt]/30 p-0 border-b-2 border-[--accent-soft]">
                        <div className="p-8 animate-in slide-in-from-top-4 duration-300">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[--accent]">New Timeline Entry</h3>
                            <button onClick={closeExpForm} className="text-[10px] uppercase font-bold text-[--muted] hover:text-red-500">Cancel</button>
                          </div>
                          <ExperienceForm
                            form={expForm}
                            setForm={setExpForm}
                            onSubmit={handleExperienceSubmit}
                            error={formError}
                          />
                        </div>
                      </td>
                    </tr>
                  )}

                  {experiences.length > 0 ? experiences.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || '')).map((exp) => (
                    <React.Fragment key={exp.id}>
                    <tr className="hover:bg-[--accent-soft]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{exp.title}</div>
                        <div className="text-[10px] text-[--muted]">{exp.subtitle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[--border]">{exp.type}</span>
                      </td>
                      <td className="px-6 py-4 text-xs">{exp.year}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openEditExperience(exp)}
                          className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-lg transition-colors mr-2"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteExperience(exp.id)}
                          className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                    {/* Inline Edit Row for Experience */}
                    {editingExperienceId === exp.id && (
                      <tr>
                        <td colSpan={4} className="bg-[--bg-alt]/30 p-0 border-y-2 border-[--accent-soft]">
                          <div className="p-8 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-[--accent]">Edit Entry</h3>
                              <button onClick={closeExpForm} className="text-[10px] uppercase font-bold text-[--muted] hover:text-red-500">Cancel</button>
                            </div>
                            <ExperienceForm
                              form={expForm}
                              setForm={setExpForm}
                              onSubmit={handleExperienceSubmit}
                              error={formError}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-[--muted]">No history recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
}

/**
 * Reusable Notification Dropdown
 */
function NotificationDropdown({ title, items, onItemClick, onActionClick, actionIcon, onClose }: any) {
  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute top-full right-0 mt-2 w-64 bg-[--bg] border border-[--border] rounded-2xl shadow-2xl z-[70] overflow-hidden"
      >
        <div className="p-4 border-b border-[--border] bg-[--bg-alt]/30">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">{title}</p>
        </div>
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {items.length > 0 ? items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-[--accent-soft]/5 border-b border-[--border]/50 transition-colors group cursor-pointer" onClick={() => onItemClick(item.id)}>
              <div>
                <p className="text-xs font-bold group-hover:text-[--accent] transition-colors">{item.label}</p>
                <p className="text-[10px] text-[--muted] mt-0.5">{item.sub}</p>
              </div>
              {onActionClick && (
                <button onClick={(e) => { e.stopPropagation(); onActionClick(item.id); }} className="p-1.5 rounded-full hover:bg-[--accent] hover:text-[--bg] text-[--muted] transition-all">
                  {actionIcon}
                </button>
              )}
            </div>
          )) : (
            <div className="p-8 text-center text-[10px] text-[--muted] uppercase font-bold">All caught up! ☕</div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/**
 * Sidebar Link Helper
 */
function SidebarLink({ icon: Icon, label, isActive, onClick, collapsed }: any) {
  return (
    <motion.button 
      layout
      whileHover={{ x: collapsed ? 0 : 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-colors w-full overflow-hidden ${isActive ? 'bg-[--accent-soft]/10 text-[--accent]' : 'text-[--muted] hover:text-[--text] hover:bg-[--border]/30'}`}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </motion.button>
  );
}

/**
 * Accordion Category Helper
 */
function AccordionCategory({ id, label, icon: Icon, isOpen, onToggle, children, collapsed }: any) {
  if (collapsed) {
    return (
      <motion.button 
        layout
        onClick={onToggle}
        className={`flex items-center justify-center p-3 rounded-xl text-[--muted] hover:bg-[--border]/30 transition-colors ${isOpen ? 'text-[--accent]' : ''}`}
      >
        <Icon size={16} />
      </motion.button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button 
        onClick={onToggle}
        className="flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[--muted] hover:text-[--text] transition-colors group"
      >
        <div className="flex items-center gap-3">
           <Icon size={14} className="group-hover:text-[--accent] transition-colors" />
           {label}
        </div>
        <FiChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[--accent]' : ''}`} />
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col gap-1 pl-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Extracted Form Component for Experience/Education/Certificate
 */
function ExperienceForm({ form, setForm, onSubmit, error }: any) {
  return (
    <form onSubmit={onSubmit} className="form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 col-span-full">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Timeline</label>
          <div className="flex items-center gap-4 flex-wrap">
            <input type="month" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required className="w-auto" />
            <span className="text-[--muted]">to</span>
            {!form.isPresent && (
              <input type="month" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required={!form.isPresent} className="w-auto" />
            )}
            <label className="flex items-center gap-2 cursor-pointer ml-2">
              <input type="checkbox" checked={form.isPresent} onChange={e => setForm({...form, isPresent: e.target.checked})} className="w-4 h-4 rounded border-[--border]" />
              <span className="text-xs font-bold uppercase tracking-wide text-[--text]">Current</span>
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Entry Type</label>
          <select
            value={form.type}
            onChange={e => setForm({...form, type: e.target.value as any})}
            className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-3 text-sm"
          >
            <option value="work">Work Experience</option>
            <option value="education">Education</option>
            <option value="certificate">Certificate</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Title / Role</label>
          <input type="text" placeholder="e.g. Senior Barista" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Company / School / Issuer</label>
          <input type="text" placeholder="e.g. Mocha Tech" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} required />
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
          value={form.bullets}
          onChange={e => setForm({...form, bullets: e.target.value})}
          required
        />
      </div>

      {error && (
        <div className="message danger text-xs">{error}</div>
      )}

      <div className="mt-4 pt-4 border-t border-[--border]">
        <Button mode="primary" label="Save Experience ☕" />
      </div>
    </form>
  );
}

// New component: TimeEntryForm
function TimeEntryForm({ form, setForm, onSubmit, error, projects, onCancel }: any) {
  return (
    <form onSubmit={onSubmit} className="form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Project</label>
          <select
            value={form.projectId}
            onChange={e => setForm({...form, projectId: e.target.value})}
            required
            className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-2.5 text-xs"
          >
            <option value="">Select a Project</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Date</label>
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
        </div>
        <div className="flex flex-col gap-2 col-span-full">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Hours Logged</label>
          <input type="number" step="0.01" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} required />
        </div>
        <div className="flex flex-col gap-2 col-span-full">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Notes</label>
          <textarea rows={3} className="resize-none" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
        </div>
      </div>

      {error && (
        <div className="message danger text-xs">{error}</div>
      )}

      <div className="mt-4 pt-4 border-t border-[--border] flex justify-end gap-2">
        <Button mode="secondary" label="Cancel" onClick={onCancel} />
        <Button mode="primary" label="Log Hours" />
      </div>
    </form>
  );
}

/**
 * Tag Input Component with Pills and Suggestions
 */
function TagInput({ tags, onChange, suggestions }: { tags: string, onChange: (val: string) => void, suggestions: {name: string, count: number}[] }) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const tagList = tags.split(',').map(t => t.trim()).filter(t => t !== "");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tagList.includes(trimmed)) {
      const newList = [...tagList, trimmed];
      onChange(newList.join(', '));
    }
    setInputValue("");
    setShowDropdown(false);
  };

  const removeTag = (tagToRemove: string) => {
    const newList = tagList.filter(t => t !== tagToRemove);
    onChange(newList.join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === "" && tagList.length > 0) {
      removeTag(tagList[tagList.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(',')) {
      addTag(val.slice(0, -1));
    } else {
      setInputValue(val);
      setShowDropdown(true);
    }
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.name.toLowerCase().includes(inputValue.toLowerCase()) && 
    !tagList.includes(s.name)
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 bg-[--bg-alt] border border-[--border] rounded-xl focus-within:border-[--accent] transition-all min-h-[42px]">
        {tagList.map(tag => (
          <span key={tag} className="group flex items-center gap-1.5 px-2.5 py-1 bg-[--accent-soft]/20 text-[--accent] rounded-full text-xs font-bold transition-all hover:bg-[--accent-soft]/30">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all flex items-center justify-center">
              <FiX size={12} />
            </button>
          </span>
        ))}
        <input type="text" value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} onFocus={() => setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 200)} className="flex-1 bg-transparent border-none outline-none p-0 text-xs min-w-[80px]" placeholder={tagList.length === 0 ? "Add tags..." : ""} />
      </div>
      {showDropdown && (inputValue !== "" || filteredSuggestions.length > 0) && (
        <div className="absolute left-0 right-0 mt-1 bg-[--bg] border border-[--border] rounded-xl shadow-xl max-h-48 overflow-y-auto z-[100] custom-scrollbar">
          {filteredSuggestions.map(s => (
            <button key={s.name} type="button" onClick={() => addTag(s.name)} className="w-full text-left px-4 py-2 text-xs hover:bg-[--accent-soft]/10 flex justify-between items-center transition-colors">
              <span>{s.name}</span>
              <span className="text-[10px] text-[--muted]">{s.count} used</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Cloudinary Upload Helper
 */
async function uploadToCloudinary(file: File) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing in env.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url;
}

/** 
 * Extracted Form Component for reuse in inline table rows
 */
function ProjectInlineForm({ form, setForm, onSubmit, error, availableTags }: any) {
  const [isUploading, setIsUploading] = useState(false);
  const hasUploadConfig = !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && !!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file);
      setForm({ ...form, thumbnail: url });
    } catch (err) {
      alert("Failed to upload image to Cloudinary.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <div className="flex flex-col gap-8">
        {/* Section 1: Core Info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <h3 className="col-span-full text-xs font-bold uppercase text-[--accent] border-b border-[--border] pb-2">Core Fields</h3>
          {/* Project ID */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Project ID</label>
            <input type="text" placeholder="Auto-generated" value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Visibility</label>
            <select value={form.isPublic ? "Public" : "Private"} onChange={e => setForm({...form, isPublic: e.target.value === "Public"})} className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-2.5 text-xs">
              <option value="Public">Public (On Portfolio)</option>
              <option value="Private">Private (Dashboard Only)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Project Name</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Workflow Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-2.5 text-xs">
              <option value="Active">Active</option>
              <option value="Review">In Review</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Project Type</label>
            <select value={form.projectType} onChange={e => setForm({...form, projectType: e.target.value})} className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-2.5 text-xs">
              <option value="Full-stack">Full-stack</option>
              <option value="Consulting">Consulting</option>
              <option value="Games">Games</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Client Name</label>
            <input type="text" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Client Email</label>
            <input type="email" value={form.clientEmail} onChange={e => setForm({...form, clientEmail: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2 col-span-full">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Project Thumbnail</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-[--bg-alt] border border-[--border] overflow-hidden flex items-center justify-center shrink-0">
                {form.thumbnail ? (
                  <CloudinaryImage src={form.thumbnail} alt="Project Thumbnail Preview" transformations="w_200,h_200,c_fill,g_auto,q_auto,f_auto" className="w-full h-full object-cover" />
                ) : (
                  <FiImage className="text-[--muted]" size={24} />
                )}
              </div>
              <div className="flex-1">
                <label className={`
                  flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[--border] 
                  transition-all
                  ${!hasUploadConfig ? 'opacity-50 cursor-not-allowed bg-[--bg-alt]' : 'cursor-pointer hover:border-[--accent] hover:bg-[--accent-soft]/5'}
                  ${isUploading ? 'opacity-50 pointer-events-none animate-pulse' : ''}
                `}>
                  <FiUploadCloud size={18} />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {isUploading ? 'Uploading...' : hasUploadConfig ? 'Upload to Cloudinary' : 'Upload Disabled (Missing Preset)'}
                  </span>
                  {hasUploadConfig && <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />}
                </label>
                {!hasUploadConfig && <p className="text-[9px] text-amber-500 mt-1 italic">To enable: Create an "Unsigned Upload Preset" in Cloudinary Settings &gt; Upload.</p>}
                <input type="text" placeholder="Or paste image URL..." className="mt-2 text-[10px]" value={form.thumbnail} onChange={e => setForm({...form, thumbnail: e.target.value})} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Business & Finance */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <h3 className="col-span-full text-xs font-bold uppercase text-[--accent] border-b border-[--border] pb-2">Business & Finance</h3>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Contract Type</label>
            {/* Added Hourly option */}
            <select value={form.contractType} onChange={e => setForm({...form, contractType: e.target.value})} className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-2.5 text-xs">
              <option>Fixed-price</option>
              <option>Hourly</option>
              <option>Retainer</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Contract Value ($)</label>
            <input type="number" value={form.contractType === 'Hourly' ? (parseFloat(form.estHours || '0') * parseFloat(form.effectiveRate || '0')).toFixed(2) : form.contractValue} onChange={e => setForm({...form, contractValue: e.target.value})} disabled={form.contractType === 'Hourly'} className={form.contractType === 'Hourly' ? 'opacity-70 cursor-not-allowed' : ''} />
            {form.contractType === 'Hourly' && <p className="text-[9px] text-[--muted] italic mt-1">Calculated from Est. Hours * Effective Rate</p>}
          </div>          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Amount Invoiced ($)</label>
            <input type="number" value={form.amountInvoiced} onChange={e => setForm({...form, amountInvoiced: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">NDA Signed</label>
            <select value={form.ndaSigned} onChange={e => setForm({...form, ndaSigned: e.target.value})} className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-2.5 text-xs">
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Contract Signed</label>
            <select value={form.contractSigned} onChange={e => setForm({...form, contractSigned: e.target.value})} className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-2.5 text-xs">
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Priority</label>
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="bg-[--input-bg] text-[--text] border border-[--input-border] rounded-xl p-2.5 text-xs">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </section>

        {/* Section 3: Timeline & Scope */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <h3 className="col-span-full text-xs font-bold uppercase text-[--accent] border-b border-[--border] pb-2">Timeline & Scope</h3>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Start Date</label>
            <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Est. Hours</label>
            <input type="number" value={form.estHours} onChange={e => setForm({...form, estHours: e.target.value})} />
          </div>
          {form.contractType === 'Hourly' && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Effective Rate ($/hr)</label>
              <input type="number" step="0.01" value={form.effectiveRate} onChange={e => setForm({...form, effectiveRate: e.target.value})} />
            </div>
          )}
        </section>

        {/* Section 4: Details & Notes */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase text-[--accent] border-b border-[--border] pb-2">Description</h3>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Public Description (Portfolio)</label>
            <textarea rows={3} placeholder="Visible summary..." className="resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Internal Notes</label>
            <textarea rows={3} placeholder="Private notes..." className="resize-none bg-amber-500/5" value={form.internalNotes} onChange={e => setForm({...form, internalNotes: e.target.value})} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">GitHub URL</label>
            <input type="url" value={form.githubUrl} onChange={e => setForm({...form, githubUrl: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Live Site URL</label>
            <input type="url" value={form.liveUrl} onChange={e => setForm({...form, liveUrl: e.target.value})} />
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--muted]">Tags (Portfolio)</label>
          <TagInput tags={form.tags} onChange={newTags => setForm({...form, tags: newTags})} suggestions={availableTags || []} />
        </div>

        {error && <div className="message danger text-xs">{error}</div>}

        <div className="mt-4 pt-4 border-t border-[--border] flex justify-end">
          <Button mode="primary" label="Save Changes ☕" />
        </div>
      </div>
    </form>
  );
}
