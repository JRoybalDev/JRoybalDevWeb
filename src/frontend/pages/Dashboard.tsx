import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Gauge,
  GitBranch,
  Home,
  Inbox,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  TimerReset,
  Trash2,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { TbCoffee } from "react-icons/tb";

type DashboardTab =
  | "overview"
  | "projects"
  | "time-tracking"
  | "invoices"
  | "revenue"
  | "clients"
  | "notes-comms"
  | "intakes"
  | "settings";

type ProjectStatus = "Active" | "Review" | "Completed" | "Archived";
type Priority = "Low" | "Medium" | "High";
type InvoiceStatus = "Pending" | "Paid" | "Overdue" | "Cancelled";

type Project = {
  id: number;
  projectId?: string | null;
  name: string;
  clientName?: string | null;
  clientEmail?: string | null;
  clientContact?: string | null;
  contractType?: "Fixed-price" | "Hourly" | "Retainer" | null;
  projectType?: string | null;
  status?: ProjectStatus | string | null;
  contractValue?: string | null;
  amountInvoiced?: string | null;
  amountOutstanding?: string | null;
  paymentTerms?: string | null;
  depositPaid?: string | null;
  startDate?: string | null;
  deadline?: string | null;
  estHours?: string | null;
  loggedHours?: string | null;
  effectiveRate?: string | null;
  revisionRounds?: string | null;
  scopeChanges?: string | null;
  stack?: string | null;
  hosting?: string | null;
  repo?: string | null;
  stagingUrl?: string | null;
  ndaSigned?: string | null;
  contractSigned?: string | null;
  lastMilestone?: string | null;
  nextMilestone?: string | null;
  priority?: Priority | string | null;
  internalNotes?: string | null;
  description: string;
  isPublic?: boolean;
  thumbnail?: string | null;
  tags?: string | null;
  category?: string | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  createdAt?: string | null;
};

