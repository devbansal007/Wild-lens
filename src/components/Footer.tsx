import React from 'react';
import { Camera, BookOpen, Compass, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'discover' | 'identify' | 'journal' | 'missions') => void;
  onOpenModelInfo: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenModelInfo }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#10221B] text-[#F6F4EC] border-t border-[#DCDDD2]/10 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#DCDDD2]/10">
          {/* Brand Col (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#203D2F] border border-[#78866B]/30 flex items-center justify-center text-[#94A386]">
                <svg
                  className="w-4 h-4 text-[#94A386]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <span className="font-serif text-2xl font-semibold tracking-tight text-[#F6F4EC]">
                WildLens
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#EAE8DD]/70 max-w-sm leading-relaxed font-light">
              An immersive botanical and wildlife field companion designed to reconnect humans with living ecosystems through high-precision photography and open-weight AI vision.
            </p>
            <div className="text-xs text-[#94A386] font-mono">
              Built for the “Touch Grass” Open-Source AI Challenge
            </div>
          </div>

          {/* Navigation Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-serif text-sm font-semibold text-[#F6F4EC] uppercase tracking-wider">
              Exploration
            </h5>
            <ul className="space-y-2 text-xs text-[#EAE8DD]/80">
              <li>
                <button
                  onClick={() => onNavigate('discover')}
                  className="hover:text-white transition-colors"
                >
                  Field Discoveries Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('identify')}
                  className="hover:text-white transition-colors"
                >
                  Camera & Photo Identification
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('journal')}
                  className="hover:text-white transition-colors"
                >
                  Personal Field Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('missions')}
                  className="hover:text-white transition-colors"
                >
                  Sensory Outdoor Missions
                </button>
              </li>
            </ul>
          </div>

          {/* Ethics & Architecture (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="font-serif text-sm font-semibold text-[#F6F4EC] uppercase tracking-wider">
              Ethics & Transparency
            </h5>
            <p className="text-xs text-[#EAE8DD]/70 leading-relaxed font-light">
              WildLens prioritizes client-side privacy. Photographs are stored in your device’s IndexedDB database. Never ingest or handle wild plants or insects based solely on automated visual classification.
            </p>
            <div className="pt-1">
              <button
                onClick={onOpenModelInfo}
                className="text-xs font-mono text-[#94A386] hover:text-[#F6F4EC] underline transition-colors"
              >
                Read Model Weights & License Notice →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#EAE8DD]/60">
          <div>
            © {new Date().getFullYear()} WildLens Field Collective · Open Nature Tech
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[#94A386] hover:text-[#F6F4EC] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
