"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Github, Linkedin, Mail, ArrowUp, Moon, Sun, Star, GithubIcon, Loader, FileUser } from 'lucide-react';
import InteractiveParticleText from './InteractiveParticleText';
import { fetchGitHubProjects } from '../utils/github';

interface GitHubProject {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  topics: string[];
  fork: boolean;
}

interface Contribution {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  topics: string[];
  originalRepo: string;
}

const Portfolio = () => {
  useEffect(() => {
    // This effect runs only on the client, after hydration
    document.body.removeAttribute('cz-shortcut-listen');
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [githubProjects, setGithubProjects] = useState<GitHubProject[]>([]);
  const [githubContributions, setGithubContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef(null);
  const mainRef = useRef(null);

  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'contributions', label: 'Contributions' },
    { id: 'contact', label: 'Contact' }
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const username = 'joswin18';
    setIsLoading(true);
    setError(null);
    fetchGitHubProjects(username)
      .then(({ projects, contributions }) => {
        console.log('Fetched projects:', projects);
        setGithubProjects(projects);
        setGithubContributions(contributions);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching GitHub data:', err);
        setError('Failed to load GitHub data. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const ProjectCard = ({ project }: { project: GitHubProject }) => (
    <div
      key={project.id}
      className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg hover:shadow-lg transition-all duration-300"
    >
      <h3 className="text-xl font-bold mb-2">{project.name}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-4">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.topics.map((topic, topicIndex) => (
          <span
            key={topicIndex}
            className="px-2 py-1 bg-red-500/10 text-red-500 dark:bg-violet-500/10 dark:text-violet-500 rounded-full text-sm"
          >
            {topic}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <a 
          href={project.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-neutral-700 dark:text-neutral-300 hover:text-red-500 dark:hover:text-violet-500 transition-colors"
        >
          <GithubIcon size={20} className="mr-2" />
          View on GitHub
        </a>
        <div className="flex items-center">
          <Star size={16} className="text-yellow-400 mr-1" />
          <span className="text-sm font-medium">{project.stars}</span>
        </div>
      </div>
      {project.language && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Main Language:</h4>
          <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded-full text-xs">
            {project.language}
          </span>
        </div>
      )}
    </div>
  );

  const ContributionCard = ({ contribution }: { contribution: Contribution }) => (
    <div
      key={contribution.id}
      className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg hover:shadow-lg transition-all duration-300"
    >
      <h3 className="text-xl font-bold mb-2">{contribution.name}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-4">{contribution.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {contribution.topics.map((topic, topicIndex) => (
          <span
            key={topicIndex}
            className="px-2 py-1 bg-red-500/10 text-red-500 dark:bg-violet-500/10 dark:text-violet-500 rounded-full text-sm"
          >
            {topic}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <a 
          href={contribution.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-neutral-700 dark:text-neutral-300 hover:text-red-500 dark:hover:text-violet-500 transition-colors"
        >
          <GithubIcon size={20} className="mr-2" />
          View Pull Request
        </a>
        <div className="flex items-center">
          <Star size={16} className="text-yellow-400 mr-1" />
          <span className="text-sm font-medium">{contribution.stars}</span>
        </div>
      </div>
      {contribution.language && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Main Language:</h4>
          <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded-full text-xs">
            {contribution.language}
          </span>
        </div>
      )}
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Original Repository:</h4>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {contribution.originalRepo}
        </span>
      </div>
    </div>
  );

  return (
    <>
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
            <a href="#home" className="text-2xl">
            <FileUser size={32} className="text-red-500 dark:text-violet-300" />
              </a>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`hover:text-red-500 dark:hover:text-violet-500 transition-colors ${
                      activeSection === section.id ? 'text-red-500 dark:text-violet-500' : ''
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
                    className="block py-2 hover:text-red-500 dark:hover:text-violet-500 transition-colors"
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
        <main className="pt-16">
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <div className="relative h-[400px] w-full flex items-center justify-center pt-24">
                <InteractiveParticleText text="Joswin P Satheesh" isDarkMode={isDark} key={isDark.toString()} />
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="min-h-[calc(100vh-400px)] flex items-center py-16">
            <div className="max-w-6xl mx-auto px-4 space-y-8">
              <h2 className="text-4xl font-bold">About Me</h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                I'm a passionate developer with expertise in modern web technologies.
                I focus on creating clean, efficient, and user-friendly applications
                that solve real-world problems.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <h3 className="font-bold">Frontend</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">React, Next.js, Redux, HTML, CSS, JavaScript</p>
                </div>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <h3 className="font-bold">Backend</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Node.js, Express.js</p>
                </div>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <h3 className="font-bold">Database</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">MongoDB, Mongoose, SQL, PostgreSQL</p>
                </div>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                  <h3 className="font-bold">Tools</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Heroku, Netlify, AWS, Firebase, Git, Docker, GitHub</p>
                </div>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="min-h-screen py-20">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold mb-12">Projects</h2>
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <Loader className="animate-spin" size={48} />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : githubProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {githubProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-600 dark:text-neutral-400">No projects found.</p>
              )}
            </div>
          </section>

          {/* Contributions Section */}
          <section id="contributions" className="min-h-screen py-20">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold mb-12">Contributions</h2>
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <Loader className="animate-spin" size={48} />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : githubContributions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {githubContributions.map((contribution) => (
                    <ContributionCard key={contribution.id} contribution={contribution} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-600 dark:text-neutral-400">No contributions found.</p>
              )}
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
                <a href="#" className="hover:text-red-500 dark:hover:text-violet-500 transition-colors">
                  <Github size={24} />
                </a>
                <a href="#" className="hover:text-red-500 dark:hover:text-violet-500 transition-colors">
                  <Linkedin size={24} />
                </a>
                <a href="#" className="hover:text-red-500 dark:hover:text-violet-500 transition-colors">
                  <Mail size={24} />
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 p-3 bg-red-500 dark:bg-violet-500 text-white rounded-full shadow-lg hover:bg-red-500 dark:hover:bg-violet-800 transition-all duration-300 ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      </div>
    </div>
    </>
  );
};

export default Portfolio;

