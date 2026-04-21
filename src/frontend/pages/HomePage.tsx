import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";
import CoffeeShopScene from "@frontend/components/CoffeeShopScene";
import Button from "@frontend/components/Button";
import HeroCard from "@frontend/components/HeroCard";
import { FiCode, FiBriefcase, FiTarget } from 'react-icons/fi'
import ServiceCard from '@frontend/components/ServiceCard'
import type { IconType } from 'react-icons'
import ProjectCard from "@frontend/components/ProjectCard";

interface Service {
  icon: IconType
  title: string
  description: string
}

const services: Service[] = [
  {
    icon: FiCode,
    title: 'Full-stack Contracts',
    description: 'End-to-end web development, APIs, and deployment. House blend quality.',
  },
  {
    icon: FiBriefcase,
    title: 'Professional Freelancing',
    description: 'Focused execution on defined scopes. Your signature brew, delivered.',
  },
  {
    icon: FiTarget,
    title: 'Consulting',
    description: 'Architecture reviews, tech strategy, team mentoring. Expert roast.',
  },
]


export interface Project {
  thumbnail?: string
  name: string
  description: string
  tags: string[]
  category: string
  github_url?: string
  live_url?: string
}

export const projects: Project[] = [
  {
    name: 'African Marine Conservation Organization',
    description: 'Organization website for the African Marine Conservation Organization (AMCO), a non-profit organization, based in Cameroon.',
    tags: ['Next.JS', 'TypeScrpt', 'Sanity', 'Tailwind CSS', 'Figma'],
    category: 'Full-stack Contract',
    live_url: 'https://ammco.org',
  },
  {
    name: 'PortalX Dashboard',
    description: 'Internal analytics dashboard with real-time data and role-based access.',
    tags: ['Next.js', 'TypeScript', 'Prisma'],
    category: 'Freelance',
    github_url: 'https://github.com/jroybaldev/portalx',
  },
  {
    name: 'TechStart Consulting',
    description: 'Architecture review and cloud migration strategy for a Series A startup.',
    tags: ['AWS', 'Docker', 'CI/CD'],
    category: 'Consulting',
    live_url: 'https://techstart.io',
  },
]

const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

function buildHeaders() {
  return { "Content-Type": "application/json" };
}

function extractMessage(response: Response) {
  return response.json().then((data) => data?.error ?? "Something went wrong.");
}

function getAuthUrl(provider: string) {
  return `${apiBase}/api/auth/oauth/${provider}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitLabel = useMemo(() => (mode === "signin" ? "Sign In" : "Create Account"), [mode]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(),
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorMessage = await extractMessage(response);
      setMessage(errorMessage);
      setIsLoading(false);
      return;
    }

    await response.json();
    await refreshUser();
    setEmail("");
    setPassword("");
    setMessage(null);
    setIsLoading(false);
    navigate("/dashboard");
  }

  const handleViewMyWork = () => {
    navigate("/projects");
  };

  const handleLetMeTalk = () => {
    navigate("/contact");
  };

  return (
    <div className="">
      {/* Coffee Shop Animation */}
      <CoffeeShopScene />

      {/* Hero & Hero Card Section */}
      <div className="flex flex-col md:flex-row gap-12 justify-center items-center mb-16 mt-12 page-shell">
        {/* Left: Hero copy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center md:text-left w-fit"
        >
          <div className="hero-eyebrow font-bold text-xs uppercase tracking-[0.2em] text-[--accent] mb-4">
            Full-stack · Freelance · Consulting
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[--text] mb-4 leading-[1.1] tracking-tight max-w-2xl mx-auto md:mx-0">
            Crafted full-stack solutions — rich, smooth, and delivered.
          </h1>
          <p className="hero-sub text-md md:text-lg text-[--muted-soft] mb-8 max-w-lg mx-auto md:mx-0">
            JRoybalDev brews professional web products for clients who need results.
            From solo contracts to full consulting engagements.
          </p>
          <div className="hero-btns flex gap-3 flex-wrap justify-center md:justify-start">
            <Button mode="primary" label="View my work" onClick={handleViewMyWork} />
            <Button mode="secondary" label="Let's talk" showArrow onClick={handleLetMeTalk} />
          </div>
        </motion.div>

        {/* Right: Stats card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-[360px]"
        >
          <HeroCard />
        </motion.div>
      </div>

      {/* Services Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-10 border-t border-[--border]"
      >
        <div className="page-shell flex flex-col">
          <p className="eyebrow">What I brew</p>
          <h2 className="mb-8 font-medium">Services</h2>
          <div className="feature-grid">
            {services.map((service) => (
              <ServiceCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Projects Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="pt-10 border-t border-[--border]"
      >
        <div className="page-shell flex flex-col">
          <p className="eyebrow">Featured Work</p>
          <h2 className="mb-8 font-medium">Recent Projects</h2>
          <div className="feature-grid">
            {projects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Contact Callout */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className=""
      >
        <div className="page-shell">
          <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:justify-between border-2 border-[--border] p-8 rounded-3xl text-center md:text-start md:w-full">
            <div className="flex flex-col gap-2 md:gap-0">
              <h2 className="eyebrow">Ready to brew your next project?</h2>
              <p className="">Let's make your next project rich, smooth, and on time.
              </p>
            </div>
            <Button mode="primary" label="Get in touch" onClick={handleLetMeTalk} />
          </div>
        </div>
      </motion.section>
    </div>
  );
}