type Inquiry = {
  id: number;
  name: string;
  email: string;
  projectType: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type ClientIntake = {
  id: number;
  projectId: number | null;
  name: string;
  email: string;
  company: string | null;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
};

type Invoice = {
  id: number;
  projectId: number;
  amount: number | string;
  status: InvoiceStatus | string;
  dueDate: string;
  notes?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
};

type TimeEntry = {
  id: number;
  projectId: number;
  date: string;
  hours: number | string;
  notes?: string | null;
  createdAt?: string | null;
};

type ProjectFormState = {
  projectId: string;
  name: string;
  clientName: string;
  clientEmail: string;
  clientContact: string;
  contractType: "Fixed-price" | "Hourly" | "Retainer";
  projectType: string;
  status: ProjectStatus;
  contractValue: string;
  amountInvoiced: string;
  paymentTerms: string;
  depositPaid: string;
  startDate: string;
  deadline: string;
  estHours: string;
  loggedHours: string;
  effectiveRate: string;
  revisionRounds: string;
  scopeChanges: string;
  stack: string;
  hosting: string;
  repo: string;
  stagingUrl: string;
  ndaSigned: string;
  contractSigned: string;
  lastMilestone: string;
  nextMilestone: string;
  priority: Priority;
  internalNotes: string;
  description: string;
  isPublic: boolean;
  thumbnail: string;
  tags: string;
  category: string;
  githubUrl: string;
  liveUrl: string;
};

type InvoiceFormState = {
  projectId: string;
  amount: string;
  status: InvoiceStatus;
  dueDate: string;
  notes: string;
};

type TimeFormState = {
  projectId: string;
  date: string;
  hours: string;
  notes: string;
};

const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

const tabRoutes: Record<DashboardTab, string> = {
  overview: "/dashboard",
  projects: "/dashboard/projects",
  "time-tracking": "/dashboard/time-tracking",
  invoices: "/dashboard/invoices",
  revenue: "/dashboard/revenue",
  clients: "/dashboard/clients",
  "notes-comms": "/dashboard/notes-comms",
  intakes: "/dashboard/intakes",
  settings: "/dashboard/settings",
};

const routeTabs: Record<string, DashboardTab> = Object.entries(tabRoutes).reduce(
  (acc, [tab, path]) => ({ ...acc, [path]: tab as DashboardTab }),
  {} as Record<string, DashboardTab>
);

const emptyProjectForm: ProjectFormState = {
  projectId: "",
  name: "",
  clientName: "",
  clientEmail: "",
  clientContact: "",
  contractType: "Fixed-price",
  projectType: "Full-stack",
  status: "Active",
  contractValue: "",
  amountInvoiced: "",
  paymentTerms: "Net-30",
  depositPaid: "No",
  startDate: "",
  deadline: "",
  estHours: "",
  loggedHours: "",
  effectiveRate: "",
  revisionRounds: "0 of 3",
  scopeChanges: "0",
  stack: "",
  hosting: "",
  repo: "",
  stagingUrl: "",
  ndaSigned: "No",
  contractSigned: "No",
  lastMilestone: "",
  nextMilestone: "",
  priority: "Medium",
  internalNotes: "",
  description: "",
  isPublic: true,
  thumbnail: "",
  tags: "",
  category: "Full-Stack Contract",
  githubUrl: "",
  liveUrl: "",
};

const emptyInvoiceForm: InvoiceFormState = {
  projectId: "",
  amount: "",
  status: "Pending",
  dueDate: "",
  notes: "",
};

const emptyTimeForm = (): TimeFormState => ({
  projectId: "",
  date: new Date().toISOString().slice(0, 10),
  hours: "",
  notes: "",
});

const statusFilters = ["All", "Active", "Review", "Completed", "Archived"] as const;
const priorityFilters = ["All", "High", "Medium", "Low"] as const;
const projectTypeFilters = ["All", "Full-stack", "Consulting", "Games"] as const;
const projectCategoryOptions = [
  "Full-Stack Contract",
  "Consulting",
  "Game Contract",
  "Frontend Contract",
  "Backend Contract",
] as const;

function money(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateInputValue(value: string | null | undefined) {
  if (!value) return "";

  const isoDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) return isoDate;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shortDate(value: string | null | undefined) {
  if (!value) return "None";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(value: string | null | undefined) {
  return (value || "JR")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function progressForProject(project: Project) {
  const invoiced = numberValue(project.amountInvoiced);
  const contracted = numberValue(project.contractValue);
  if (!contracted) return 0;
  return Math.min(100, Math.round((invoiced / contracted) * 100));
}

function projectFromForm(form: ProjectFormState) {
  const contractValue =
    form.contractType === "Hourly"
      ? (numberValue(form.estHours) * numberValue(form.effectiveRate)).toFixed(2)
      : form.contractValue;
  const amountOutstanding = (numberValue(contractValue) - numberValue(form.amountInvoiced)).toFixed(2);

  return {
    ...form,
    contractValue,
    amountOutstanding,
    loggedHours: form.loggedHours || "0",
  };
}

function projectToForm(project: Project): ProjectFormState {
  return {
    projectId: project.projectId || "",
    name: project.name || "",
    clientName: project.clientName || "",
    clientEmail: project.clientEmail || "",
    clientContact: project.clientContact || "",
    contractType: project.contractType || "Fixed-price",
    projectType: project.projectType || "Full-stack",
    status: (project.status as ProjectStatus) || "Active",
    contractValue: project.contractValue || "",
    amountInvoiced: project.amountInvoiced || "",
    paymentTerms: project.paymentTerms || "Net-30",
    depositPaid: project.depositPaid || "No",
    startDate: dateInputValue(project.startDate),
    deadline: dateInputValue(project.deadline),
    estHours: project.estHours || "",
    loggedHours: project.loggedHours || "",
    effectiveRate: project.effectiveRate || "",
    revisionRounds: project.revisionRounds || "0 of 3",
    scopeChanges: project.scopeChanges || "0",
    stack: project.stack || "",
    hosting: project.hosting || "",
    repo: project.repo || "",
    stagingUrl: project.stagingUrl || "",
    ndaSigned: project.ndaSigned || "No",
    contractSigned: project.contractSigned || "No",
    lastMilestone: project.lastMilestone || "",
    nextMilestone: project.nextMilestone || "",
    priority: (project.priority as Priority) || "Medium",
    internalNotes: project.internalNotes || "",
    description: project.description || "",
    isPublic: project.isPublic ?? true,
    thumbnail: project.thumbnail || "",
    tags: project.tags || "",
    category: project.category || "Full-Stack Contract",
    githubUrl: project.githubUrl || "",
    liveUrl: project.liveUrl || "",
  };
}

async function uploadProjectThumbnail(file: File) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary upload is missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "dashboard/projects");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Cloudinary upload failed.");
  const result = await response.json();
  return String(result.secure_url || "");
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = routeTabs[location.pathname] || "overview";

  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [intakes, setIntakes] = useState<ClientIntake[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>("projects");
  const [search, setSearch] = useState("");
  const [projectStatus, setProjectStatus] = useState<(typeof statusFilters)[number]>("All");
  const [projectType, setProjectType] = useState<(typeof projectTypeFilters)[number]>("All");
  const [projectPriority, setProjectPriority] = useState<(typeof priorityFilters)[number]>("All");
  const [clientSort, setClientSort] = useState<"name" | "email">("name");
  const [commStatus, setCommStatus] = useState<"all" | "unread" | "read">("all");

  const [projectModal, setProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(emptyProjectForm);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormState>(emptyInvoiceForm);
  const [timeModal, setTimeModal] = useState(false);
  const [editingTimeId, setEditingTimeId] = useState<number | null>(null);
  const [timeForm, setTimeForm] = useState<TimeFormState>(emptyTimeForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchData = async () => {
    if (user?.role !== "admin") return;
    setLoading(true);
    setSyncError(null);

    try {
      const [projectRes, inquiryRes, invoiceRes, timeRes, intakeRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/projects`, { credentials: "include" }),
        fetch(`${apiBase}/api/admin/inquiries`, { credentials: "include" }),
        fetch(`${apiBase}/api/admin/invoices`, { credentials: "include" }),
        fetch(`${apiBase}/api/admin/time-entries`, { credentials: "include" }),
        fetch(`${apiBase}/api/admin/intakes`, { credentials: "include" }),
      ]);

      if (!projectRes.ok || !inquiryRes.ok) throw new Error("Dashboard data could not be synced.");

      setProjects(await projectRes.json());
      setInquiries(await inquiryRes.json());
      setInvoices(invoiceRes.ok ? await invoiceRes.json() : []);
      setTimeEntries(timeRes.ok ? await timeRes.json() : []);
      setIntakes(intakeRes.ok ? await intakeRes.json() : []);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Dashboard data could not be synced.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [user?.role]);

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const unreadInquiries = inquiries.filter((inquiry) => !inquiry.isRead);
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue");
  const activeProjects = projects.filter((project) => project.status === "Active");
  const totalContracted = projects.reduce((sum, project) => sum + numberValue(project.contractValue), 0);
  const totalInvoiced = projects.reduce((sum, project) => sum + numberValue(project.amountInvoiced), 0);
  const totalOutstanding = Math.max(0, totalContracted - totalInvoiced);
  const paidRevenue = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + numberValue(invoice.amount), 0);
  const totalHours = timeEntries.reduce((sum, entry) => sum + numberValue(entry.hours), 0);
  const billableRate = totalHours ? totalInvoiced / totalHours : 0;

  const filteredProjects = useMemo(() => {
    const needle = search.toLowerCase();
    return projects
      .filter((project) => {
        const searchable = [
          project.projectId,
          project.name,
          project.clientName,
          project.clientEmail,
          project.status,
          project.priority,
          project.contractType,
          project.projectType,
          project.tags,
          project.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(needle);
      })
      .filter((project) => projectStatus === "All" || project.status === projectStatus)
      .filter((project) => projectType === "All" || project.projectType === projectType)
      .filter((project) => projectPriority === "All" || project.priority === projectPriority);
  }, [projects, projectPriority, projectStatus, projectType, search]);

  const clients = useMemo(() => {
    return [...projects]
      .filter((project) => project.clientName || project.clientEmail)
      .filter((project) => projectStatus === "All" || project.status === projectStatus)
      .filter((project) => projectType === "All" || project.projectType === projectType)
      .filter((project) => {
        const needle = search.toLowerCase();
        return `${project.clientName || ""} ${project.clientEmail || ""} ${project.name}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => {
        const aValue = clientSort === "name" ? a.clientName || "" : a.clientEmail || "";
        const bValue = clientSort === "name" ? b.clientName || "" : b.clientEmail || "";
        return aValue.localeCompare(bValue);
      });
  }, [clientSort, projectStatus, projectType, projects, search]);

  const filteredInquiries = useMemo(() => {
    return [...inquiries]
      .filter((inquiry) => {
        if (commStatus === "unread") return !inquiry.isRead;
        if (commStatus === "read") return inquiry.isRead;
        return true;
      })
      .filter((inquiry) => `${inquiry.name} ${inquiry.email} ${inquiry.projectType} ${inquiry.message}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [commStatus, inquiries, search]);

  const projectHours = useMemo(() => {
    const totals = new Map<number, number>();
    for (const entry of timeEntries) {
      totals.set(entry.projectId, (totals.get(entry.projectId) || 0) + numberValue(entry.hours));
    }
    return totals;
  }, [timeEntries]);

  const go = (tab: DashboardTab) => {
    navigate(tabRoutes[tab]);
    setSidebarOpen(false);
  };

  const openNewProject = () => {
    setProjectForm(emptyProjectForm);
    setEditingProjectId(null);
    setFormError(null);
    setProjectModal(true);
  };

  const openEditProject = (project: Project) => {
    setProjectForm(projectToForm(project));
    setEditingProjectId(project.id);
    setFormError(null);
    setProjectModal(true);
  };

  const saveProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectForm.name.trim()) return setFormError("Project name is required.");
    if (projectForm.description.trim().length < 10) return setFormError("Description needs at least 10 characters.");

    const payload = projectFromForm(projectForm);
    const url = editingProjectId
      ? `${apiBase}/api/admin/projects/${editingProjectId}`
      : `${apiBase}/api/admin/projects`;

    const response = await fetch(url, {
      method: editingProjectId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) return setFormError("Project could not be saved.");
    setProjectModal(false);
    await fetchData();
  };

  const deleteProject = async (project: Project) => {
    if (!window.confirm(`Delete ${project.name}?`)) return;
    const response = await fetch(`${apiBase}/api/admin/projects/${project.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) await fetchData();
  };

  const openNewInvoice = () => {
    setInvoiceForm(emptyInvoiceForm);
    setEditingInvoiceId(null);
    setFormError(null);
    setInvoiceModal(true);
  };

  const openEditInvoice = (invoice: Invoice) => {
    setInvoiceForm({
      projectId: String(invoice.projectId),
      amount: String(invoice.amount),
      status: invoice.status as InvoiceStatus,
      dueDate: new Date(invoice.dueDate).toISOString().slice(0, 10),
      notes: invoice.notes || "",
    });
    setEditingInvoiceId(invoice.id);
    setFormError(null);
    setInvoiceModal(true);
  };

  const saveInvoice = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!invoiceForm.projectId) return setFormError("Choose a project.");
    if (numberValue(invoiceForm.amount) <= 0) return setFormError("Invoice amount must be greater than zero.");

    const isEdit = editingInvoiceId !== null;
    const response = await fetch(
      isEdit ? `${apiBase}/api/admin/invoices/${editingInvoiceId}` : `${apiBase}/api/admin/invoices`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...invoiceForm, projectId: Number(invoiceForm.projectId) }),
      }
    );

    if (!response.ok) return setFormError("Invoice could not be saved.");
    setInvoiceModal(false);
    await fetchData();
  };

  const markInvoicePaid = async (invoice: Invoice) => {
    const response = await fetch(`${apiBase}/api/admin/invoices/${invoice.id}/paid`, {
      method: "PATCH",
      credentials: "include",
    });
    if (response.ok) await fetchData();
  };

  const deleteInvoice = async (invoice: Invoice) => {
    if (!window.confirm("Delete this invoice?")) return;
    const response = await fetch(`${apiBase}/api/admin/invoices/${invoice.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) await fetchData();
  };

  const openNewTime = () => {
    setTimeForm(emptyTimeForm());
    setEditingTimeId(null);
    setFormError(null);
    setTimeModal(true);
  };

  const openEditTime = (entry: TimeEntry) => {
    setTimeForm({
      projectId: String(entry.projectId),
      date: new Date(entry.date).toISOString().slice(0, 10),
      hours: String(entry.hours),
      notes: entry.notes || "",
    });
    setEditingTimeId(entry.id);
    setFormError(null);
    setTimeModal(true);
  };

  const saveTime = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!timeForm.projectId) return setFormError("Choose a project.");
    if (numberValue(timeForm.hours) <= 0) return setFormError("Hours must be greater than zero.");

    const response = await fetch(
      editingTimeId ? `${apiBase}/api/admin/time-entries/${editingTimeId}` : `${apiBase}/api/admin/time-entries`,
      {
        method: editingTimeId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...timeForm, projectId: Number(timeForm.projectId) }),
      }
    );

    if (!response.ok) return setFormError("Time entry could not be saved.");
    setTimeModal(false);
    await fetchData();
  };

  const deleteTime = async (entry: TimeEntry) => {
    if (!window.confirm("Delete this time entry?")) return;
    const response = await fetch(`${apiBase}/api/admin/time-entries/${entry.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) await fetchData();
  };

  const markInquiryRead = async (inquiry: Inquiry) => {
    if (inquiry.isRead) return;
    const response = await fetch(`${apiBase}/api/admin/inquiries/${inquiry.id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    if (response.ok) await fetchData();
  };

  const deleteInquiry = async (inquiry: Inquiry) => {
    if (!window.confirm(`Delete inquiry from ${inquiry.name}?`)) return;
    const response = await fetch(`${apiBase}/api/admin/inquiries/${inquiry.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) await fetchData();
  };

  const openInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    await markInquiryRead(inquiry);
  };

  return (
    <div className="min-h-screen bg-[--bg] text-[--text] theme-transition">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[min(86vw,280px)] border-r border-[--border] bg-[--surface-strong] shadow-[--shadow] transition-[width,transform] lg:sticky lg:translate-x-0 ${
            desktopSidebarCollapsed ? "lg:w-[82px]" : "lg:w-[280px]"
          } ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className={`flex items-center justify-between border-b border-[--border] ${desktopSidebarCollapsed ? "lg:p-3" : ""} p-5`}>
              <button onClick={() => go("overview")} className={`flex min-w-0 items-center gap-3 text-left ${desktopSidebarCollapsed ? "lg:hidden" : ""}`}>
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[--accent] text-[--foam]">
                  <TbCoffee className="w-8 h-8" />
                </span>
                <span className={desktopSidebarCollapsed ? "lg:hidden" : ""}>
                  <span className="block text-sm font-semibold tracking-[0.08em] text-[--accent]">Dashboard</span>
                  <span className="text-xs text-[--muted-soft]">Projects, clients, revenue</span>
                </span>
              </button>
              <IconButton
                label={desktopSidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
                onClick={() => setDesktopSidebarCollapsed((current) => !current)}
                className="hidden lg:inline-grid "
              >
                {desktopSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </IconButton>
              <IconButton label="Close navigation" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X size={18} />
              </IconButton>
            </div>

            <nav className={`flex-1 space-y-2 overflow-y-auto ${desktopSidebarCollapsed ? "lg:p-2" : ""} p-3`}>
              <NavButton icon={LayoutDashboard} label="Overview" active={activeTab === "overview"} onClick={() => go("overview")} collapsed={desktopSidebarCollapsed} />
              <NavButton icon={Plus} label="New Project" onClick={openNewProject} collapsed={desktopSidebarCollapsed} />
              <NavGroup
                label="Projects"
                icon={FileText}
                open={openGroup === "projects"}
                onToggle={() => setOpenGroup(openGroup === "projects" ? null : "projects")}
                collapsed={desktopSidebarCollapsed}
              >
                <NavButton icon={SlidersHorizontal} label="Work Ledger" active={activeTab === "projects"} onClick={() => go("projects")} compact collapsed={desktopSidebarCollapsed} />
                <NavButton icon={Clock3} label="Time Tracking" active={activeTab === "time-tracking"} onClick={() => go("time-tracking")} compact collapsed={desktopSidebarCollapsed} />
              </NavGroup>
              <NavGroup
                label="Finances"
                icon={CircleDollarSign}
                open={openGroup === "finances"}
                onToggle={() => setOpenGroup(openGroup === "finances" ? null : "finances")}
                collapsed={desktopSidebarCollapsed}
              >
                <NavButton icon={CreditCard} label="Invoices" active={activeTab === "invoices"} onClick={() => go("invoices")} compact collapsed={desktopSidebarCollapsed} />
                <NavButton icon={Gauge} label="Revenue" active={activeTab === "revenue"} onClick={() => go("revenue")} compact collapsed={desktopSidebarCollapsed} />
              </NavGroup>
              <NavGroup
                label="Clients"
                icon={Users}
                open={openGroup === "clients"}
                onToggle={() => setOpenGroup(openGroup === "clients" ? null : "clients")}
                collapsed={desktopSidebarCollapsed}
              >
                <NavButton icon={Users} label="Client List" active={activeTab === "clients"} onClick={() => go("clients")} compact collapsed={desktopSidebarCollapsed} />
                <NavButton icon={MessageSquareText} label="Notes & Comms" active={activeTab === "notes-comms"} onClick={() => go("notes-comms")} compact collapsed={desktopSidebarCollapsed} />
                <NavButton icon={Inbox} label="Intake Forms" active={activeTab === "intakes"} onClick={() => go("intakes")} compact collapsed={desktopSidebarCollapsed} />
              </NavGroup>
              <NavButton icon={Settings} label="Settings" active={activeTab === "settings"} onClick={() => go("settings")} collapsed={desktopSidebarCollapsed} />
            </nav>

            <div className="border-t border-[--border] p-3">
              <button
                onClick={() => void signOut()}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[--muted] transition hover:bg-[--accent-soft]/15 hover:text-[--text] ${desktopSidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
                title="Sign Out"
              >
                <LogOut size={18} />
                <span className={desktopSidebarCollapsed ? "lg:hidden" : ""}>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && <button aria-label="Close navigation backdrop" className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[--border] bg-[--surface]/90 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <IconButton label="Open navigation" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                  <Menu size={19} />
                </IconButton>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.08em] text-[--accent]">{pageMeta[activeTab].kicker}</p>
                  <h1 className="text-xl font-semibold leading-tight tracking-normal md:text-2xl">{pageMeta[activeTab].title}</h1>
                </div>
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <QuickBadge icon={Inbox} label={`${unreadInquiries.length} unread`} tone={unreadInquiries.length ? "amber" : "neutral"} onClick={() => go("notes-comms")} />
                <QuickBadge icon={AlertTriangle} label={`${overdueInvoices.length} overdue`} tone={overdueInvoices.length ? "red" : "neutral"} onClick={() => go("invoices")} />
              </div>
            </div>
          </header>

          <section className="space-y-4 p-3 sm:p-4 lg:space-y-5 lg:p-6">
            {syncError && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-700 dark:text-red-200">{syncError}</div>}
            {loading ? (
              <DashboardCard className="p-8 text-center text-sm text-[--muted]">Syncing dashboard data...</DashboardCard>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                {activeTab === "overview" && (
                  <Overview
                    activeProjects={activeProjects}
                    billableRate={billableRate}
                    inquiries={inquiries}
                    invoices={invoices}
                    projects={projects}
                    totalContracted={totalContracted}
                    totalInvoiced={totalInvoiced}
                    totalOutstanding={totalOutstanding}
                    onOpenInvoices={() => go("invoices")}
                    onOpenProjects={() => go("projects")}
                    onOpenComms={() => go("notes-comms")}
                    onOpenProject={setSelectedProject}
                    projectById={projectById}
                  />
                )}
                {activeTab === "projects" && (
                  <ProjectsView
                    projects={filteredProjects}
                    search={search}
                    setSearch={setSearch}
                    projectStatus={projectStatus}
                    setProjectStatus={setProjectStatus}
                    projectType={projectType}
                    setProjectType={setProjectType}
                    projectPriority={projectPriority}
                    setProjectPriority={setProjectPriority}
                    projectHours={projectHours}
                    onNew={openNewProject}
                    onEdit={openEditProject}
                    onDelete={deleteProject}
                    onDetails={setSelectedProject}
                    showFinancialColumns={desktopSidebarCollapsed}
                  />
                )}
                {activeTab === "time-tracking" && (
                  <TimeView
                    entries={timeEntries}
                    projects={projects}
                    projectById={projectById}
                    onNew={openNewTime}
                    onEdit={openEditTime}
                    onDelete={deleteTime}
                    totalHours={totalHours}
                  />
                )}
                {activeTab === "invoices" && (
                  <InvoicesView
                    invoices={invoices}
                    projectById={projectById}
                    onNew={openNewInvoice}
                    onEdit={openEditInvoice}
                    onDelete={deleteInvoice}
                    onPaid={markInvoicePaid}
                  />
                )}
                {activeTab === "revenue" && (
                  <RevenueView
                    projects={filteredProjects}
                    totalContracted={totalContracted}
                    totalInvoiced={totalInvoiced}
                    totalOutstanding={totalOutstanding}
                    paidRevenue={paidRevenue}
                    projectStatus={projectStatus}
                    setProjectStatus={setProjectStatus}
                    projectType={projectType}
                    setProjectType={setProjectType}
                    projectPriority={projectPriority}
                    setProjectPriority={setProjectPriority}
                  />
                )}
                {activeTab === "clients" && (
                  <ClientsView
                    clients={clients}
                    search={search}
                    setSearch={setSearch}
                    projectStatus={projectStatus}
                    setProjectStatus={setProjectStatus}
                    projectType={projectType}
                    setProjectType={setProjectType}
                    clientSort={clientSort}
                    setClientSort={setClientSort}
                    onDetails={setSelectedProject}
                  />
                )}
                {activeTab === "notes-comms" && (
                  <CommsView
                    inquiries={filteredInquiries}
                    search={search}
                    setSearch={setSearch}
                    commStatus={commStatus}
                    setCommStatus={setCommStatus}
                    onOpen={openInquiry}
                    onDelete={deleteInquiry}
                    onRead={markInquiryRead}
                  />
                )}
                {activeTab === "intakes" && (
                  <IntakesView
                    intakes={intakes}
                    projects={projects}
                    apiBase={apiBase}
                    onRefresh={() => void fetchData()}
                  />
                )}
                {activeTab === "settings" && (
                  <SettingsView
                    user={user}
                    projects={projects}
                    invoices={invoices}
                    timeEntries={timeEntries}
                    inquiries={inquiries}
                    onBackToSite={() => navigate("/")}
                    onSignOut={async () => {
                      await signOut();
                      navigate("/");
                    }}
                  />
                )}
                </motion.div>
              </AnimatePresence>
            )}
          </section>
        </main>
      </div>

      <AnimatePresence>
        {projectModal && (
          <Modal title={editingProjectId ? "Edit Project" : "New Project"} onClose={() => setProjectModal(false)} wide>
            <ProjectForm form={projectForm} setForm={setProjectForm} error={formError} onSubmit={saveProject} onCancel={() => setProjectModal(false)} />
          </Modal>
        )}

        {invoiceModal && (
          <Modal title={editingInvoiceId ? "Edit Invoice" : "New Invoice"} onClose={() => setInvoiceModal(false)}>
            <InvoiceForm form={invoiceForm} setForm={setInvoiceForm} projects={projects} error={formError} onSubmit={saveInvoice} onCancel={() => setInvoiceModal(false)} />
          </Modal>
        )}

        {timeModal && (
          <Modal title={editingTimeId ? "Edit Time Entry" : "Log Time"} onClose={() => setTimeModal(false)}>
            <TimeForm form={timeForm} setForm={setTimeForm} projects={projects} error={formError} onSubmit={saveTime} onCancel={() => setTimeModal(false)} />
          </Modal>
        )}

        {selectedProject && <ProjectDetails project={selectedProject} hours={projectHours.get(selectedProject.id) || 0} onClose={() => setSelectedProject(null)} />}
        {selectedInquiry && <InquiryDetails inquiry={selectedInquiry} onClose={() => setSelectedInquiry(null)} />}
      </AnimatePresence>
    </div>
  );
}

const pageMeta: Record<DashboardTab, { kicker: string; title: string }> = {
  overview: { kicker: "Command center", title: "Overview" },
  projects: { kicker: "Projects", title: "Work Ledger" },
  "time-tracking": { kicker: "Projects", title: "Time Tracking" },
  invoices: { kicker: "Finances", title: "Invoices" },
  revenue: { kicker: "Finances", title: "Revenue" },
  clients: { kicker: "Clients", title: "Client List" },
  "notes-comms": { kicker: "Clients", title: "Notes & Comms" },
  intakes: { kicker: "Clients", title: "Intake Forms" },
  settings: { kicker: "Admin", title: "Settings" },
};

function Overview(props: {
  activeProjects: Project[];
  billableRate: number;
  inquiries: Inquiry[];
  invoices: Invoice[];
  projects: Project[];
  totalContracted: number;
  totalInvoiced: number;
  totalOutstanding: number;
  onOpenInvoices: () => void;
  onOpenProjects: () => void;
  onOpenComms: () => void;
  onOpenProject: (project: Project) => void;
  projectById: Map<number, Project>;
}) {
  const recentInvoices = [...props.invoices].sort((a, b) => new Date(b.createdAt || b.dueDate).getTime() - new Date(a.createdAt || a.dueDate).getTime()).slice(0, 5);
  const recentInquiries = [...props.inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Active Projects" value={String(props.activeProjects.length)} detail={`${props.projects.length} total`} tone="accent" />
        <StatCard icon={CircleDollarSign} label="YTD Revenue" value={money(props.totalInvoiced)} detail={`${money(props.totalOutstanding)} outstanding`} tone="green" />
        <StatCard icon={TimerReset} label="Billable Rate" value={money(props.billableRate || 0)} detail="invoiced per tracked hour" tone="blue" />
        <StatCard icon={Bell} label="New Inquiries" value={String(props.inquiries.filter((inq) => !inq.isRead).length)} detail={`${props.inquiries.length} total messages`} tone="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <DashboardCard>
          <PanelHeader title="Active Delivery" actionLabel="Open ledger" onAction={props.onOpenProjects} />
          <div className="divide-y divide-[--border]">
            {props.activeProjects.slice(0, 6).map((project) => (
              <button key={project.id} onClick={() => props.onOpenProject(project)} className="grid w-full gap-3 py-4 text-left md:grid-cols-[1fr_160px_110px] md:items-center">
                <div className="min-w-0">
                  <p className="font-bold">{project.name}</p>
                  <p className="text-xs text-[--muted]">{project.clientName || "No client"} - {project.projectId || "Draft ID"}</p>
                </div>
                <Progress value={progressForProject(project)} label={`${progressForProject(project)}% invoiced`} />
                <StatusPill value={project.priority || "Medium"} />
              </button>
            ))}
            {props.activeProjects.length === 0 && <EmptyState label="No active projects yet." />}
          </div>
        </DashboardCard>

        <DashboardCard>
          <PanelHeader title="Financial Pulse" actionLabel="Open invoices" onAction={props.onOpenInvoices} />
          <div className="grid gap-3">
            <FinanceLine label="Contracted" value={money(props.totalContracted)} />
            <FinanceLine label="Invoiced" value={money(props.totalInvoiced)} />
            <FinanceLine label="Outstanding" value={money(props.totalOutstanding)} />
          </div>
          <div className="mt-5 rounded-lg border border-[--border] bg-[--bg-alt]/30 p-4">
            <Progress value={props.totalContracted ? Math.round((props.totalInvoiced / props.totalContracted) * 100) : 0} label="Portfolio collection" />
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <DashboardCard>
          <PanelHeader title="Recent Inquiries" actionLabel="Open inbox" onAction={props.onOpenComms} />
          <div className="divide-y divide-[--border]">
            {recentInquiries.map((inquiry) => (
              <div key={inquiry.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{inquiry.name}</p>
                  <p className="truncate text-xs text-[--muted]">{inquiry.projectType} - {shortDate(inquiry.createdAt)}</p>
                </div>
                <StatusPill value={inquiry.isRead ? "Read" : "Unread"} />
              </div>
            ))}
            {recentInquiries.length === 0 && <EmptyState label="No inquiries found." />}
          </div>
        </DashboardCard>

        <DashboardCard>
          <PanelHeader title="Recent Invoices" actionLabel="Open invoices" onAction={props.onOpenInvoices} />
          <div className="divide-y divide-[--border]">
            {recentInvoices.map((invoice) => {
              const project = props.projectById.get(invoice.projectId);
              return (
                <div key={invoice.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{project?.name || `Project #${invoice.projectId}`}</p>
                    <p className="truncate text-xs text-[--muted]">Due {shortDate(invoice.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{money(invoice.amount)}</p>
                    <StatusPill value={invoice.status} />
                  </div>
                </div>
              );
            })}
            {recentInvoices.length === 0 && <EmptyState label="No invoices found." />}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

function ProjectsView(props: {
  projects: Project[];
  search: string;
  setSearch: (value: string) => void;
  projectStatus: (typeof statusFilters)[number];
  setProjectStatus: (value: (typeof statusFilters)[number]) => void;
  projectType: (typeof projectTypeFilters)[number];
  setProjectType: (value: (typeof projectTypeFilters)[number]) => void;
  projectPriority: (typeof priorityFilters)[number];
  setProjectPriority: (value: (typeof priorityFilters)[number]) => void;
  projectHours: Map<number, number>;
  onNew: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDetails: (project: Project) => void;
  showFinancialColumns: boolean;
}) {
  const headers = props.showFinancialColumns
    ? ["ID", "Project", "Client", "Status", "Priority", "Progress", "Contract", "Invoiced", "Hours", "Dates", "Actions"]
    : ["ID", "Project", "Client", "Status", "Priority", "Progress", "Dates", "Actions"];

  return (
    <div className="space-y-4">
      <Toolbar search={props.search} setSearch={props.setSearch} buttonLabel="New Project" onButton={props.onNew}>
        <FilterSelect value={props.projectStatus} onChange={props.setProjectStatus} options={statusFilters} />
        <FilterSelect value={props.projectType} onChange={props.setProjectType} options={projectTypeFilters} />
        <FilterSelect value={props.projectPriority} onChange={props.setProjectPriority} options={priorityFilters} />
      </Toolbar>

      <DashboardCard className="overflow-hidden p-0">
        <ResponsiveTable headers={headers}>
          {props.projects.map((project) => (
            <tr key={project.id} className="border-b border-[--border] last:border-0">
              <Cell strong>{project.projectId || `PRJ-${project.id}`}</Cell>
              <Cell>
                <button onClick={() => props.onDetails(project)} className="text-left font-bold text-[--text] hover:text-[--accent]">{project.name}</button>
                <p className="text-xs text-[--muted]">{project.category || project.projectType || "Project"}</p>
              </Cell>
              <Cell>
                <p>{project.clientName || "No client"}</p>
                <p className="text-xs text-[--muted]">{project.clientEmail || "No email"}</p>
              </Cell>
              <Cell><StatusPill value={project.status || "Active"} /></Cell>
              <Cell><StatusPill value={project.priority || "Medium"} /></Cell>
              <Cell><Progress value={progressForProject(project)} /></Cell>
              {props.showFinancialColumns && (
                <>
                  <Cell>{project.contractType || "Fixed-price"}<p className="text-xs text-[--muted]">{money(project.contractValue)}</p></Cell>
                  <Cell>{money(project.amountInvoiced)}</Cell>
                  <Cell>{props.projectHours.get(project.id) || numberValue(project.loggedHours)}h</Cell>
                </>
              )}
              <Cell>
                <p className="text-xs">Start {shortDate(project.startDate)}</p>
                <p className="text-xs text-[--muted]">Due {shortDate(project.deadline)}</p>
              </Cell>
              <Cell>
                <ActionRow>
                  {project.liveUrl && <IconLink label="Live site" href={project.liveUrl}><ExternalLink size={15} /></IconLink>}
                  {project.githubUrl && <IconLink label="GitHub" href={project.githubUrl}><GitBranch size={15} /></IconLink>}
                  <IconButton label="Details" onClick={() => props.onDetails(project)}><Eye size={15} /></IconButton>
                  <IconButton label="Edit" onClick={() => props.onEdit(project)}><Pencil size={15} /></IconButton>
                  <IconButton label="Delete" onClick={() => props.onDelete(project)} danger><Trash2 size={15} /></IconButton>
                </ActionRow>
              </Cell>
            </tr>
          ))}
        </ResponsiveTable>
        {props.projects.length === 0 && <EmptyState label="No projects match those filters." />}
      </DashboardCard>
    </div>
  );
}

function TimeView(props: {
  entries: TimeEntry[];
  projects: Project[];
  projectById: Map<number, Project>;
  totalHours: number;
  onNew: () => void;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
}) {
  const sorted = [...props.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <StatCard icon={Clock3} label="Tracked Hours" value={`${props.totalHours.toFixed(1)}h`} detail="all projects" tone="blue" />
        <StatCard icon={FileText} label="Projects With Time" value={String(new Set(props.entries.map((entry) => entry.projectId)).size)} detail="active log coverage" tone="accent" />
        <StatCard icon={TimerReset} label="Latest Entry" value={sorted[0] ? shortDate(sorted[0].date) : "None"} detail={sorted[0] ? props.projectById.get(sorted[0].projectId)?.name || "Project" : "No entries"} tone="green" />
      </div>
      <DashboardCard className="overflow-hidden p-0">
        <PanelHeader title="Time Entries" actionLabel="Log Time" onAction={props.onNew} className="p-4" />
        <ResponsiveTable headers={["Date", "Project", "Hours", "Notes", "Actions"]}>
          {sorted.map((entry) => (
            <tr key={entry.id} className="border-b border-[--border] last:border-0">
              <Cell strong>{dateLabel(entry.date)}</Cell>
              <Cell>{props.projectById.get(entry.projectId)?.name || `Project #${entry.projectId}`}</Cell>
              <Cell>{numberValue(entry.hours)}h</Cell>
              <Cell>{entry.notes || "No notes"}</Cell>
              <Cell>
                <ActionRow>
                  <IconButton label="Edit" onClick={() => props.onEdit(entry)}><Pencil size={15} /></IconButton>
                  <IconButton label="Delete" onClick={() => props.onDelete(entry)} danger><Trash2 size={15} /></IconButton>
                </ActionRow>
              </Cell>
            </tr>
          ))}
        </ResponsiveTable>
        {sorted.length === 0 && <EmptyState label="No time entries yet." />}
      </DashboardCard>
    </div>
  );
}

function InvoicesView(props: {
  invoices: Invoice[];
  projectById: Map<number, Project>;
  onNew: () => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onPaid: (invoice: Invoice) => void;
}) {
  const sorted = [...props.invoices].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  return (
    <DashboardCard className="overflow-hidden p-0">
      <PanelHeader title="Billing & Invoices" actionLabel="Create Invoice" onAction={props.onNew} className="p-4" />
      <ResponsiveTable headers={["Project ID", "Project", "Amount", "Status", "Due Date", "Client", "Actions"]}>
        {sorted.map((invoice) => {
          const project = props.projectById.get(invoice.projectId);
          return (
            <tr key={invoice.id} className="border-b border-[--border] last:border-0">
              <Cell strong>{project?.projectId || `PRJ-${invoice.projectId}`}</Cell>
              <Cell>{project?.name || `Project #${invoice.projectId}`}</Cell>
              <Cell>{money(invoice.amount)}</Cell>
              <Cell><StatusPill value={invoice.status} /></Cell>
              <Cell>{dateLabel(invoice.dueDate)}</Cell>
              <Cell>{project?.clientName || "No client"}</Cell>
              <Cell>
                <ActionRow>
                  {invoice.status !== "Paid" && <IconButton label="Mark paid" onClick={() => props.onPaid(invoice)}><Check size={15} /></IconButton>}
                  <IconButton label="Edit" onClick={() => props.onEdit(invoice)}><Pencil size={15} /></IconButton>
                  <IconButton label="Delete" onClick={() => props.onDelete(invoice)} danger><Trash2 size={15} /></IconButton>
                </ActionRow>
              </Cell>
            </tr>
          );
        })}
      </ResponsiveTable>
      {sorted.length === 0 && <EmptyState label="No invoices yet." />}
    </DashboardCard>
  );
}

function RevenueView(props: {
  projects: Project[];
  totalContracted: number;
  totalInvoiced: number;
  totalOutstanding: number;
  paidRevenue: number;
  projectStatus: (typeof statusFilters)[number];
  setProjectStatus: (value: (typeof statusFilters)[number]) => void;
  projectType: (typeof projectTypeFilters)[number];
  setProjectType: (value: (typeof projectTypeFilters)[number]) => void;
  projectPriority: (typeof priorityFilters)[number];
  setProjectPriority: (value: (typeof priorityFilters)[number]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard icon={CircleDollarSign} label="Contracted" value={money(props.totalContracted)} detail="portfolio total" tone="accent" />
        <StatCard icon={CreditCard} label="Invoiced" value={money(props.totalInvoiced)} detail="sent to clients" tone="blue" />
        <StatCard icon={AlertTriangle} label="Outstanding" value={money(props.totalOutstanding)} detail="remaining balance" tone="amber" />
        <StatCard icon={Check} label="Paid Revenue" value={money(props.paidRevenue)} detail="paid invoices" tone="green" />
      </div>
      <Toolbar search="" setSearch={() => undefined}>
        <FilterSelect value={props.projectType} onChange={props.setProjectType} options={projectTypeFilters} />
        <FilterSelect value={props.projectStatus} onChange={props.setProjectStatus} options={statusFilters} />
        <FilterSelect value={props.projectPriority} onChange={props.setProjectPriority} options={priorityFilters} />
      </Toolbar>
      <DashboardCard>
        <PanelHeader title="Project Revenue Breakdown" />
        <div className="divide-y divide-[--border]">
          {props.projects.map((project) => (
            <div key={project.id} className="grid gap-3 py-4 md:grid-cols-[1fr_180px_180px] md:items-center">
              <div>
                <p className="font-bold">{project.name}</p>
                <p className="text-xs text-[--muted]">{project.projectType || "Project"} - {project.priority || "Medium"} priority</p>
              </div>
              <div>
                <p className="text-sm font-bold">{money(project.amountInvoiced)} / {money(project.contractValue)}</p>
                <Progress value={progressForProject(project)} />
              </div>
              <StatusPill value={project.status || "Active"} />
            </div>
          ))}
          {props.projects.length === 0 && <EmptyState label="No revenue records match those filters." />}
        </div>
      </DashboardCard>
    </div>
  );
}

function ClientsView(props: {
  clients: Project[];
  search: string;
  setSearch: (value: string) => void;
  projectStatus: (typeof statusFilters)[number];
  setProjectStatus: (value: (typeof statusFilters)[number]) => void;
  projectType: (typeof projectTypeFilters)[number];
  setProjectType: (value: (typeof projectTypeFilters)[number]) => void;
  clientSort: "name" | "email";
  setClientSort: (value: "name" | "email") => void;
  onDetails: (project: Project) => void;
}) {
  return (
    <div className="space-y-4">
      <Toolbar search={props.search} setSearch={props.setSearch}>
        <FilterSelect value={props.projectType} onChange={props.setProjectType} options={projectTypeFilters} />
        <FilterSelect value={props.projectStatus} onChange={props.setProjectStatus} options={statusFilters} />
        <FilterSelect value={props.clientSort} onChange={props.setClientSort} options={["name", "email"] as const} />
      </Toolbar>
      <DashboardCard className="overflow-hidden p-0">
        <ResponsiveTable headers={["Client", "Email", "Project", "Type", "Status", "Actions"]}>
          {props.clients.map((project) => (
            <tr key={project.id} className="border-b border-[--border] last:border-0">
              <Cell strong>{project.clientName || "No client"}</Cell>
              <Cell>{project.clientEmail || "No email"}</Cell>
              <Cell>{project.name}</Cell>
              <Cell>{project.projectType || "Project"}</Cell>
              <Cell><StatusPill value={project.status || "Active"} /></Cell>
              <Cell><IconButton label="Project details" onClick={() => props.onDetails(project)}><Eye size={15} /></IconButton></Cell>
            </tr>
          ))}
        </ResponsiveTable>
        {props.clients.length === 0 && <EmptyState label="No clients match those filters." />}
      </DashboardCard>
    </div>
  );
}

function CommsView(props: {
  inquiries: Inquiry[];
  search: string;
  setSearch: (value: string) => void;
  commStatus: "all" | "unread" | "read";
  setCommStatus: (value: "all" | "unread" | "read") => void;
  onOpen: (inquiry: Inquiry) => void;
  onDelete: (inquiry: Inquiry) => void;
  onRead: (inquiry: Inquiry) => void;
}) {
  return (
    <div className="space-y-4">
      <Toolbar search={props.search} setSearch={props.setSearch}>
        <FilterSelect value={props.commStatus} onChange={props.setCommStatus} options={["all", "unread", "read"] as const} />
      </Toolbar>
      <DashboardCard className="overflow-hidden p-0">
        <ResponsiveTable headers={["Date", "Sender", "Message", "Project Type", "Status", "Actions"]}>
          {props.inquiries.map((inquiry) => (
            <tr key={inquiry.id} className="border-b border-[--border] last:border-0">
              <Cell strong>{dateLabel(inquiry.createdAt)}</Cell>
              <Cell>
                <p>{inquiry.name}</p>
                <p className="text-xs text-[--muted]">{inquiry.email}</p>
              </Cell>
              <Cell>{inquiry.message.length > 92 ? `${inquiry.message.slice(0, 92)}...` : inquiry.message}</Cell>
              <Cell>{inquiry.projectType}</Cell>
              <Cell><StatusPill value={inquiry.isRead ? "Read" : "Unread"} /></Cell>
              <Cell>
                <ActionRow>
                  <IconButton label="View message" onClick={() => props.onOpen(inquiry)}><Eye size={15} /></IconButton>
                  {!inquiry.isRead && <IconButton label="Mark read" onClick={() => props.onRead(inquiry)}><Check size={15} /></IconButton>}
                  <IconButton label="Delete" onClick={() => props.onDelete(inquiry)} danger><Trash2 size={15} /></IconButton>
                </ActionRow>
              </Cell>
            </tr>
          ))}
        </ResponsiveTable>
        {props.inquiries.length === 0 && <EmptyState label="No communications match those filters." />}
      </DashboardCard>
    </div>
  );
}

function SettingsView(props: {
  user: { email?: string | null; role?: string | null } | null;
  projects: Project[];
  invoices: Invoice[];
  timeEntries: TimeEntry[];
  inquiries: Inquiry[];
  onBackToSite: () => void;
  onSignOut: () => Promise<void>;
}) {
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "jrcoffee-dark") return "dark";
    if (stored === "light") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  const toggleThemeColor = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.dataset.theme = nextTheme === "dark" ? "jrcoffee-dark" : "cupcake";
    window.localStorage.setItem("theme", nextTheme);
    setThemeMode(nextTheme);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <DashboardCard>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-[--accent] text-lg font-semibold text-[--foam]">{initials(props.user?.email)}</div>
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-[0.08em] text-[--accent]">Signed in</p>
              <h2 className="truncate text-lg font-semibold">{props.user?.email || "Admin user"}</h2>
              <p className="text-sm capitalize text-[--muted]">{props.user?.role || "admin"}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <SettingsActionButton icon={Home} label="Back to Site" onClick={props.onBackToSite} />
            <SettingsActionButton icon={Palette} label={`Theme Color: ${themeMode === "dark" ? "Dark" : "Light"}`} onClick={toggleThemeColor} />
            <SettingsActionButton icon={LogOut} label="Sign Out" onClick={() => void props.onSignOut()} danger />
          </div>
        </div>
      </DashboardCard>
      <DashboardCard>
        <PanelHeader title="Workspace Counts" />
        <div className="grid gap-3 md:grid-cols-4">
          <MiniCount label="Projects" value={props.projects.length} />
          <MiniCount label="Invoices" value={props.invoices.length} />
          <MiniCount label="Time Entries" value={props.timeEntries.length} />
          <MiniCount label="Messages" value={props.inquiries.length} />
        </div>
      </DashboardCard>
    </div>
  );
}

function ProjectForm(props: {
  form: ProjectFormState;
  setForm: React.Dispatch<React.SetStateAction<ProjectFormState>>;
  error: string | null;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const update = (patch: Partial<ProjectFormState>) => props.setForm((current) => ({ ...current, ...patch }));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const hasCloudinaryConfig = Boolean(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  const calculatedContractValue =
    props.form.contractType === "Hourly"
      ? numberValue(props.form.estHours) * numberValue(props.form.effectiveRate)
      : numberValue(props.form.contractValue);
  const calculatedOutstanding = Math.max(0, calculatedContractValue - numberValue(props.form.amountInvoiced));

  const onThumbnailFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      const url = await uploadProjectThumbnail(file);
      update({ thumbnail: url });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Thumbnail upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <form onSubmit={props.onSubmit} className="space-y-6">
      <FormSection
        title="Project Identity"
        description="The fields that make this project easy to find, publish, and organize."
      >
        <Field label="Project ID">
          <input value={props.form.projectId} onChange={(e) => update({ projectId: e.target.value })} placeholder="Auto-generated" />
        </Field>
        <Field label="Project Name">
          <input value={props.form.name} onChange={(e) => update({ name: e.target.value })} required />
        </Field>
        <Field label="Category">
          <Select value={props.form.category} onChange={(value) => update({ category: value })} options={projectCategoryOptions} />
        </Field>
        <Field label="Project Type">
          <Select value={props.form.projectType} onChange={(value) => update({ projectType: value })} options={["Full-stack", "Consulting", "Games"]} />
        </Field>
        <Field label="Status">
          <Select value={props.form.status} onChange={(value) => update({ status: value as ProjectStatus })} options={["Active", "Review", "Completed", "Archived"]} />
        </Field>
        <Field label="Priority">
          <Select value={props.form.priority} onChange={(value) => update({ priority: value as Priority })} options={["Low", "Medium", "High"]} />
        </Field>
        <Field label="Visibility">
          <Select value={props.form.isPublic ? "Public" : "Private"} onChange={(value) => update({ isPublic: value === "Public" })} options={["Public", "Private"]} />
        </Field>
        <Field label="Tags">
          <input value={props.form.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="React, Hono, Postgres" />
        </Field>
      </FormSection>

      <FormSection
        title="Client"
        description="Contact details associated with this project."
      >
        <Field label="Client Name">
          <input value={props.form.clientName} onChange={(e) => update({ clientName: e.target.value })} />
        </Field>
        <Field label="Client Email">
          <input type="email" value={props.form.clientEmail} onChange={(e) => update({ clientEmail: e.target.value })} />
        </Field>
        <Field label="Client Contact">
          <input value={props.form.clientContact} onChange={(e) => update({ clientContact: e.target.value })} placeholder="Phone, Slack, preferred contact" />
        </Field>
      </FormSection>

      <FormSection
        title="Thumbnail"
        description="Upload a portfolio image to Cloudinary or paste an existing image URL."
      >
        <div className="md:col-span-2 lg:col-span-4">
          <div className="grid gap-4 rounded-lg border border-[--border] bg-[--bg-alt]/20 p-3 sm:p-4 md:grid-cols-[160px_1fr]">
            <div className="grid aspect-video place-items-center overflow-hidden rounded-lg border border-[--border] bg-[--surface-strong]">
              {props.form.thumbnail ? (
                <img src={props.form.thumbnail} alt="Project thumbnail preview" className="h-full w-full object-cover" />
              ) : (
                <Image className="text-[--muted]" size={28} />
              )}
            </div>
            <div className="space-y-3">
              <div className="grid gap-2 sm:flex sm:flex-wrap">
                <label
                  className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[--accent] px-4 py-2 text-sm font-semibold text-[--foam] transition hover:bg-[--accent-strong] ${
                    !hasCloudinaryConfig || uploading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <UploadCloud size={16} />
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={onThumbnailFile} disabled={!hasCloudinaryConfig || uploading} />
                </label>
                {props.form.thumbnail && (
                  <SecondaryButton onClick={() => update({ thumbnail: "" })}>Remove Image</SecondaryButton>
                )}
              </div>
              {!hasCloudinaryConfig && (
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-200">
                  Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to enable uploads.
                </p>
              )}
              {uploadError && <FormError message={uploadError} />}
              <Field label="Thumbnail URL">
                <input type="url" value={props.form.thumbnail} onChange={(e) => update({ thumbnail: e.target.value })} placeholder="https://res.cloudinary.com/..." />
              </Field>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Finance & Contract"
        description="Contract values are used by the dashboard revenue and invoice views."
      >
        <Field label="Contract Type">
          <Select value={props.form.contractType} onChange={(value) => update({ contractType: value as ProjectFormState["contractType"] })} options={["Fixed-price", "Hourly", "Retainer"]} />
        </Field>
        <Field label="Contract Value">
          <input type="number" value={props.form.contractValue} onChange={(e) => update({ contractValue: e.target.value })} disabled={props.form.contractType === "Hourly"} />
        </Field>
        <Field label="Amount Invoiced">
          <input type="number" value={props.form.amountInvoiced} onChange={(e) => update({ amountInvoiced: e.target.value })} />
        </Field>
        <Field label="Amount Outstanding">
          <input value={calculatedOutstanding.toFixed(2)} readOnly className="cursor-not-allowed opacity-70" />
        </Field>
        <Field label="Payment Terms">
          <input value={props.form.paymentTerms} onChange={(e) => update({ paymentTerms: e.target.value })} />
        </Field>
        <Field label="Deposit Paid">
          <Select value={props.form.depositPaid} onChange={(value) => update({ depositPaid: value })} options={["No", "Yes", "Partial"]} />
        </Field>
        <Field label="Contract Signed">
          <Select value={props.form.contractSigned} onChange={(value) => update({ contractSigned: value })} options={["No", "Yes"]} />
        </Field>
        <Field label="NDA Signed">
          <Select value={props.form.ndaSigned} onChange={(value) => update({ ndaSigned: value })} options={["No", "Yes"]} />
        </Field>
      </FormSection>

      <FormSection
        title="Timeline & Scope"
        description="Planning and workload details for delivery tracking."
      >
        <Field label="Start Date">
          <input type="date" value={props.form.startDate} onChange={(e) => update({ startDate: e.target.value })} />
        </Field>
        <Field label="Deadline">
          <input type="date" value={props.form.deadline} onChange={(e) => update({ deadline: e.target.value })} />
        </Field>
        <Field label="Estimated Hours">
          <input type="number" value={props.form.estHours} onChange={(e) => update({ estHours: e.target.value })} />
        </Field>
        <Field label="Logged Hours">
          <input type="number" value={props.form.loggedHours} onChange={(e) => update({ loggedHours: e.target.value })} />
        </Field>
        <Field label="Effective Rate">
          <input type="number" value={props.form.effectiveRate} onChange={(e) => update({ effectiveRate: e.target.value })} />
        </Field>
        <Field label="Revision Rounds">
          <input value={props.form.revisionRounds} onChange={(e) => update({ revisionRounds: e.target.value })} placeholder="0 of 3" />
        </Field>
        <Field label="Scope Changes">
          <input type="number" value={props.form.scopeChanges} onChange={(e) => update({ scopeChanges: e.target.value })} />
        </Field>
        <Field label="Last Milestone">
          <input value={props.form.lastMilestone} onChange={(e) => update({ lastMilestone: e.target.value })} />
        </Field>
        <Field label="Next Milestone">
          <input value={props.form.nextMilestone} onChange={(e) => update({ nextMilestone: e.target.value })} />
        </Field>
      </FormSection>

      <FormSection
        title="Technical Links"
        description="Deployment, repository, and stack references."
      >
        <Field label="Stack">
          <input value={props.form.stack} onChange={(e) => update({ stack: e.target.value })} placeholder="React, Hono, Postgres" />
        </Field>
        <Field label="Hosting">
          <input value={props.form.hosting} onChange={(e) => update({ hosting: e.target.value })} placeholder="Vercel, Render, Cloudflare" />
        </Field>
        <Field label="Repository">
          <input value={props.form.repo} onChange={(e) => update({ repo: e.target.value })} placeholder="Internal repo name or URL" />
        </Field>
        <Field label="Staging URL">
          <input type="url" value={props.form.stagingUrl} onChange={(e) => update({ stagingUrl: e.target.value })} />
        </Field>
        <Field label="GitHub URL">
          <input type="url" value={props.form.githubUrl} onChange={(e) => update({ githubUrl: e.target.value })} />
        </Field>
        <Field label="Live URL">
          <input type="url" value={props.form.liveUrl} onChange={(e) => update({ liveUrl: e.target.value })} />
        </Field>
      </FormSection>

      <FormSection
        title="Narrative"
        description="Public portfolio copy and private operational notes."
        columns="two"
      >
        <Field label="Public Description">
          <textarea rows={5} className="resize-none" value={props.form.description} onChange={(e) => update({ description: e.target.value })} required />
        </Field>
        <Field label="Internal Notes">
          <textarea rows={5} className="resize-none" value={props.form.internalNotes} onChange={(e) => update({ internalNotes: e.target.value })} />
        </Field>
      </FormSection>
      {props.error && <FormError message={props.error} />}
      <FormActions onCancel={props.onCancel} submitLabel="Save Project" />
    </form>
  );
}

function InvoiceForm(props: {
  form: InvoiceFormState;
  setForm: React.Dispatch<React.SetStateAction<InvoiceFormState>>;
  projects: Project[];
  error: string | null;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const update = (patch: Partial<InvoiceFormState>) => props.setForm((current) => ({ ...current, ...patch }));
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <Field label="Project"><Select value={props.form.projectId} onChange={(value) => update({ projectId: value })} options={["", ...props.projects.map((project) => String(project.id))]} labels={{ "": "Select a project", ...Object.fromEntries(props.projects.map((project) => [String(project.id), project.name])) }} /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Amount"><input type="number" step="0.01" value={props.form.amount} onChange={(e) => update({ amount: e.target.value })} required /></Field>
        <Field label="Due Date"><input type="date" value={props.form.dueDate} onChange={(e) => update({ dueDate: e.target.value })} required /></Field>
        <Field label="Status"><Select value={props.form.status} onChange={(value) => update({ status: value as InvoiceStatus })} options={["Pending", "Paid", "Overdue", "Cancelled"]} /></Field>
      </div>
      <Field label="Notes"><textarea rows={3} value={props.form.notes} onChange={(e) => update({ notes: e.target.value })} /></Field>
      {props.error && <FormError message={props.error} />}
      <FormActions onCancel={props.onCancel} submitLabel="Save Invoice" />
    </form>
  );
}

function TimeForm(props: {
  form: TimeFormState;
  setForm: React.Dispatch<React.SetStateAction<TimeFormState>>;
  projects: Project[];
  error: string | null;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const update = (patch: Partial<TimeFormState>) => props.setForm((current) => ({ ...current, ...patch }));
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <Field label="Project"><Select value={props.form.projectId} onChange={(value) => update({ projectId: value })} options={["", ...props.projects.map((project) => String(project.id))]} labels={{ "": "Select a project", ...Object.fromEntries(props.projects.map((project) => [String(project.id), project.name])) }} /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Date"><input type="date" value={props.form.date} onChange={(e) => update({ date: e.target.value })} required /></Field>
        <Field label="Hours"><input type="number" step="0.25" value={props.form.hours} onChange={(e) => update({ hours: e.target.value })} required /></Field>
      </div>
      <Field label="Notes"><textarea rows={3} value={props.form.notes} onChange={(e) => update({ notes: e.target.value })} /></Field>
      {props.error && <FormError message={props.error} />}
      <FormActions onCancel={props.onCancel} submitLabel="Save Time" />
    </form>
  );
}

function ProjectDetails({ project, hours, onClose }: { project: Project; hours: number; onClose: () => void }) {
  return (
    <Modal title={project.name} onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-3">
        <MiniCount label="Contract" value={money(project.contractValue)} />
        <MiniCount label="Invoiced" value={money(project.amountInvoiced)} />
        <MiniCount label="Hours" value={`${hours}h`} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <DetailBlock label="Client" value={`${project.clientName || "No client"}\n${project.clientEmail || "No email"}`} />
        <DetailBlock label="Timeline" value={`Start: ${dateLabel(project.startDate)}\nDue: ${dateLabel(project.deadline)}`} />
        <DetailBlock label="Stack & Tags" value={project.tags || project.stack || "No stack recorded"} />
        <DetailBlock label="Links" value={`${project.liveUrl || "No live URL"}\n${project.githubUrl || "No GitHub URL"}`} />
        <DetailBlock label="Description" value={project.description || "No description"} wide />
        <DetailBlock label="Internal Notes" value={project.internalNotes || "No notes"} wide />
      </div>
    </Modal>
  );
}

function InquiryDetails({ inquiry, onClose }: { inquiry: Inquiry; onClose: () => void }) {
  return (
    <Modal title="Communication Details" onClose={onClose}>
      <div className="space-y-4">
        <DetailBlock label="Date" value={dateLabel(inquiry.createdAt)} />
        <DetailBlock label="Project Type" value={inquiry.projectType} />
        <DetailBlock label="Sender" value={`${inquiry.name}\n${inquiry.email}`} />
        <DetailBlock label="Full Message" value={inquiry.message} />
      </div>
    </Modal>
  );
}

function DashboardCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={`card rounded-lg border border-[--border] bg-[--surface] p-4 shadow-[--shadow] theme-transition ${className}`}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, detail, tone }: { icon: React.ElementType; label: string; value: string; detail: string; tone: "accent" | "green" | "blue" | "amber" }) {
  const tones = {
    accent: "bg-[--accent-soft]/20 text-[--accent]",
    green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
    blue: "bg-sky-500/15 text-sky-700 dark:text-sky-200",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-200",
  };
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.04em] text-[--muted]">{label}</p>
          <p className="mt-2 text-2xl font-semibold leading-tight">{value}</p>
          <p className="text-xs text-[--muted-soft]">{detail}</p>
        </div>
        <motion.span whileHover={{ scale: 1.04 }} className={`grid h-10 w-10 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon size={19} />
        </motion.span>
      </div>
    </DashboardCard>
  );
}

function Toolbar(props: {
  search: string;
  setSearch: (value: string) => void;
  children?: React.ReactNode;
  buttonLabel?: string;
  onButton?: () => void;
}) {
  return (
    <DashboardCard className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full min-w-0 md:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" size={17} />
        <input value={props.search} onChange={(e) => props.setSearch(e.target.value)} placeholder="Search dashboard records" className="pl-10" />
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:w-auto md:flex-wrap">
        {props.children}
        {props.buttonLabel && props.onButton && <PrimaryButton onClick={props.onButton}>{props.buttonLabel}</PrimaryButton>}
      </div>
    </DashboardCard>
  );
}

function PanelHeader({ title, actionLabel, onAction, className = "" }: { title: string; actionLabel?: string; onAction?: () => void; className?: string }) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-3 ${className}`}>
      <h2 className="text-base font-semibold tracking-normal">{title}</h2>
      {actionLabel && onAction && (
        <button onClick={onAction} className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.07em] text-[--accent] hover:text-[--accent-strong]">
          {actionLabel}
          <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
}

function ResponsiveTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  const rows = React.Children.toArray(children).filter(React.isValidElement);

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {rows.map((row, rowIndex) => {
          if (!React.isValidElement(row)) return null;
          const cells = React.Children.toArray((row.props as { children?: React.ReactNode }).children).filter(React.isValidElement);

          return (
            <motion.div
              key={row.key || rowIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, delay: rowIndex * 0.025 }}
              className="rounded-lg border border-[--border] bg-[--surface-strong] p-3"
            >
              <div className="grid gap-2">
                {cells.map((cell, cellIndex) => (
                  <div key={`${headers[cellIndex] || cellIndex}-${cellIndex}`} className="grid gap-1 border-b border-[--border]/60 pb-2 last:border-0 last:pb-0">
                    <span className="text-[10px] font-medium tracking-[0.04em] text-[--muted]">{headers[cellIndex] || "Field"}</span>
                    <div className="min-w-0 text-sm text-[--text]">{(cell.props as { children?: React.ReactNode }).children}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="table table-sm w-full min-w-[980px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[--border] bg-[--bg-alt]/35">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-[11px] font-medium tracking-[0.04em] text-[--muted]">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
        </table>
      </div>
    </>
  );
}

function Cell({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={`px-4 py-3 align-middle ${strong ? "font-semibold" : ""}`}>{children}</td>;
}

function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="min-w-[120px]">
      <div className="h-2 rounded-full bg-[--border]">
        <motion.div
          className="h-full rounded-full bg-[--accent]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {label && <p className="mt-1 text-xs font-medium text-[--muted]">{label}</p>}
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const className =
    normalized.includes("paid") || normalized.includes("completed") || normalized.includes("read")
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200"
      : normalized.includes("overdue") || normalized.includes("high")
        ? "bg-red-500/15 text-red-700 dark:text-red-200"
        : normalized.includes("review") || normalized.includes("pending") || normalized.includes("medium") || normalized.includes("unread")
          ? "bg-amber-500/15 text-amber-700 dark:text-amber-200"
          : "bg-[--accent-soft]/15 text-[--accent]";
  return <span className={`badge border-0 px-2 py-2 text-[10px] font-medium tracking-[0.03em] ${className}`}>{value}</span>;
}

function NavButton({
  icon: Icon,
  label,
  active = false,
  onClick,
  compact = false,
  collapsed = false,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  compact?: boolean;
  collapsed?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      title={label}
      whileTap={{ scale: 0.98 }}
      whileHover={{ x: active ? 0 : 2 }}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
        active ? "bg-[--accent] text-[--foam]" : "text-[--muted] hover:bg-[--accent-soft]/15 hover:text-[--text]"
      } ${compact ? "pl-8" : ""} ${collapsed ? "lg:justify-center lg:px-0 lg:pl-0" : ""}`}
    >
      <Icon size={17} />
      <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
    </motion.button>
  );
}

function NavGroup({ label, icon: Icon, open, onToggle, children, collapsed = false }: { label: string; icon: React.ElementType; open: boolean; onToggle: () => void; children: React.ReactNode; collapsed?: boolean }) {
  return (
    <div>
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={onToggle}
        title={label}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[--text] hover:bg-[--accent-soft]/10 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
      >
        <span className="flex items-center gap-3"><Icon size={17} /><span className={collapsed ? "lg:hidden" : ""}>{label}</span></span>
        <ChevronDown className={`transition ${open ? "rotate-180" : ""} ${collapsed ? "lg:hidden" : ""}`} size={16} />
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-1 space-y-1 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickBadge({ icon: Icon, label, tone, onClick }: { icon: React.ElementType; label: string; tone: "neutral" | "amber" | "red"; onClick: () => void }) {
  const className = tone === "red" ? "text-red-700 dark:text-red-200" : tone === "amber" ? "text-amber-700 dark:text-amber-200" : "text-[--muted]";
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} className={`btn btn-sm hidden min-h-0 items-center gap-2 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-xs font-medium md:inline-flex ${className}`}>
      <Icon size={15} />
      {label}
    </motion.button>
  );
}

function SettingsActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`btn min-h-0 justify-between rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm font-medium flex items-center  ${
        danger ? "text-red-700 hover:border-red-500 hover:text-red-600 dark:text-red-200" : "text-[--text] hover:border-[--accent] hover:text-[--accent]"
      }`}
    >
      <Icon size={17} />
      <p>{label}</p>
    </motion.button>
  );
}

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <motion.div className="modal modal-open fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`modal-box max-h-[92vh] w-full overflow-hidden rounded-b-none rounded-t-lg border border-[--border] bg-[--surface-strong] p-0 shadow-[--shadow] sm:max-h-[88vh] sm:rounded-lg ${wide ? "max-w-5xl" : "max-w-2xl"}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[--border] p-3 sm:p-4">
          <h2 className="min-w-0 truncate text-base font-semibold tracking-normal sm:text-lg">{title}</h2>
          <IconButton label="Close" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <div className="max-h-[calc(92vh-58px)] overflow-y-auto p-3 sm:max-h-[calc(88vh-70px)] sm:p-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span className="text-[11px] font-medium tracking-[0.04em] text-[--muted]">{label}</span>
      {children}
    </label>
  );
}

function Select<T extends string>({ value, onChange, options, labels = {} }: { value: T; onChange: (value: T) => void; options: readonly T[]; labels?: Record<string, string> }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as T)} className="bg-[length:0.8rem] bg-[right_1rem_center] pr-11">
      {options.map((option) => <option key={option} value={option}>{labels[option] || option}</option>)}
    </select>
  );
}

function FilterSelect<T extends string>({ value, onChange, options }: { value: T; onChange: (value: T) => void; options: readonly T[] }) {
  return <select className="select select-bordered select-sm w-full min-w-0 bg-[length:0.8rem] bg-[right_1rem_center] !py-2 pr-11 text-xs font-medium md:w-auto md:min-w-[130px]" value={value} onChange={(event) => onChange(event.target.value as T)}>{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

function FormSection({
  title,
  description,
  children,
  columns = "four",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  columns?: "two" | "four";
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.18 }}
      className="rounded-lg border border-[--border] bg-[--surface]/70 p-3 sm:p-4"
    >
      <div className="mb-3 border-b border-[--border] pb-3 sm:mb-4">
        <h3 className="text-sm font-semibold tracking-normal text-[--accent]">{title}</h3>
        {description && <p className="mt-1 text-xs text-[--muted-soft]">{description}</p>}
      </div>
      <div className={`grid gap-3 sm:gap-4 ${columns === "two" ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>{children}</div>
    </motion.section>
  );
}

function FormActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="grid gap-2 border-t border-[--border] pt-4 sm:flex sm:justify-end">
      <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
      <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
    </div>
  );
}

function FormError({ message }: { message: string }) {
  return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-700 dark:text-red-200">{message}</div>;
}

function PrimaryButton({ children, onClick, type = "button" }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="btn btn-sm min-h-0 w-full rounded-lg border-0 bg-[--accent] px-4 py-2 text-sm font-medium text-[--foam] hover:bg-[--accent-strong] sm:w-auto"
    >
      {children}
    </motion.button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="btn btn-sm min-h-0 w-full rounded-lg border border-[--border] bg-[--surface] px-4 py-2 text-sm font-medium text-[--text] hover:border-[--accent] sm:w-auto"
    >
      {children}
    </motion.button>
  );
}

function IconButton({ children, label, onClick, danger = false, className = "" }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean; className?: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className={`btn btn-square h-9 min-h-9 w-9 min-w-9 shrink-0 rounded-lg border border-[--border] bg-[--surface] p-0 text-[--text] transition hover:border-[--accent] hover:text-[--accent] flex items-center justify-center ${danger ? "hover:border-red-500 hover:text-red-600" : ""} ${className}`}
    >
      {children}
    </motion.button>
  );
}

function IconLink({ children, label, href }: { children: React.ReactNode; label: string; href: string }) {
  return (
    <a aria-label={label} title={label} href={href} target="_blank" rel="noreferrer" className="inline-grid h-9 min-h-9 w-9 min-w-9 shrink-0 place-items-center rounded-lg border border-[--border] bg-[--surface] p-0 transition hover:border-[--accent] hover:text-[--accent]">
      {children}
    </a>
  );
}

function ActionRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,2.25rem)] gap-1.5 sm:flex sm:flex-wrap">{children}</div>;
}

function TagRow({ value }: { value: string }) {
  const tags = value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 3);
  if (!tags.length) return <span className="text-xs text-[--muted]">No tags</span>;
  return <div className="flex flex-wrap gap-1">{tags.map((tag) => <span key={tag} className="rounded-md bg-[--accent-soft]/15 px-2 py-1 text-[10px] font-bold text-[--accent]">{tag}</span>)}</div>;
}

function FinanceLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg border border-[--border] bg-[--surface-strong] p-3"><span className="text-sm text-[--muted]">{label}</span><span className="font-semibold">{value}</span></div>;
}

function MiniCount({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-lg border border-[--border] bg-[--bg-alt]/25 p-4"><p className="text-[10px] font-semibold tracking-[0.08em] text-[--muted]">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>;
}

function DetailBlock({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-lg border border-[--border] bg-[--bg-alt]/25 p-4 ${wide ? "md:col-span-2" : ""}`}>
      <p className="mb-2 text-[10px] font-semibold tracking-[0.08em] text-[--muted]">{label}</p>
      <p className="whitespace-pre-wrap text-sm leading-6">{value}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="p-8 text-center text-sm font-semibold text-[--muted]">{label}</div>;
}

/* ── IntakesView ─────────────────────────────────────────────────────────── */
function IntakesView({
  intakes,
  projects,
  apiBase,
  onRefresh,
}: {
  intakes: ClientIntake[];
  projects: Project[];
  apiBase: string;
  onRefresh: () => void;
}) {
  const [selected, setSelected] = useState<ClientIntake | null>(null);
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = intakes.filter(i =>
    `${i.name} ${i.email} ${i.company ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  async function markRead(intake: ClientIntake) {
    if (intake.isRead) return;
    await fetch(`${apiBase}/api/admin/intakes/${intake.id}/read`, { method: "PATCH", credentials: "include" });
    onRefresh();
  }

  async function open(intake: ClientIntake) {
    setSelected(intake);
    await markRead(intake);
  }

  async function del(intake: ClientIntake) {
    if (!window.confirm(`Delete intake from ${intake.name}?`)) return;
    await fetch(`${apiBase}/api/admin/intakes/${intake.id}`, { method: "DELETE", credentials: "include" });
    if (selected?.id === intake.id) setSelected(null);
    onRefresh();
  }

  async function linkProject(intakeId: number, projectId: number | null) {
    await fetch(`${apiBase}/api/admin/intakes/${intakeId}/link`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    setLinkingId(null);
    onRefresh();
    if (selected?.id === intakeId) setSelected(s => s ? { ...s, projectId } : s);
  }

  const unread = intakes.filter(i => !i.isRead).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Intake Submissions</h2>
          <p className="text-xs text-[--muted] mt-0.5">{intakes.length} total · {unread} unread</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 text-sm rounded-xl border border-[--input-border] bg-[--input-bg] px-3 py-2"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState label="No intake submissions yet." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(intake => {
            const p = intake.payload as Record<string, unknown>;
            const linkedProject = projects.find(proj => proj.id === intake.projectId);
            return (
              <div
                key={intake.id}
                onClick={() => void open(intake)}
                className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:border-[--accent-soft] ${
                  intake.isRead ? "border-[--border] bg-[--surface]" : "border-[--accent-soft] bg-[--foam]"
                }`}
              >
                {/* Unread dot */}
                <div className="mt-1.5 flex-shrink-0">
                  {!intake.isRead
                    ? <div className="w-2 h-2 rounded-full bg-[--accent]" />
                    : <div className="w-2 h-2 rounded-full bg-transparent" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{intake.name}</span>
                    {intake.company && <span className="text-xs text-[--muted]">· {intake.company}</span>}
                    {linkedProject && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[--accent]/15 text-[--accent]">
                        {linkedProject.projectId ?? linkedProject.name}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[--muted] mt-0.5">{intake.email}</div>
                  <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-[--muted-soft]">
                    {!!p.project_type && <span>🏗 {String(p.project_type)}</span>}
                    {!!p.budget && <span>💰 {String(p.budget)}</span>}
                    {!!p.launch_date && <span>📅 {String(p.launch_date)}</span>}
                  </div>
                </div>

                <div className="flex-shrink-0 text-[10px] text-[--muted] whitespace-nowrap">
                  {new Date(intake.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[--foam] border-l border-[--border] z-50 overflow-y-auto flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-[--border] sticky top-0 bg-[--foam] z-10">
                <div>
                  <div className="font-semibold">{selected.name}</div>
                  <div className="text-xs text-[--muted]">{selected.email}{selected.company ? ` · ${selected.company}` : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLinkingId(linkingId === selected.id ? null : selected.id)}
                    className="text-[10px] font-semibold px-3 py-1.5 rounded-full border border-[--border] text-[--muted] hover:text-[--text] hover:border-[--accent-soft] transition-all cursor-pointer"
                  >
                    {selected.projectId ? "Re-link project" : "Link to project"}
                  </button>
                  <button onClick={() => void del(selected)}
                    className="p-2 rounded-lg text-[--muted] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all cursor-pointer">
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => setSelected(null)}
                    className="p-2 rounded-lg text-[--muted] hover:text-[--text] transition-all cursor-pointer">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Link to project panel */}
              <AnimatePresence>
                {linkingId === selected.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-b border-[--border] bg-[--surface]"
                  >
                    <div className="p-4">
                      <p className="text-xs font-semibold text-[--muted] mb-2 uppercase tracking-widest">Link to project</p>
                      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                        {selected.projectId && (
                          <button onClick={() => void linkProject(selected.id, null)}
                            className="text-left px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer">
                            ✕ Remove link
                          </button>
                        )}
                        {projects.map(p => (
                          <button key={p.id} onClick={() => void linkProject(selected.id, p.id)}
                            className={`text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                              selected.projectId === p.id
                                ? "bg-[--accent] text-[--bg] font-semibold"
                                : "hover:bg-[--surface-muted] text-[--text]"
                            }`}>
                            {p.projectId ? `${p.projectId} — ` : ""}{p.name}
                            {p.clientName ? ` (${p.clientName})` : ""}
                          </button>
                        ))}
                        {projects.length === 0 && <p className="text-xs text-[--muted] px-3 py-2">No projects yet.</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payload fields */}
              <div className="p-5 flex flex-col gap-5">
                <IntakeSection title="About" payload={selected.payload} fields={[
                  ["Name", "name"], ["Email", "email"], ["Phone", "phone"],
                  ["Company", "company"], ["Industry", "industry"],
                  ["Existing URL", "existing_url"], ["Social links", "social_links"],
                ]} />
                <IntakeSection title="Project" payload={selected.payload} fields={[
                  ["Type", "project_type"], ["Description", "project_description"],
                  ["Goal", "project_goal"], ["Budget", "budget"],
                  ["Launch date", "launch_date"], ["Competitors", "competitors"],
                ]} />
                <IntakeSection title="Audience" payload={selected.payload} fields={[
                  ["Audience", "audience_description"], ["Geography", "geography"],
                  ["Device focus", "device_focus"], ["Languages", "languages"],
                  ["Accessibility", "accessibility"],
                ]} />
                <IntakeSection title="Design" payload={selected.payload} fields={[
                  ["Brand assets", "brand_assets"], ["Tone", "design_tone"],
                  ["Colors", "color_direction"], ["References", "design_references"],
                  ["Avoid", "design_avoid"], ["Dark mode", "dark_mode"],
                  ["Page count", "page_count_estimate"], ["Pages", "pages_list"],
                ]} />
                <IntakeSection title="Features" payload={selected.payload} fields={[
                  ["Core features", "core_features"], ["E-commerce", "ecommerce"],
                  ["Integrations", "integrations"], ["Third-party tools", "third_party_tools"],
                  ["Custom features", "custom_features"], ["Mobile app", "mobile_app"],
                ]} />
                <IntakeUserStories payload={selected.payload} />
                <IntakeSection title="Content" payload={selected.payload} fields={[
                  ["Copywriting", "copywriting"], ["Photography", "photography"],
                  ["Video", "video_content"], ["CMS", "cms"],
                  ["SEO", "seo"], ["Legal pages", "legal_pages"],
                ]} />
                <IntakeSection title="Tech & Hosting" payload={selected.payload} fields={[
                  ["Domain status", "domain_status"], ["Domain name", "domain_name"],
                  ["Hosting", "hosting_platform"], ["Tech stack", "tech_stack"],
                  ["Staging", "staging"], ["Security", "security"],
                  ["Post-launch", "post_launch_support"], ["Extra notes", "extra_notes"],
                ]} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function IntakeSection({
  title,
  payload,
  fields,
}: {
  title: string;
  payload: Record<string, unknown>;
  fields: [string, string][];
}) {
  const rows = fields.filter(([, key]) => {
    const v = payload[key];
    if (v === null || v === undefined || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });
  if (rows.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-2">{title}</p>
      <div className="rounded-xl border border-[--border] bg-[--surface] overflow-hidden">
        {rows.map(([label, key]) => {
          const v = payload[key];
          const display = Array.isArray(v) ? v.join(", ") : String(v);
          return (
            <div key={key} className="flex gap-3 px-4 py-2.5 border-b border-[--border] last:border-0 text-xs">
              <span className="text-[--muted] whitespace-nowrap min-w-[110px]">{label}</span>
              <span className="text-[--text] break-words">{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IntakeUserStories({ payload }: { payload: Record<string, unknown> }) {
  const stories = payload.user_stories as Array<{ role: string; action: string; benefit: string; priority: string }> | undefined;
  if (!stories?.length) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-2">User Stories</p>
      <div className="flex flex-col gap-2">
        {stories.map((s, i) => (
          <div key={i} className="rounded-xl border border-[--border] bg-[--surface] px-4 py-3 text-xs">
            <span className="font-semibold text-[--accent] mr-2">[{s.priority}]</span>
            As a <em>{s.role || "…"}</em>, I want to <em>{s.action || "…"}</em>
            {s.benefit ? <>, so that <em>{s.benefit}</em></> : ""}.
          </div>
        ))}
      </div>
    </div>
  );
}
