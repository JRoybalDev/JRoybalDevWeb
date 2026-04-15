import { TbCoffee } from "react-icons/tb";
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import { CgMenuRightAlt, CgClose } from "react-icons/cg";

const ThemeToggle = ({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) => (
    <div
        onClick={toggleTheme}
        className="relative flex items-center cursor-pointer gap-2 px-3 py-1 rounded-full border-[0.5px] border-[--border] bg-[--switch-bg] text-sm font-bold tracking-wider text-[--text] overflow-hidden"
    >
        <motion.div
            initial={false}
            animate={{
                y: isDark ? "100%" : "0%",
                opacity: isDark ? 0 : 1,
            }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-white/60 z-0 pointer-events-none"
        />
        <div className="relative w-8 h-4 rounded-full bg-[--bg] flex items-center p-0.5 z-10">
            <motion.div
                initial={false}
                animate={{
                    x: isDark ? 16 : 0,
                    scale: isDark ? 0.9 : 1.1,
                    borderRadius: isDark ? "50%" : "40% 60% 50% 50%"
                }}
                transition={{
                    duration: 1,
                    ease: [0.22, 1, 0.36, 1]
                }}
                className="w-3 h-3 bg-[--accent] shadow-sm"
            />
        </div>
        <span className="relative z-10 w-10 text-center select-none transition-colors duration-[1000ms] ease-coffee">
            {isDark ? "Dark" : "Light"}
        </span>
    </div>
);

function Navbar() {
    const [isDark, setIsDark] = useState(() =>
        typeof document !== 'undefined' ? document.documentElement.classList.contains("dark") : false
    );
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { title: "Home", link: "/" },
        { title: "About", link: "/about" },
        { title: "Projects", link: "/projects" },
        { title: "Experience", link: "/experience" },
        { title: "Resume", link: "/resume" },
        { title: "Contact", link: "/contact" }
    ]

    // Sync state if system preference or other logic changes the class
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        document.documentElement.classList.toggle("dark", newDark);
        localStorage.setItem("theme", newDark ? "dark" : "light");
        setIsDark(newDark);
    };

    return (
        <>
            <nav className='flex justify-between items-center px-[2rem] bg-[--bg-alt] w-full h-14 shadow-md border-b border-[--border] z-50 relative transition-colors duration-[1000ms] ease-coffee'>
                {/* Left Section */}
                <div className='flex items-center gap-2'>
                    <TbCoffee className="w-10 h-10" />
                    <NavLink to={"/"} className="text-xl font-bold">JRoybalDev</NavLink>
                </div>

                {/* Center Section (Desktop Only) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
                    {navLinks.map((link, index) => (
                        <NavLink
                            key={index}
                            end={link.link === "/"}
                            to={link.link}>
                            {({ isActive }) => (
                                <motion.span
                                    className={`${isActive && "font-medium"}`}
                                    style={{ display: "inline-block" }}
                                    animate={{
                                        color: isActive ? "var(--accent)" : "var(--text)",
                                        y: isActive ? -1 : 0,
                                        scale: isActive ? 1.1 : 1,
                                        opacity: isActive ? 1 : 0.8,
                                    }}
                                    whileHover={!isActive ? {
                                        color: "var(--accent-strong)",
                                        scale: 1.02,
                                        opacity: 1,
                                    } : {}}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                >
                                    {link.title}
                                </motion.span>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
                    </div>
                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-2xl text-[--text] z-50"
                    >
                        {isOpen ? <CgClose /> : <CgMenuRightAlt />}
                    </button>
                </div>
            </nav>

            {/* Mobile Popup Modal Redesign */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop Blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-colors duration-[1000ms] ease-coffee"
                        />

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                            className="fixed inset-x-0 bottom-0 top-12 bg-[--bg] z-40 flex flex-col md:hidden shadow-2xl overflow-hidden border-t border-[--border] transition-colors duration-[1000ms] ease-coffee"
                        >
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 1,
                                            delay: index * 0.1,
                                            ease: [0.4, 0, 0.2, 1]
                                        }}
                                        className="w-full text-center"
                                    >
                                        <NavLink
                                            onClick={() => setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `block py-4 text-2xl tracking-tight transition-all duration-[1000ms] ease-coffee`
                                            }
                                            end={link.link === "/"}
                                            to={link.link}>
                                            {({ isActive }) => (
                                                <motion.span
                                                    style={{ display: "inline-block" }}
                                                    animate={{
                                                        color: isActive ? "var(--accent)" : "var(--text)",
                                                        scale: isActive ? 1.1 : 1,
                                                        opacity: isActive ? 1 : 0.8,
                                                    }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                >
                                                    {link.title}
                                                </motion.span>
                                            )}
                                        </NavLink>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="p-10 mb-8 border-t border-[--border] bg-[--bg-alt]/30 flex flex-col items-center gap-4">
                                <p className="text-[--muted] text-xs font-semibold uppercase tracking-[0.2em]">Appearance</p>
                                <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navbar;
