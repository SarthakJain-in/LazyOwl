import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Github,
  Play,
  ArrowRight,
  LayoutDashboard,
  BrainCircuit,
  ShieldCheck,
  Database,
  Server,
  Code,
  FileJson,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import l1 from "../assets/mockup/light/L1.jpg";
import l2 from "../assets/mockup/light/L2.jpg";
import l3 from "../assets/mockup/light/L3.jpg";
import l4 from "../assets/mockup/light/L4.jpg";
import l5 from "../assets/mockup/light/L5.jpg";

import d1 from "../assets/mockup/dark/D1.jpg";
import d2 from "../assets/mockup/dark/D2.jpg";
import d3 from "../assets/mockup/dark/D3.jpg";
import d4 from "../assets/mockup/dark/D4.jpg";
import d5 from "../assets/mockup/dark/D5.jpg";

import ThemeToggle from "../components/ThemeToggle";
import { useAppStore } from "../store/useAppStore";

const lightMockups = [l1, l2, l3, l4, l5];
const darkMockups = [d1, d2, d3, d4, d5];

export default function LandingPage() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const mockups = isDarkMode ? darkMockups : lightMockups;
  const [currentMockup, setCurrentMockup] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMockup((prev) => (prev + 1) % mockups.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [mockups.length]);

  const nextMockup = () =>
    setCurrentMockup((prev) => (prev + 1) % mockups.length);
  const prevMockup = () =>
    setCurrentMockup((prev) => (prev - 1 + mockups.length) % mockups.length);
  return (
    <div className="min-h-screen bg-forge-bg text-forge-textPrimary font-sans selection:bg-forge-accent/30">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-forge-bg/80 backdrop-blur-md border-b border-forge-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="font-black text-2xl tracking-tighter"
              style={{
                color: "var(--brand-title-color)",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              LazyOwl.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a
              href="https://github.com/SarthakJain-in"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-forge-textSecondary hover:text-forge-textPrimary transition-colors"
              aria-label="View Source on GitHub"
            >
              <Github size={20} />
            </a>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-forge-border hover:border-forge-accent/40 bg-forge-surface hover:bg-forge-bg transition-all shadow-sm flex items-center gap-2"
            >
              Admin Login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-24 mt-2 mb-10 px-6 relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        {/* Abstract Background Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-forge-accent/20 blur-[140px] rounded-full pointer-events-none opacity-50 dark:opacity-30"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left side: Text Content */}
          <div className="text-left pt-8 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forge-surface border border-forge-border text-xs font-semibold text-forge-textSecondary mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forge-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-forge-accent"></span>
              </span>
              Live Personal Workspace
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              My AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-accent to-blue-500">
                Second Brain.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-forge-textSecondary max-w-lg mb-0 leading-relaxed">
              A custom-built, full-stack application I engineered to automatically
              generate structured learning paths via the Gemini API, track daily
              streaks, and organize my knowledge.
            </p>
          </div>

          {/* Right side: Interactive Carousel Mockup */}
          <div className="relative w-full mx-auto max-w-2xl lg:max-w-none perspective-1000 mt-10 lg:mt-0">
            <div className="rounded-2xl border border-forge-border/50 bg-forge-surface p-2 shadow-2xl transform hover:scale-[1.02] hover:-rotate-y-2 transition-all duration-700 ease-out group">
              <div className="rounded-xl border border-forge-border bg-forge-bg overflow-hidden relative">
                {/* Browser Mockup Header */}
                <div className="h-8 md:h-10 border-b border-forge-border bg-forge-surface/50 flex items-center px-4 gap-2 z-20 relative">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400/60 border border-red-400/50"></div>
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400/60 border border-yellow-400/50"></div>
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400/60 border border-green-400/50"></div>
                </div>

                {/* Images */}
                <div className="relative w-full bg-forge-bg">
                  {/* Invisible 'Ghost' Image to seamlessly force native container height */}
                  <img
                    src={mockups[0]}
                    className="w-full h-auto opacity-0 pointer-events-none block"
                    alt=""
                    aria-hidden="true"
                  />

                  {mockups.map((mockup, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentMockup
                          ? "opacity-100 z-10"
                          : "opacity-0 z-0"
                      }`}
                    >
                      <img
                        src={mockup}
                        alt={`LazyOwl Screenshot ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                      {/* Subtle gradient overlay to make controls pop */}
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
                    </div>
                  ))}

                  {/* Navigation Controls (Visible on hover) */}
                  <button
                    onClick={prevMockup}
                    className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all hover:scale-110 shadow-xl"
                  >
                    <ChevronLeft size={20} className="md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={nextMockup}
                    className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all hover:scale-110 shadow-xl"
                  >
                    <ChevronRight size={20} className="md:w-6 md:h-6" />
                  </button>

                  {/* Pagination Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 md:gap-2">
                    {mockups.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMockup(index)}
                        className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out ${
                          index === currentMockup
                            ? "w-6 md:w-8 bg-forge-accent shadow-[0_0_12px_rgba(67,97,238,0.8)]"
                            : "w-1.5 md:w-2 bg-white/50 hover:bg-white/90"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-forge-accent/20 via-blue-500/20 to-forge-accent/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECH STACK BANNER --- */}
      <section className="py-10 border-y border-forge-border bg-forge-surface/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Database size={24} /> MongoDB
          </div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <Server size={24} /> Express.js
          </div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <Code size={24} /> React
          </div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <FileJson size={24} /> Node.js
          </div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <BrainCircuit size={24} /> Google Gemini
          </div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap size={24} /> Tailwind CSS
          </div>
        </div>
      </section>

      {/* --- UNDER THE HOOD --- */}
      <section className="py-24 px-6 bg-forge-bg relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Under the Hood
            </h2>
            <p className="text-forge-textSecondary">
              Architecture and key engineering decisions behind LazyOwl.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-forge-surface rounded-3xl p-8 border border-forge-border hover:border-forge-accent/30 transition-colors">
              <div className="w-12 h-12 bg-forge-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <BrainCircuit className="text-forge-accent" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Dynamic AI Generation</h3>
              <p className="text-forge-textSecondary text-sm leading-relaxed">
                Integrated the Google Gemini API in the Node.js backend to parse
                user prompts and dynamically construct structured,
                module-by-module learning roadmaps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-forge-surface rounded-3xl p-8 border border-forge-border hover:border-forge-accent/30 transition-colors">
              <div className="w-12 h-12 bg-forge-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard className="text-forge-accent" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Optimistic Drag & Drop</h3>
              <p className="text-forge-textSecondary text-sm leading-relaxed">
                Developed a fluid task reordering interface using{" "}
                <code className="text-xs bg-forge-bg px-1 py-0.5 rounded text-forge-textPrimary">
                  @hello-pangea/dnd
                </code>
                , utilizing Zustand for optimistic, zero-latency state updates
                on the frontend.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-forge-surface rounded-3xl p-8 border border-forge-border hover:border-forge-accent/30 transition-colors">
              <div className="w-12 h-12 bg-forge-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-forge-accent" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Decoupled Architecture</h3>
              <p className="text-forge-textSecondary text-sm leading-relaxed">
                Built a production-ready MERN environment with JWT-based
                authentication and protected routing to isolate personal data,
                ready for scalable deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-forge-border py-8 text-center text-forge-textSecondary text-sm bg-forge-surface">
        <p>Designed & Built for Personal Use • {new Date().getFullYear()}</p>
        <p className="mt-2">
          Engineered with <span className="text-forge-accent">♥</span> by
          Sarthak
        </p>
      </footer>
    </div>
  );
}
