import { TbCoffee } from "react-icons/tb";
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import { CgMenuRightAlt, CgClose } from "react-icons/cg";


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
        setIsDark(newDark);
    };

    const ThemeToggle = () => (
        <div
            onClick={toggleTheme}
            className="relative flex items-center cursor-pointer gap-2 px-3 py-1 rounded-full border-[0.5px] border-[--border] bg-[--switch-bg] text-xs font-bold tracking-wider text-[--text] overflow-hidden"
        >
            <motion.div
                initial={false}
                animate={{
                    y: isDark ? "100%" : "0%",
                    scale: isDark ? 0.8 : 1.2
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-[--foam] opacity-40 z-0 pointer-events-none"
            />
            <div className="relative w-8 h-4 rounded-full bg-[--bg] flex items-center p-0.5 z-10">
                <motion.div
                    animate={{
                        x: isDark ? 16 : 0,
                        scale: isDark ? 0.9 : 1.1,
                        borderRadius: isDark ? "50%" : "40% 60% 50% 50%"
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        borderRadius: { duration: 0.3 }
                    }}
                    className="w-3 h-3 bg-[--accent] shadow-sm"
                />
            </div>
            <span className="relative z-10 w-10 text-center select-none">
                {isDark ? "Dark" : "Light"}
            </span>
        </div>
    );

    return (
        <>
            <nav className='flex justify-between items-center px-[2rem] bg-[--bg-alt] w-full h-12 shadow-md border-b border-[--border] z-50 relative'>
                {/* Left Section */}
                <div className='flex items-center gap-2'>
                    <TbCoffee className="w-8 h-8" />
                    <h1 className="text-lg font-bold">JRoybalDev</h1>
                </div>

                {/* Center Section (Desktop Only) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
                    {navLinks.map((link, index) => (
                        <NavLink
                            className={({ isActive }) =>
                                `text-sm transition-colors duration-300 cursor-pointer ${isActive ? "text-[--accent] font-medium" : "text-[--text] hover:text-[--accent-strong]"
                                }`
                            }
                            key={index}
                            end={link.link === "/"}
                            to={link.link}>
                            {link.title}
                        </NavLink>
                    ))}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <ThemeToggle />
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
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                        />
                        
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-x-0 bottom-0 top-12 bg-[--bg] z-40 flex flex-col md:hidden shadow-2xl overflow-hidden border-t border-[--border]"
                        >
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="w-full text-center"
                                    >
                                        <NavLink
                                            onClick={() => setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `block py-4 text-2xl tracking-tight transition-all duration-300 ${
                                                    isActive 
                                                        ? "text-[--accent] font-bold scale-110" 
                                                        : "text-[--text] opacity-80 hover:text-[--accent-strong]"
                                                }`
                                            }
                                            end={link.link === "/"}
                                            to={link.link}>
                                            {link.title}
                                        </NavLink>
                                    </motion.div>
                                ))}
                            </div>
                            
                            <div className="p-10 mb-8 border-t border-[--border] bg-[--bg-alt]/30 flex flex-col items-center gap-4">
                                <p className="text-[--muted] text-xs font-semibold uppercase tracking-[0.2em]">Appearance</p>
                                <ThemeToggle />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navbar;
