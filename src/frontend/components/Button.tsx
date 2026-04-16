import React from 'react'
import { FaArrowRight } from 'react-icons/fa'

interface ButtonProps {
  mode: 'primary' | 'secondary'
  label: string
  showArrow?: boolean
  onClick?: () => void
}

function Button({ mode, label, showArrow = false, onClick }: ButtonProps) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-[1000ms] ease-coffee hover:-translate-y-px hover:duration-400'

  const styles = {
    primary: `
      border-none
      bg-[--accent]
      text-[--bg]
      shadow-[0_18px_45px_rgba(35,25,18,0.18)]
      hover:bg-[var(--accent-strong)]
      hover:shadow-[0_20px_50px_rgba(35,25,18,0.22)]
    `,
    secondary: `
      border border-[var(--border)]
      bg-transparent
      text-[var(--text)]
      hover:border-[var(--accent-strong)]
      hover:text-[var(--accent-strong)]
    `,
  }

  return (
    <button className={`${base} ${styles[mode]}`} onClick={onClick}>
      {label}
      {showArrow && <FaArrowRight size={12} />}
    </button>
  )
}

export default Button