"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Github, Linkedin, Mail, ArrowUp, Moon, Sun } from 'lucide-react';

const Portfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const headerRef = useRef(null);
  const mainRef = useRef(null);

  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ];

  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'Built with Next.js and TypeScript',
      tags: ['Next.js', 'TypeScript', 'Tailwind']
    },
    {
      title: 'Task Management App',
      description: 'React-based productivity tool',
      tags: ['React', 'Redux', 'Firebase']
    },
    {
      title: 'Portfolio Website',
      description: 'Minimalist design with animations',
      tags: ['React', 'GSAP', 'Tailwind']
    }
  ];

  useEffect(() => {
    // Check system preference initially
    if (typeof window !== 'undefined') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
    }

    // Handle scroll events for scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <a href="#home" className="text-2xl font-bold">
                Portfolio
              </a>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                      activeSection === section.id ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {section.label}
                  </a>
                ))}
                
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden absolute w-full bg-white dark:bg-neutral-900 transition-colors duration-300">
              <div className="px-4 py-2 space-y-2">
                {sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {section.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="pt-20">
          {/* Hero Section */}
          <section id="home" className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-6">
              <h1 className="text-6xl font-bold">
                Hello, I'm <span className="text-blue-600 dark:text-blue-400">John Doe</span>
              </h1>
              <p className="text-xl text-neutral-600 dark:text-neutral-400">
                Full Stack Developer
              </p>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="min-h-screen flex items-center">
            <div className="max-w-4xl mx-auto px-4 space-y-8">
              <h2 className="text-4xl font-bold">About Me</h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                I'm a passionate developer with expertise in modern web technologies.
                I focus on creating clean, efficient, and user-friendly applications
                that solve real-world problems.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <h3 className="font-bold">Frontend</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">React, Next.js</p>
                </div>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <h3 className="font-bold">Backend</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Node.js, Python</p>
                </div>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <h3 className="font-bold">Database</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">MongoDB, PostgreSQL</p>
                </div>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <h3 className="font-bold">Tools</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Git, Docker</p>
                </div>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="min-h-screen py-20">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold mb-12">Projects</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <div
                    key={index}
                    className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg hover:transform hover:-translate-y-2 transition-transform"
                  >
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="min-h-screen flex items-center">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
              <h2 className="text-4xl font-bold">Get in Touch</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                I'm always open to new opportunities and collaborations.
              </p>
              <div className="flex justify-center space-x-6">
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Github size={24} />
                </a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Linkedin size={24} />
                </a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Mail size={24} />
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      </div>
    </div>
  );
};

export default Portfolio;