import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        document.documentElement.classList.contains('dark') ||
        localStorage.theme === 'dark'
      );
    }

    return false;
  });

  // Dark mode-এর পরিবর্তন লক্ষ্য করবে
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // অন্য page-এ গেলে mobile menu বন্ধ হবে
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Scroll করলে mobile menu বন্ধ হবে
  useEffect(() => {
    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Members', path: '/members' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
  ];

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-4 transition-all duration-300 sm:px-6">
      <nav className="relative mx-auto max-w-6xl rounded-full border border-gray-200 bg-white/95 py-1.5 shadow-lg backdrop-blur-md transition-all duration-300 dark:border-gray-800 dark:bg-black/95 sm:py-2">
        <div className="mx-auto flex items-center justify-between px-4 sm:px-6">
          
          {/* Club Name */}
          <Link
            to="/"
            aria-label="গোমগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ - হোম"
            className="group flex min-w-0 items-center"
          >
            <p
              className="
                bg-gradient-to-r
                from-indigo-600 via-violet-600 to-cyan-600
                bg-clip-text
                py-1.5
                font-bangla
                text-xl
                font-black
                leading-relaxed
                tracking-[-0.02em]
                text-transparent
                drop-shadow-[0_2px_8px_rgba(124,58,237,0.18)]
                transition-all
                duration-300
                group-hover:brightness-110
                sm:text-2xl
                xl:text-3xl
                dark:from-indigo-300
                dark:via-violet-300
                dark:to-cyan-300
                dark:drop-shadow-[0_2px_10px_rgba(103,232,249,0.18)]
              "
            >
              গোমগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ
            </p>
          </Link>

          {/* Desktop Navigation */}
          <div className="mx-4 hidden flex-1 items-center justify-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="
                  relative
                  rounded-xl
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-gray-600
                  transition-colors
                  duration-200
                  hover:text-gray-900
                  dark:text-[#C5CCE0]
                  dark:hover:text-[#F7F7FB]
                "
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Dark Mode Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="
                rounded-xl
                bg-gray-100
                p-2
                text-gray-600
                transition-colors
                duration-200
                hover:bg-gray-200
                hover:text-[#7C3AED]
                dark:bg-[#1A2140]
                dark:text-[#C5CCE0]
                dark:hover:bg-[#2C355D]
                dark:hover:text-[#F7F7FB]
              "
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {/* Mobile Menu */}
            <div className="relative lg:hidden">
              <motion.button
                type="button"
                onClick={() => setIsOpen((previous) => !previous)}
                whileTap={{ scale: 0.88 }}
                animate={{
                  rotate: isOpen ? 90 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 22,
                }}
                className="
                  rounded-xl
                  bg-gray-100
                  p-2
                  text-gray-600
                  transition-colors
                  duration-200
                  hover:bg-gray-200
                  hover:text-gray-900
                  dark:bg-[#1A2140]
                  dark:text-[#C5CCE0]
                  dark:hover:bg-[#2C355D]
                  dark:hover:text-[#F7F7FB]
                "
                aria-label="Toggle Navigation Menu"
                aria-expanded={isOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.span
                      key="close"
                      initial={{
                        opacity: 0,
                        scale: 0.5,
                        rotate: -90,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.5,
                        rotate: 90,
                      }}
                      transition={{ duration: 0.18 }}
                      className="block"
                    >
                      <X className="h-5 w-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{
                        opacity: 0,
                        scale: 0.5,
                        rotate: 90,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.5,
                        rotate: -90,
                      }}
                      transition={{ duration: 0.18 }}
                      className="block"
                    >
                      <Menu className="h-5 w-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Animated Mobile Dropdown */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      y: -15,
                      transformOrigin: 'top right',
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      y: -15,
                    }}
                    transition={{
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                      absolute
                      right-0
                      top-full
                      z-50
                      mt-3
                      w-44
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      p-2
                      shadow-2xl
                      dark:border-gray-800
                      dark:bg-black
                    "
                  >
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            staggerChildren: 0.07,
                            delayChildren: 0.05,
                          },
                        },
                      }}
                      className="space-y-1"
                    >
                      {navLinks.map((link, index) => (
                        <motion.div
                          key={link.name}
                          variants={{
                            hidden: {
                              opacity: 0,
                              x: 40,
                              rotateY: -15,
                            },
                            visible: {
                              opacity: 1,
                              x: 0,
                              rotateY: 0,
                              transition: {
                                duration: 0.38,
                                ease: [0.22, 1, 0.36, 1],
                              },
                            },
                          }}
                          whileTap={{
                            scale: 0.95,
                            x: 4,
                          }}
                          custom={index}
                        >
                          <Link
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="
                              block
                              rounded-xl
                              px-4
                              py-2.5
                              text-sm
                              font-medium
                              text-gray-600
                              transition-colors
                              duration-200
                              hover:text-gray-900
                              dark:text-[#C5CCE0]
                              dark:hover:text-[#F7F7FB]
                            "
                          >
                            {link.name}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};