import React from 'react';
import { ArrowDown, Camera, BookOpen } from 'lucide-react';
import { ASSETS } from '../data/assets';

interface HeroProps {
  onStartExploring: () => void;
  onOpenJournal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartExploring, onOpenJournal }) => {
  return (
    <section className="relative min-h-[92vh] flex items-end pb-16 md:pb-24 pt-32 overflow-hidden bg-[#142B22]">
      {/* Background Photography with Slow Reveal and Cinematic Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={ASSETS.heroCanopy}
          alt="Ancient mossy forest canopy with dramatic golden morning sunlight"
          className="w-full h-full object-cover object-center scale-105 animate-[pulse_10s_ease-in-out_infinite] motion-reduce:scale-100 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Scrim Overlay designed for high WCAG contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#142B22] via-[#142B22]/60 to-[#142B22]/30" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#142B22]/40 to-[#142B22]/80" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Understated Editorial Label */}
          <div className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-[#94A386] uppercase">
            <span className="w-6 h-[1px] bg-[#94A386]" />
            <span>Your Personal AI Nature Guide</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#EAE8DD]/60">Touch Grass AI</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-[#F6F4EC] leading-[1.08] text-balance">
            The wild is closer than you think.
          </h1>

          {/* Supporting Prose */}
          <p className="text-base sm:text-lg md:text-xl text-[#EAE8DD]/85 leading-relaxed max-w-2xl font-light">
            Discover the living world around you. Identify what you find, learn its story, and keep a record of every encounter.
          </p>

          {/* CTAs */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartExploring}
              className="px-7 py-3.5 text-sm font-semibold text-[#142B22] bg-[#EAE8DD] hover:bg-white rounded-lg transition-all duration-200 shadow-md flex items-center gap-2.5 group"
            >
              <Camera className="w-4 h-4 text-[#142B22] group-hover:scale-110 transition-transform" />
              <span>Start exploring</span>
            </button>

            <button
              onClick={onOpenJournal}
              className="px-6 py-3.5 text-sm font-medium text-[#F6F4EC] bg-[#203D2F]/80 hover:bg-[#203D2F] border border-[#DCDDD2]/20 hover:border-[#DCDDD2]/40 rounded-lg transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#94A386]" />
              <span>Explore the field journal</span>
            </button>
          </div>
        </div>

        {/* Ambient Field Marker & Scroll Indicator */}
        <div className="mt-14 pt-6 border-t border-[#DCDDD2]/10 flex items-center justify-between text-xs text-[#EAE8DD]/60 font-mono">
          <div className="flex items-center gap-3">
            <span>Lat 47°32&apos;N</span>
            <span aria-hidden="true">·</span>
            <span>Canopy Optical Field</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#94A386]">Open Vision Model Architecture</span>
          </div>

          <a
            href="#discover"
            className="hidden sm:flex items-center gap-2 text-[#EAE8DD]/70 hover:text-[#F6F4EC] transition-colors"
          >
            <span>Scroll to observe</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};
