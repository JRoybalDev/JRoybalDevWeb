import { TbCoffee } from "react-icons/tb";
import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

function Navbar() {
    const [isDark, setIsDark] = useState(() =>
        typeof document !== 'undefined' ? document.documentElement.classList.contains("dark") : false
    );

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

    return (
        <div className='flex justify-between px-[2rem] bg-[--bg-alt] w-full h-12 shadow-md border-b border-[--border]'>
            <div className='flex items-center gap-2'>
                <TbCoffee  className="w-8 h-8"/>
                <h1 className="text-lg font-bold">JRoybalDev</h1>
            </div>
            <div className="nav-links flex items-center gap-4">
                {navLinks.map((link, index) => (
                    <NavLink
                        className={({ isActive }) =>
                            `text-sm transition-colors duration-300 cursor-pointer ${
                                isActive ? "text-[--accent] font-medium" : "text-[--text] hover:text-[--accent-strong]"
                            }`
                        }
                        key={index}
                        end={link.link === "/"}
                        to={link.link}>
                        {link.title}
                    </NavLink>
                ))}
            </div>
            <div className="flex items-center">
                {/* Light/Dark Mode switch */}
                <div
                    onClick={toggleTheme}
                    className="relative flex items-center cursor-pointer gap-2 px-3 py-1 rounded-full border-[0.5px] border-[--border] bg-[--switch-bg] text-xs font-bold  tracking-wider text-[--text] overflow-hidden"
                >
                    {/* Foam Bubble Fill Effect */}
                    <motion.div
                        initial={false}
                        animate={{
                            y: isDark ? "100%" : "0%",
                            scale: isDark ? 0.8 : 1.2
                        }}
                        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
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
            </div>
        </div>
    )
}

export default Navbar
