import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiZap, FiUsers, FiSliders, FiSettings, FiNavigation,
  FiFileText, FiServer, FiCheck, FiPlus, FiX, FiCopy, FiCode,
  FiSmartphone, FiMonitor, FiShoppingCart, FiLayout, FiBookOpen,
  FiImage, FiList, FiHome
} from 'react-icons/fi';

/* ── Types ───────────────────────────────────────────────────────────────── */
interface Story {
  id: number;
  role: string;
  action: string;
  benefit: string;
  priority: 'Must have' | 'Should have' | 'Could have';
}

interface FormData {
  // Step 0 — About you
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  existing_url: string;
  social_links: string;
  // Step 1 — Project
  project_type: string;
  project_description: string;
  project_goal: string;
  budget: string;
  launch_date: string;
  competitors: string;
  // Step 2 — Audience
  audience_description: string;
  geography: string[];
  device_focus: string;
  languages: string;
  accessibility: string;
  // Step 3 — Design
  brand_assets: string[];
  design_tone: string[];
  color_direction: string;
  design_references: string;
  design_avoid: string;
  dark_mode: string;
  page_count_estimate: string;
  pages_list: string;
  // Step 4 — Features
  core_features: string[];
  ecommerce: string[];
  integrations: string[];
  third_party_tools: string;
  custom_features: string;
  mobile_app: string;
  // Step 5 — User stories
  user_stories: Story[];
  user_story_never: string;
  user_story_journey: string;
  // Step 6 — Content
  copywriting: string;
  photography: string;
  video_content: string[];
  cms: string;
  seo: string[];
  legal_pages: string[];
  // Step 7 — Tech
  domain_status: string;
  domain_name: string;
  hosting_platform: string[];
  tech_stack: string[];
  staging: string;
  security: string[];
  post_launch_support: string[];
  extra_notes: string;
}

const PAGE_SCALE_LABELS = ['1–3', '3–5', '5–10', '10–20', '20+'];
const AUTOSAVE_KEY = 'intake_form_draft';
const SUBMIT_ENDPOINT = '/api/intake';

const STEP_TITLES = [
  'About you', 'Project overview', 'Target audience', 'Design & branding',
  'Features & functionality', 'User stories', 'Content & media',
  'Tech & hosting', 'Review & submit'
];

const defaultData: FormData = {
  name: '', email: '', phone: '', company: '', industry: '', existing_url: '', social_links: '',
  project_type: 'Marketing website', project_description: '', project_goal: '', budget: '',
  launch_date: '', competitors: '',
  audience_description: '', geography: ['Local'], device_focus: 'Mobile-first', languages: '',
  accessibility: 'Yes, required',
  brand_assets: [], design_tone: [], color_direction: '', design_references: '', design_avoid: '',
  dark_mode: 'No', page_count_estimate: '5–10', pages_list: '',
  core_features: [], ecommerce: ['None needed'], integrations: [], third_party_tools: '',
  custom_features: '', mobile_app: 'Web only',
  user_stories: [{ id: 0, role: 'visitor', action: 'understand what this site is about at a glance', benefit: "I can decide if it's relevant to me", priority: 'Must have' }],
  user_story_never: '', user_story_journey: '',
  copywriting: "We'll provide all copy", photography: 'We have our own', video_content: ['No video'],
  cms: 'No — dev updates for us', seo: ['Not a priority'], legal_pages: [],
  domain_status: 'Yes — already owned', domain_name: '', hosting_platform: ['No preference'],
  tech_stack: ['No preference'], staging: 'Yes — staging required',
  security: ['Standard security'], post_launch_support: ['None needed'], extra_notes: ''
};

/* ── Small helpers ───────────────────────────────────────────────────────── */
function escHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function storyText(s: Story) {
  return `As a ${s.role || '…'}, I want to ${s.action || '…'}${s.benefit ? ', so that ' + s.benefit : ''}.`;
}

/* ── Chip component ──────────────────────────────────────────────────────── */
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 cursor-pointer select-none ${
        selected
          ? 'bg-[--accent] border-[--accent] text-[--bg]'
          : 'bg-[--input-bg] border-[--input-border] text-[--muted] hover:border-[--accent-soft] hover:text-[--text]'
      }`}
    >
      {label}
    </button>
  );
}

/* ── Card option ─────────────────────────────────────────────────────────── */
function CardOpt({ icon: Icon, title, sub, selected, onClick }: {
  icon: React.ElementType; title: string; sub: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-300 text-center select-none ${
        selected
          ? 'bg-[--accent] border-[--accent] text-[--bg]'
          : 'bg-[--input-bg] border-[--input-border] text-[--text] hover:border-[--accent-soft]'
      }`}
    >
      <Icon size={22} className={selected ? 'text-[--bg]' : 'text-[--muted]'} />
      <div>
        <div className="text-xs font-semibold">{title}</div>
        <div className={`text-[10px] mt-0.5 ${selected ? 'opacity-75' : 'text-[--muted]'}`}>{sub}</div>
      </div>
    </button>
  );
}

