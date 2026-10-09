import React, { useState } from 'react';
import { Camera, Compass, BookOpen, Cpu, Menu, X, Sparkles } from 'lucide-react';

interface NavigationProps {
  activeTab: 'discover' | 'identify' | 'journal' | 'missions';
  setActiveTab: (tab: 'discover' | 'identify' | 'journal' | 'missions') => void;
  onOpenModelInfo: () => void;
  journalCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenModelInfo,
  journalCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#142B22]/90 backdrop-blur-md border-b border-[#DCDDD2]/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => {
            setActiveTab('discover');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78866B] rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-full bg-[#203D2F] border border-[#78866B]/30 flex items-center justify-center text-[#F6F4EC] group-hover:border-[#78866B] transition-colors">
            <svg
              className="w-5 h-5 text-[#94A386]"
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
          <span className="font-serif text-2xl font-semibold tracking-tight text-[#F6F4EC] whitespace-nowrap shrink-0">
            WildLens
          </span>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('discover')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
              activeTab === 'discover'
                ? 'text-[#F6F4EC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#78866B]'
                : 'text-[#EAE8DD]/70 hover:text-[#F6F4EC]'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('identify')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
              activeTab === 'identify'
                ? 'text-[#F6F4EC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#78866B]'
                : 'text-[#EAE8DD]/70 hover:text-[#F6F4EC]'
            }`}
          >
            Identify
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
              activeTab === 'journal'
                ? 'text-[#F6F4EC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#78866B]'
                : 'text-[#EAE8DD]/70 hover:text-[#F6F4EC]'
            }`}
          >
            Field Journal
            {journalCount > 0 && (
              <span className="ml-1.5 text-xs text-[#94A386] font-mono tabular-nums">
                ({journalCount})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
              activeTab === 'missions'
                ? 'text-[#F6F4EC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#78866B]'
                : 'text-[#EAE8DD]/70 hover:text-[#F6F4EC]'
            }`}
          >
            Outdoor Missions
          </button>
          <button
            onClick={onOpenModelInfo}
            className="whitespace-nowrap shrink-0 text-xs font-mono text-[#94A386] hover:text-[#F6F4EC] transition-colors py-1 border-b border-[#78866B]/30 hover:border-[#78866B]"
          >
            AI Architecture & Privacy
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('identify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#142B22] bg-[#EAE8DD] hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-2"
          >
            <Camera className="w-3.5 h-3.5" />
            Identify Nature
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#F6F4EC] p-2 hover:bg-[#203D2F] rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#EAE8DD]" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#142B22] border-b border-[#DCDDD2]/10 px-6 py-5 space-y-4">
          <button
            onClick={() => {
              setActiveTab('discover');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#F6F4EC]"
          >
            Discover
          </button>
          <button
            onClick={() => {
              setActiveTab('identify');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#F6F4EC]"
          >
            Identify
          </button>
          <button
            onClick={() => {
              setActiveTab('journal');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#F6F4EC]"
          >
            Field Journal {journalCount > 0 ? `(${journalCount})` : ''}
          </button>
          <button
            onClick={() => {
              setActiveTab('missions');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#F6F4EC]"
          >
            Outdoor Missions
          </button>
          <button
            onClick={() => {
              onOpenModelInfo();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm text-[#94A386]"
          >
            AI Architecture & Privacy
          </button>
          <button
            onClick={() => {
              setActiveTab('identify');
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#142B22] bg-[#EAE8DD] rounded-lg"
          >
            Open Nature Camera
          </button>
        </div>
      )}
    </header>
  );
};
