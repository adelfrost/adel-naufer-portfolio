import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { NAV_LINKS } from '../data/content';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 z-40 w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#home" className="font-display text-base sm:text-lg font-extrabold tracking-tight text-white select-none">
            AN<span className="text-white/40">.</span>
          </a>

          {/* Center pill nav — desktop */}
          <ul className="glass hidden md:flex items-center gap-1 rounded-full px-2 py-1.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="block rounded-full px-4 py-2 font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right — My Journey (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <a
              href="#journey"
              className="glass hidden md:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              My Journey
            </a>

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="glass md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-md md:hidden"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <span className="font-display text-lg font-extrabold tracking-tight">AN.</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="glass inline-flex h-11 w-11 items-center justify-center rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex flex-1 flex-col justify-center gap-2 px-6">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 font-display text-4xl font-extrabold tracking-tight text-white"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * NAV_LINKS.length + 0.1 }}
                className="mt-6"
              >
                <a
                  href="#journey"
                  onClick={() => setOpen(false)}
                  className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-medium"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  My Journey
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