/* ── Radio option ────────────────────────────────────────────────────────── */
function RadioOpt({ label, sub, name, value, checked, onChange }: {
  label: string; sub?: string; name: string; value: string; checked: boolean; onChange: (v: string) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
        checked
          ? 'bg-[--accent] border-[--accent] text-[--bg]'
          : 'bg-[--input-bg] border-[--input-border] hover:border-[--accent-soft]'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-0.5 accent-[--accent] flex-shrink-0"
      />
      <div>
        <div className={`text-xs font-semibold ${checked ? 'text-[--bg]' : 'text-[--text]'}`}>{label}</div>
        {sub && <div className={`text-[10px] mt-0.5 ${checked ? 'opacity-75' : 'text-[--muted]'}`}>{sub}</div>}
      </div>
    </label>
  );
}

/* ── Section header ──────────────────────────────────────────────────────── */
function SectionHead({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-[--border] mb-6">
      <div className="w-10 h-10 rounded-xl bg-[--accent] bg-opacity-15 flex items-center justify-center text-[--accent] flex-shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <div className="text-base font-semibold text-[--text]">{title}</div>
        <div className="text-xs text-[--muted] mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-2 mt-5">{children}</div>
  );
}

function FieldLabel({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-2">
      {children}{req && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-[--muted] mt-1.5">{children}</p>;
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[--foam] border-l-4 border-[--accent] rounded-r-xl p-3.5 mb-5 text-xs text-[--muted-soft] leading-relaxed">
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
export default function Intake() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) return { ...defaultData, ...JSON.parse(saved) };
    } catch {}
    return defaultData;
  });
  const [pageScale, setPageScale] = useState(2); // index 2 = '5–10'
  const [storyCounter, setStoryCounter] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
  const TOTAL = 9;

  /* ── Autosave ── */
  useEffect(() => {
    try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  /* ── Toast helper ── */
  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  /* ── Field helpers ── */
  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setData(d => ({ ...d, [key]: val }));
  }, []);

  function toggleChip(key: keyof FormData, val: string) {
    const arr = data[key] as string[];
    set(key, (arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]) as any);
  }

  function setSingle(key: keyof FormData, val: string) {
    set(key, val as any);
  }

  /* ── User stories ── */
  function addStory(role = '', action = '', benefit = '') {
    const id = storyCounter;
    setStoryCounter(c => c + 1);
    set('user_stories', [...data.user_stories, { id, role, action, benefit, priority: 'Must have' }]);
  }

  function updateStory(id: number, patch: Partial<Story>) {
    set('user_stories', data.user_stories.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function removeStory(id: number) {
    set('user_stories', data.user_stories.filter(s => s.id !== id));
  }

  /* ── Navigation ── */
  function goTo(target: number) {
    if (target === TOTAL - 2) buildSummaryRef.current?.();
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Data collection (for review/submit) ── */
  function collectData() {
    return {
      ...data,
      page_count_estimate: PAGE_SCALE_LABELS[pageScale],
      submitted_at: new Date().toISOString()
    };
  }

  /* ── Summary build (ref so we can call it from navigation) ── */
  const buildSummaryRef = useRef<(() => void) | null>(null);
  const [summaryData, setSummaryData] = useState<ReturnType<typeof collectData> | null>(null);

  buildSummaryRef.current = () => {
    setSummaryData(collectData());
  };

  /* ── Submit ── */
  async function submitForm() {
    const payload = collectData();
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}${SUBMIT_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`${res.status}`);
      showToast("Submitted! We'll be in touch shortly.");
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch (err) {
      showToast('Submission failed — please try copying your answers instead.');
      console.error('[Intake] error:', err);
      console.log('[Intake] data:', JSON.stringify(payload, null, 2));
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Copy helpers ── */
  function copyText() {
    const d = collectData();
    const lines = [
      `Project Intake — ${d.name} / ${d.company}`,
      '─'.repeat(50),
      `Name: ${d.name}`, `Email: ${d.email}`, `Company: ${d.company}`, `Industry: ${d.industry}`,
      `Project type: ${d.project_type}`, `Description: ${d.project_description}`,
      `Goal: ${d.project_goal}`, `Budget: ${d.budget}`, `Launch: ${d.launch_date}`,
      `Device focus: ${d.device_focus}`, `Geography: ${d.geography.join(', ')}`,
      `Languages: ${d.languages}`, `Accessibility: ${d.accessibility}`,
      `Brand assets: ${d.brand_assets.join(', ')}`, `Tone: ${d.design_tone.join(', ')}`,
      `Dark mode: ${d.dark_mode}`, `Page count: ${d.page_count_estimate}`,
      `Pages: ${d.pages_list}`, `Core features: ${d.core_features.join(', ')}`,
      `E-commerce: ${d.ecommerce.join(', ')}`, `Integrations: ${d.integrations.join(', ')}`,
      `Custom features: ${d.custom_features}`, `Mobile: ${d.mobile_app}`,
      '', 'USER STORIES:',
      ...d.user_stories.map(s => `  [${s.priority}] ${storyText(s)}`),
      `Never do: ${d.user_story_never}`, `Key journey: ${d.user_story_journey}`, '',
      `Copywriting: ${d.copywriting}`, `Photography: ${d.photography}`,
      `CMS: ${d.cms}`, `SEO: ${d.seo.join(', ')}`, `Legal: ${d.legal_pages.join(', ')}`,
      `Domain: ${d.domain_status} — ${d.domain_name}`,
      `Hosting: ${d.hosting_platform.join(', ')}`, `Stack: ${d.tech_stack.join(', ')}`,
      `Security: ${d.security.join(', ')}`, `Post-launch: ${d.post_launch_support.join(', ')}`,
      `Extra notes: ${d.extra_notes}`, '', `Submitted: ${d.submitted_at}`
    ];
    navigator.clipboard.writeText(lines.join('\n'))
      .then(() => showToast('Copied as plain text!'))
      .catch(() => showToast('Could not copy — try selecting manually.'));
  }

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(collectData(), null, 2))
      .then(() => showToast('Copied as JSON!'))
      .catch(() => showToast('Could not copy.'));
  }

  /* ── Progress ── */
  const pct = Math.round(((step + 1) / TOTAL) * 100);

  /* ── Chip group helpers (local render shortcuts) ── */
  function MultiChips({ field, options }: { field: keyof FormData; options: string[] }) {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(o => (
          <Chip key={o} label={o} selected={(data[field] as string[]).includes(o)}
            onClick={() => toggleChip(field, o)} />
        ))}
      </div>
    );
  }

  function SingleChips({ field, options }: { field: keyof FormData; options: string[] }) {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(o => (
          <Chip key={o} label={o} selected={data[field] === o}
            onClick={() => setSingle(field, o)} />
        ))}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     STEP RENDERS
     ════════════════════════════════════════════════════════════════════════ */

  /* Step 0 — About you */
  const step0 = (
    <div>
      <SectionHead icon={FiUser} title="About you" desc="Your contact info and business basics" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel req>Full name</FieldLabel>
          <input type="text" placeholder="Jane Smith" value={data.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <FieldLabel req>Email address</FieldLabel>
          <input type="email" placeholder="jane@company.com" value={data.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <FieldLabel>Phone (optional)</FieldLabel>
          <input type="text" placeholder="+1 (555) 000-0000" value={data.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div>
          <FieldLabel req>Company / brand name</FieldLabel>
          <input type="text" placeholder="Acme Inc." value={data.company} onChange={e => set('company', e.target.value)} />
        </div>
      </div>
      <div className="mt-4">
        <FieldLabel>What industry are you in?</FieldLabel>
        <select value={data.industry} onChange={e => set('industry', e.target.value)}>
          <option value="">Select one…</option>
          {['E-commerce / retail','Healthcare / wellness','Finance / legal','Technology / SaaS',
            'Education / e-learning','Hospitality / travel','Real estate','Non-profit / NGO',
            'Creative / agency','Food & beverage','Other'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="mt-4">
        <FieldLabel>Existing website URL (if any)</FieldLabel>
        <input type="url" placeholder="https://yoursite.com" value={data.existing_url} onChange={e => set('existing_url', e.target.value)} />
      </div>
      <div className="mt-4">
        <FieldLabel>Social media or reference links</FieldLabel>
        <textarea rows={3} placeholder="LinkedIn, Instagram, competitor sites, brands you admire…" value={data.social_links} onChange={e => set('social_links', e.target.value)} />
      </div>
    </div>
  );

  /* Step 1 — Project overview */
  const step1 = (
    <div>
      <SectionHead icon={FiZap} title="Project overview" desc="The big picture — what you want to build and why" />
      <div className="mb-4">
        <FieldLabel req>What are we building?</FieldLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {[
            { v: 'Marketing website', icon: FiHome, sub: 'Brand / info pages' },
            { v: 'E-commerce store', icon: FiShoppingCart, sub: 'Sell products' },
            { v: 'Web application', icon: FiLayout, sub: 'Tool / platform' },
            { v: 'Blog / content site', icon: FiBookOpen, sub: 'Articles / media' },
            { v: 'Portfolio', icon: FiImage, sub: 'Showcase work' },
            { v: 'Directory / marketplace', icon: FiList, sub: 'Listings / marketplace' },
          ].map(({ v, icon, sub }) => (
            <CardOpt key={v} icon={icon} title={v.split(' ').slice(0, 2).join(' ')} sub={sub}
              selected={data.project_type === v} onClick={() => set('project_type', v)} />
          ))}
        </div>
      </div>
      <div className="mt-4">
        <FieldLabel req>Describe your project in your own words</FieldLabel>
        <textarea rows={4} placeholder="What does it do? Who is it for? What problem does it solve?" value={data.project_description} onChange={e => set('project_description', e.target.value)} />
      </div>
      <div className="mt-4">
        <FieldLabel>What's the main goal — what do you want visitors to do?</FieldLabel>
        <textarea rows={3} placeholder="e.g. buy a product, book a call, sign up for a free trial…" value={data.project_goal} onChange={e => set('project_goal', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <FieldLabel>Estimated budget</FieldLabel>
          <select value={data.budget} onChange={e => set('budget', e.target.value)}>
            <option value="">Select a range…</option>
            {['Under $1,000','$1,000 – $5,000','$5,000 – $15,000','$15,000 – $50,000','$50,000+','Not sure yet'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Target launch date</FieldLabel>
          <input type="date" value={data.launch_date} onChange={e => set('launch_date', e.target.value)} />
        </div>
      </div>
      <div className="mt-4">
        <FieldLabel>Top competitors or sites you admire</FieldLabel>
        <textarea rows={3} placeholder="Links or names — what do you like or dislike about them?" value={data.competitors} onChange={e => set('competitors', e.target.value)} />
      </div>
    </div>
  );

  /* Step 2 — Target audience */
  const step2 = (
    <div>
      <SectionHead icon={FiUsers} title="Target audience" desc="Who is this site for?" />
      <div className="mb-4">
        <FieldLabel>Describe your ideal visitor / user</FieldLabel>
        <textarea rows={3} placeholder="Age range, job title, interests, technical skill level…" value={data.audience_description} onChange={e => set('audience_description', e.target.value)} />
      </div>
      <div className="mb-4">
        <FieldLabel>Where are your users located?</FieldLabel>
        <MultiChips field="geography" options={['Local','National','International','Specific regions']} />
      </div>
      <div className="mb-4">
        <FieldLabel>What device do your users mostly use?</FieldLabel>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[
            { v: 'Mobile-first', icon: FiSmartphone, sub: '50%+ mobile' },
            { v: 'Desktop-first', icon: FiMonitor, sub: 'Mostly desk/laptop' },
            { v: 'Balanced', icon: FiLayout, sub: 'Mix of devices' },
          ].map(({ v, icon, sub }) => (
            <CardOpt key={v} icon={icon} title={v} sub={sub}
              selected={data.device_focus === v} onClick={() => set('device_focus', v)} />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <FieldLabel>What languages should the site support?</FieldLabel>
        <input type="text" placeholder="e.g. English only, or English + Spanish" value={data.languages} onChange={e => set('languages', e.target.value)} />
      </div>
      <div className="mb-4">
        <FieldLabel>Do you need accessibility support (WCAG / ADA)?</FieldLabel>
        <div className="flex flex-col gap-2 mt-1">
          {[
            { v: 'Yes, required', sub: 'WCAG 2.1 AA or higher' },
            { v: 'Nice to have', sub: 'Best effort' },
            { v: 'Not needed', sub: 'No specific requirement' }
          ].map(({ v, sub }) => (
            <RadioOpt key={v} name="accessibility" label={v} sub={sub} value={v}
              checked={data.accessibility === v} onChange={val => set('accessibility', val)} />
          ))}
        </div>
      </div>
    </div>
  );

  /* Step 3 — Design & branding */
  const step3 = (
    <div>
      <SectionHead icon={FiSliders} title="Design & branding" desc="Look, feel, and visual identity" />
      <div className="mb-4">
        <FieldLabel>Do you have existing brand assets?</FieldLabel>
        <MultiChips field="brand_assets" options={['Logo','Color palette','Typography','Brand guidelines','Photography','Icons / illustrations','None yet']} />
      </div>
      <div className="mb-4">
        <FieldLabel>What tone should the design have?</FieldLabel>
        <MultiChips field="design_tone" options={['Professional','Friendly','Bold','Minimal','Luxury','Playful','Technical','Warm']} />
      </div>
      <div className="mb-4">
        <FieldLabel>Preferred color direction</FieldLabel>
        <textarea rows={2} placeholder="e.g. earthy greens and cream, dark blue and gold — or paste brand hex codes" value={data.color_direction} onChange={e => set('color_direction', e.target.value)} />
      </div>
      <div className="mb-4">
        <FieldLabel>Design references you love</FieldLabel>
        <textarea rows={3} placeholder="URLs + what specifically appeals to you about each one" value={data.design_references} onChange={e => set('design_references', e.target.value)} />
      </div>
      <div className="mb-4">
        <FieldLabel>Anything you specifically want to avoid?</FieldLabel>
        <textarea rows={2} placeholder="Styles, colors, layouts, UI patterns you dislike" value={data.design_avoid} onChange={e => set('design_avoid', e.target.value)} />
      </div>
      <div className="mb-4">
        <FieldLabel>Do you need a dark mode?</FieldLabel>
        <SingleChips field="dark_mode" options={['Yes, required','Nice to have','No']} />
      </div>
      <div className="mb-4">
        <FieldLabel>How many pages / screens do you expect?</FieldLabel>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-[--muted] whitespace-nowrap">1–3</span>
          <input
            type="range" min={0} max={4} step={1} value={pageScale}
            onChange={e => {
              const v = +e.target.value;
              setPageScale(v);
              set('page_count_estimate', PAGE_SCALE_LABELS[v]);
            }}
            className="flex-1 accent-[--accent]"
          />
          <span className="text-xs text-[--muted] whitespace-nowrap">20+</span>
          <span className="text-sm font-semibold text-[--accent] min-w-[3rem] text-center">{PAGE_SCALE_LABELS[pageScale]}</span>
        </div>
        <Hint>Rough estimate — list them below</Hint>
      </div>
      <div className="mb-4">
        <FieldLabel>List the pages / screens you know you need</FieldLabel>
        <textarea rows={3} placeholder="e.g. Home, About, Services, Blog, Contact, Privacy policy…" value={data.pages_list} onChange={e => set('pages_list', e.target.value)} />
      </div>
    </div>
  );

  /* Step 4 — Features */
  const step4 = (
    <div>
      <SectionHead icon={FiSettings} title="Features & functionality" desc="What the site needs to do" />
      <SubHead>Core features</SubHead>
      <MultiChips field="core_features" options={['Contact form','User login / auth','User profiles','Admin dashboard','CMS / blog','Search','Filters / sorting','Booking / scheduling','Maps / location','Chat / messaging','Notifications','File uploads','Video / audio','Analytics dashboard']} />
      <SubHead>E-commerce & payments</SubHead>
      <MultiChips field="ecommerce" options={['Product catalogue','Shopping cart','Payment gateway','Subscriptions','Invoicing','Coupons / discounts','Digital downloads','None needed']} />
      <SubHead>Integrations</SubHead>
      <MultiChips field="integrations" options={['Email marketing','CRM','Analytics (GA)','Social login','Live chat widget','API to existing system','Single sign-on (SSO)','Push notifications']} />
      <div className="mt-4">
        <FieldLabel>Specific third-party tools you already use?</FieldLabel>
        <textarea rows={2} placeholder="e.g. HubSpot, Mailchimp, Stripe, Salesforce, Zapier…" value={data.third_party_tools} onChange={e => set('third_party_tools', e.target.value)} />
      </div>
      <div className="mt-4">
        <FieldLabel>Describe any custom or complex feature in detail</FieldLabel>
        <textarea rows={4} placeholder="Walk us through the user flow step by step" value={data.custom_features} onChange={e => set('custom_features', e.target.value)} />
      </div>
      <div className="mt-4">
        <FieldLabel>Do you need a mobile app too?</FieldLabel>
        <SingleChips field="mobile_app" options={['Web only','Web + mobile app','Not sure yet']} />
      </div>
    </div>
  );

  /* Step 5 — User stories */
  const US_TEMPLATES = [
    { label: 'Visitor browsing', role: 'visitor', action: 'see what your business offers', benefit: 'I know if you can help me' },
    { label: 'Contact info', role: 'potential customer', action: 'easily find your contact details', benefit: 'I can get in touch quickly' },
    { label: 'Sign up', role: 'new user', action: 'create an account', benefit: 'I can save my preferences and history' },
    { label: 'Login', role: 'returning customer', action: 'log back in easily', benefit: 'I can access my previous orders' },
    { label: 'Product browsing', role: 'shopper', action: 'browse and filter products', benefit: "I can find what I'm looking for quickly" },
    { label: 'Checkout', role: 'shopper', action: 'add items to a cart and check out', benefit: 'I can complete my purchase smoothly' },
    { label: 'Mobile nav', role: 'mobile user', action: 'navigate the site easily on my phone', benefit: "I don't have to pinch and zoom" },
    { label: 'CMS / admin', role: 'admin', action: 'update site content without a developer', benefit: 'I can keep information current' },
  ];

  const step5 = (
    <div>
      <SectionHead icon={FiNavigation} title="User stories" desc="What your visitors expect to see and do on the site" />
      <InfoBox>
        <strong className="text-[--text]">What is a user story?</strong> A simple sentence describing what a visitor wants to do and why.
        Format: <em>"As a [type of user], I want to [do something], so that [I get a benefit]."</em>
      </InfoBox>
      <div className="mb-4">
        <FieldLabel>Quick-start templates — click any to add it</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {US_TEMPLATES.map(t => (
            <button key={t.label} type="button"
              className="px-3 py-1.5 rounded-full text-xs border border-dashed border-[--input-border] text-[--muted] bg-[--input-bg] hover:border-[--accent] hover:text-[--accent] transition-all duration-300 cursor-pointer"
              onClick={() => addStory(t.role, t.action, t.benefit)}
            >{t.label}</button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <FieldLabel req>Your user stories</FieldLabel>
        <Hint>Aim for at least one story per major page or feature.</Hint>
        <div className="mt-3 flex flex-col gap-3">
          {data.user_stories.map(s => (
            <div key={s.id} className="bg-[--foam] border border-[--border] rounded-2xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-1.5">As a…</div>
                  <input type="text" placeholder="visitor, customer, admin…" value={s.role}
                    onChange={e => updateStory(s.id, { role: e.target.value })} className="text-sm" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-1.5">I want to…</div>
                  <input type="text" placeholder="browse products, log in, book…" value={s.action}
                    onChange={e => updateStory(s.id, { action: e.target.value })} className="text-sm" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-1.5">So that… (optional)</div>
                  <input type="text" placeholder="I can save time, feel confident…" value={s.benefit}
                    onChange={e => updateStory(s.id, { benefit: e.target.value })} className="text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 bg-[--accent] bg-opacity-10 border border-[--accent] border-opacity-30 rounded-xl px-3 py-2 text-xs text-[--accent] italic min-h-[36px] leading-relaxed">
                  {(s.role || s.action) ? storyText(s) : 'Fill in the fields above to preview your story.'}
                </div>
                <select value={s.priority} onChange={e => updateStory(s.id, { priority: e.target.value as Story['priority'] })}
                  className="w-auto text-xs px-2 py-1.5 rounded-xl">
                  <option>Must have</option>
                  <option>Should have</option>
                  <option>Could have</option>
                </select>
                <button type="button" onClick={() => removeStory(s.id)}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl border border-[--border] text-[--muted] hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950 transition-all duration-200 cursor-pointer">
                  <FiX size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addStory()}
          className="mt-3 w-full flex items-center justify-center gap-2 border border-dashed border-[--input-border] rounded-2xl py-3 text-xs text-[--muted] hover:border-[--accent] hover:text-[--accent] transition-all duration-300 cursor-pointer bg-transparent">
          <FiPlus size={14} /> Add a user story
        </button>
      </div>
      <div className="mt-4">
        <FieldLabel>What should never happen from a user's perspective?</FieldLabel>
        <textarea rows={3} placeholder="e.g. users should never see someone else's private data, users should never hit a dead-end…" value={data.user_story_never} onChange={e => set('user_story_never', e.target.value)} />
      </div>
      <div className="mt-4">
        <FieldLabel>Any specific user journey to pay extra attention to?</FieldLabel>
        <textarea rows={3} placeholder="e.g. the path from landing page → product → checkout → confirmation should feel effortless" value={data.user_story_journey} onChange={e => set('user_story_journey', e.target.value)} />
      </div>
    </div>
  );

  /* Step 6 — Content & media */
  const step6 = (
    <div>
      <SectionHead icon={FiFileText} title="Content & media" desc="What goes on the site and who's supplying it" />
      <div className="mb-4">
        <FieldLabel>Who is writing the copy (text)?</FieldLabel>
        <div className="flex flex-col gap-2 mt-1">
          {[
            { v: "We'll provide all copy", sub: "You write it, we format it" },
            { v: 'We need copywriting help', sub: 'Add to project scope' },
            { v: 'Mix — some ready, need help with rest', sub: "We'll align on what's missing" }
          ].map(({ v, sub }) => (
            <RadioOpt key={v} name="copywriting" label={v} sub={sub} value={v}
              checked={data.copywriting === v} onChange={val => set('copywriting', val)} />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <FieldLabel>Who is providing images and photography?</FieldLabel>
        <div className="flex flex-col gap-2 mt-1">
          {[
            { v: 'We have our own', sub: "We'll supply files" },
            { v: 'Use stock photography', sub: 'Sourced by dev / designer' },
            { v: 'Mix', sub: 'Mix of the above' }
          ].map(({ v, sub }) => (
            <RadioOpt key={v} name="photography" label={v} sub={sub} value={v}
              checked={data.photography === v} onChange={val => set('photography', val)} />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <FieldLabel>Will the site have video content?</FieldLabel>
        <MultiChips field="video_content" options={['Hero/background video','Embedded YouTube/Vimeo','Self-hosted videos','No video']} />
      </div>
      <div className="mb-4">
        <FieldLabel>Do you need a CMS so you can update content yourself?</FieldLabel>
        <div className="flex flex-col gap-2 mt-1">
          {[
            { v: 'Yes — fully editable by client', sub: 'We want to update pages and blogs ourselves' },
            { v: 'Yes — just for blog / news', sub: undefined },
            { v: 'No — dev updates for us', sub: undefined }
          ].map(({ v, sub }) => (
            <RadioOpt key={v} name="cms" label={v} sub={sub} value={v}
              checked={data.cms === v} onChange={val => set('cms', val)} />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <FieldLabel>SEO requirements</FieldLabel>
        <MultiChips field="seo" options={['Basic SEO setup','Blog / content SEO','Local SEO','Technical SEO audit','Not a priority']} />
      </div>
      <div className="mb-4">
        <FieldLabel>Legal pages needed</FieldLabel>
        <MultiChips field="legal_pages" options={['Privacy policy','Terms of service','Cookie banner','GDPR compliance','Not sure']} />
      </div>
    </div>
  );

  /* Step 7 — Tech & hosting */
  const step7 = (
    <div>
      <SectionHead icon={FiServer} title="Tech, hosting & launch" desc="Infrastructure, go-live, and ongoing support" />
      <SubHead>Domain & hosting</SubHead>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <FieldLabel>Do you own a domain?</FieldLabel>
          <SingleChips field="domain_status" options={['Yes — already owned','No — need to buy one','Not sure']} />
        </div>
        <div>
          <FieldLabel>Domain name (if known)</FieldLabel>
          <input type="text" placeholder="example.com" value={data.domain_name} onChange={e => set('domain_name', e.target.value)} />
        </div>
      </div>
      <div className="mb-4">
        <FieldLabel>Preferred cloud / hosting platform</FieldLabel>
        <MultiChips field="hosting_platform" options={['Vercel','Netlify','AWS','Google Cloud','DigitalOcean','Shared hosting','No preference']} />
      </div>
      <SubHead>Technical preferences</SubHead>
      <div className="mb-4">
        <FieldLabel>Any preferred tech stack or CMS?</FieldLabel>
        <MultiChips field="tech_stack" options={['WordPress','Webflow','Shopify','Next.js','React','Vue / Nuxt','Laravel / PHP','No preference']} />
      </div>
      <div className="mb-4">
        <FieldLabel>Do you need a staging environment before going live?</FieldLabel>
        <SingleChips field="staging" options={['Yes — staging required','No — direct to production']} />
      </div>
      <SubHead>Security & compliance</SubHead>
      <div className="mb-4">
        <MultiChips field="security" options={['GDPR','HIPAA','PCI-DSS','2FA / MFA','Regular backups','Standard security']} />
      </div>
      <SubHead>Post-launch support</SubHead>
      <div className="mb-4">
        <MultiChips field="post_launch_support" options={['Monthly maintenance','Bug fixes only','Content updates','Training for our team','None needed']} />
      </div>
      <div className="mt-4">
        <FieldLabel>Anything else we should know?</FieldLabel>
        <textarea rows={3} placeholder="Constraints, existing relationships, decisions already made…" value={data.extra_notes} onChange={e => set('extra_notes', e.target.value)} />
      </div>
    </div>
  );

  /* Step 8 — Review */
  function SummarySection({ title, rows }: { title: string; rows: [string, string][] }) {
    return (
      <div className="bg-[--foam] border border-[--border] rounded-2xl p-5 mb-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[--muted] mb-3">{title}</div>
        {rows.filter(([, v]) => v && v !== '—').map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2 border-b border-[--border] last:border-0 text-xs">
            <span className="text-[--muted] whitespace-nowrap">{k}</span>
            <span className="text-[--text] font-medium text-right max-w-[60%] break-words">{escHtml(v)}</span>
          </div>
        ))}
      </div>
    );
  }

  const d = summaryData || collectData();

  const step8 = (
    <div>
      <SectionHead icon={FiCheck} title="Review & submit" desc="Check everything looks right before sending it over" />
      <SummarySection title="About you" rows={[
        ['Name', d.name], ['Email', d.email], ['Company', d.company], ['Industry', d.industry]
      ]} />
      <SummarySection title="Project overview" rows={[
        ['Type', d.project_type], ['Budget', d.budget], ['Launch date', d.launch_date], ['Goal', d.project_goal]
      ]} />
      <SummarySection title="Target audience" rows={[
        ['Device focus', d.device_focus], ['Geography', d.geography.join(', ')],
        ['Languages', d.languages], ['Accessibility', d.accessibility]
      ]} />
      <SummarySection title="Design & branding" rows={[
        ['Brand assets', d.brand_assets.join(', ')], ['Tone', d.design_tone.join(', ')],
        ['Dark mode', d.dark_mode], ['Page count', d.page_count_estimate]
      ]} />
      <SummarySection title="Features" rows={[
        ['Core features', d.core_features.join(', ')], ['E-commerce', d.ecommerce.join(', ')],
        ['Integrations', d.integrations.join(', ')], ['Mobile app', d.mobile_app]
      ]} />
      <SummarySection title="User stories" rows={[
        ...d.user_stories.map((s, i): [string, string] => [
          `Story ${i + 1} [${s.priority}]`, storyText(s)
        ]),
        ['Never do', d.user_story_never],
        ['Key journey', d.user_story_journey]
      ]} />
      <SummarySection title="Content & media" rows={[
        ['Copywriting', d.copywriting], ['Photography', d.photography],
        ['CMS', d.cms], ['SEO', d.seo.join(', ')]
      ]} />
      <SummarySection title="Tech & hosting" rows={[
        ['Domain', `${d.domain_status}${d.domain_name ? ' — ' + d.domain_name : ''}`],
        ['Hosting', d.hosting_platform.join(', ')], ['Tech stack', d.tech_stack.join(', ')],
        ['Security', d.security.join(', ')], ['Post-launch', d.post_launch_support.join(', ')]
      ]} />
      <div className="flex flex-wrap gap-3 mt-5">
        <button type="button" onClick={copyText}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[--border] bg-[--surface] text-[--muted] text-xs font-medium hover:text-[--text] hover:border-[--accent-soft] transition-all duration-300 cursor-pointer">
          <FiCopy size={13} /> Copy as text
        </button>
        <button type="button" onClick={copyJson}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[--border] bg-[--surface] text-[--muted] text-xs font-medium hover:text-[--text] hover:border-[--accent-soft] transition-all duration-300 cursor-pointer">
          <FiCode size={13} /> Copy as JSON
        </button>
      </div>
    </div>
  );

  const STEPS = [step0, step1, step2, step3, step4, step5, step6, step7, step8];

  /* ── Render ── */
  return (
    <div className="page-shell">
      {/* Header copy */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-8 max-w-2xl"
      >
        <p className="eyebrow">New project</p>
        <h1 className="mb-3">Project intake form</h1>
        <p className="text-[--muted-soft] text-sm leading-relaxed">
          Fill this out so we can bring your vision to life. No jargon needed — just answer as best you can.
          Your progress saves automatically.
        </p>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
        className="order-slip card max-w-3xl p-6 sm:p-8"
      >
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-[--muted]">Step {step + 1} of {TOTAL} — <strong className="text-[--text]">{STEP_TITLES[step]}</strong></span>
            <span className="font-semibold text-[--accent]">{pct}%</span>
          </div>
          <div className="h-1.5 bg-[--border] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[--accent] rounded-full"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Step pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {STEP_TITLES.map((title, i) => (
            <button
              key={i}
              type="button"
              onClick={() => i < step ? goTo(i) : undefined}
              className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-300 ${
                i === step
                  ? 'bg-[--accent] border-[--accent] text-[--bg]'
                  : i < step
                  ? 'bg-[--foam] border-[--accent-soft] text-[--accent] cursor-pointer hover:opacity-80'
                  : 'border-[--border] text-[--muted] cursor-default'
              }`}
            >
              {i + 1} · {title.split(' ')[0]}
            </button>
          ))}
        </div>

        <hr className="border-[--border] mb-6" />

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {STEPS[step]}
          </motion.div>
        </AnimatePresence>

        {/* Footer nav */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-[--border]">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => step > 0 && goTo(step - 1)}
            className="px-5 py-2 rounded-full border border-[--border] bg-[--surface] text-[--muted] text-sm font-medium hover:text-[--text] hover:border-[--accent-soft] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
          >
            ← Back
          </button>
          <span className="text-xs text-[--muted]">Step {step + 1} of {TOTAL}</span>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              if (step < TOTAL - 1) {
                if (step === TOTAL - 2) buildSummaryRef.current?.();
                goTo(step + 1);
              } else {
                submitForm();
              }
            }}
            className="px-6 py-2 rounded-full bg-[--accent] text-[--bg] text-sm font-semibold border-none hover:bg-[--accent-strong] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_8px_24px_rgba(35,25,18,0.18)] hover:shadow-[0_10px_28px_rgba(35,25,18,0.22)] cursor-pointer"
          >
            {submitting ? 'Submitting…' : step === TOTAL - 1 ? 'Submit ✓' : 'Continue →'}
          </button>
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 bg-[--text] text-[--bg] px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
