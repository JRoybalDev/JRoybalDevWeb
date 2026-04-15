import React from 'react'
import { FaGithub, FaLinkedin, FaInstagram, FaMailBulk, FaEnvelope } from 'react-icons/fa'
import { Link } from 'react-router-dom'

interface SocialLink {
    title: string
    link: string
    icon: React.ReactNode
}

const ICON_SIZE = 20

const socialLinks: SocialLink[] = [
    { title: 'GitHub', link: 'https://github.com/jroybaldev', icon: <FaGithub size={ICON_SIZE} /> },
    { title: 'LinkedIn', link: 'https://linkedin.com/in/jroybaldev', icon: <FaLinkedin size={ICON_SIZE} /> },
    { title: 'Instagram', link: 'https://instagram.com/jroybaldev', icon: <FaInstagram size={ICON_SIZE} /> },
    { title: 'Email', link: '/contact', icon: <FaEnvelope size={ICON_SIZE} /> }
]

function Footer() {
    return (
        <footer className="site-footer">
            <span className="footer-copy">
                © JRoybalDev {new Date().getFullYear()}. All rights reserved.
            </span>

            <div className="footer-socials">
                {socialLinks.map(({ title, link, icon }) => {
                    const isInternal = link.startsWith('/');

                    if (isInternal) {
                        return (
                            <Link
                                key={title}
                                to={link}
                                aria-label={title}
                                className="footer-social-link"
                            >
                                {icon}
                            </Link>
                        )
                    }

                    return (
                        <a
                            key={title}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={title}
                            className="footer-social-link"
                        >
                            {icon}
                        </a>
                    )
                })}
            </div>
        </footer>
    )
}

export default Footer