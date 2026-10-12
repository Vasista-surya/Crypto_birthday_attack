import { ReactNode, useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Module {
  path: string;
  label: string;
  icon: string;
}

interface LayoutProps {
  modules: Module[];
  children: ReactNode;
}

export function Layout({ modules, children }: LayoutProps) {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentModule = modules.find(m => location.pathname.startsWith(m.path)) || modules[0];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark' : 'light'}`}>
      {/* Theme toggle and mobile menu button */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-ink-950/80 backdrop-blur-md border-b border-ink-800 dark:border-ink-800 light:border-ink-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-teal-400" aria-label="Birthday Attack Lab Home">
              <span className="text-2xl">🎂</span>
              <span className="hidden sm:block">Birthday Attack Lab</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {modules.map((module) => (
                <NavLink
                  key={module.path}
                  to={module.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-900/30 text-teal-300 border border-teal-800'
                        : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800'
                    }`
                  }
                  aria-current={location.pathname.startsWith(module.path) ? 'page' : undefined}
                >
                  <span aria-hidden="true">{module.icon}</span>
                  <span>{module.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 transition-colors"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-ink-800 px-4 py-3"
            >
              <nav className="flex flex-col gap-1" role="navigation" aria-label="Mobile navigation">
                {modules.map((module) => (
                  <NavLink
                    key={module.path}
                    to={module.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        isActive
                          ? 'bg-teal-900/30 text-teal-300 border border-teal-800'
                          : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800'
                      }`
                    }
                    aria-current={location.pathname.startsWith(module.path) ? 'page' : undefined}
                  >
                    <span aria-hidden="true">{module.icon}</span>
                    <span>{module.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Progress indicator */}
      <div className="hidden md:block h-1 bg-ink-800 relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-teal-500"
          style={{
            width: `${((modules.findIndex(m => location.pathname.startsWith(m.path)) + 1) / modules.length) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main content */}
      <main className="pt-14 pb-12 px-4" role="main">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Module header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl" aria-hidden="true">{currentModule.icon}</span>
                  <h1 className="text-2xl font-bold text-ink-100">{currentModule.label}</h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-ink-500">
                  <span>Module {modules.findIndex(m => m.path === currentModule.path) + 1} of {modules.length}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Learning Path: Learn → Experiment → Analyse → Apply → Review</span>
                </div>
              </div>

              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-ink-500">
          <p>Birthday Attack Lab — Educational Cryptography Laboratory</p>
          <p className="mt-1">
            Demonstrates collisions in <strong>truncated SHA-256 only</strong>. Full SHA-256 remains secure.
          </p>
        </div>
      </footer>
    </div>
  );
}