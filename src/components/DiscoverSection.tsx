import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, BookOpen, Eye, X } from 'lucide-react';
import { CURATED_STORIES } from '../data/curatedSpecimens';
import { CuratedStory, IdentificationResult } from '../types/nature';

interface DiscoverSectionProps {
  onSelectSpecimen: (result: IdentificationResult) => void;
  onNavigateToIdentify: (categoryHint?: string) => void;
}

export const DiscoverSection: React.FC<DiscoverSectionProps> = ({
  onSelectSpecimen,
  onNavigateToIdentify,
}) => {
  const [activeStoryModal, setActiveStoryModal] = useState<CuratedStory | null>(null);

  return (
    <section id="discover" className="py-24 bg-[#142B22] text-[#F6F4EC] relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#94A386] uppercase">
            <span>Botanical & Zoological Field Index</span>
            <span aria-hidden="true">·</span>
            <span>Vol. 01</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#F6F4EC] leading-tight">
            A closer look changes everything.
          </h2>
          <p className="text-base sm:text-lg text-[#EAE8DD]/80 leading-relaxed font-light">
            Every leaf edge, feather contour, and wing scale holds an evolutionary narrative millions of years in the making. Select any specimen to examine its field records or photograph your own.
          </p>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Card 1: Primary Large Feature (Cedar Waxwing) - 7 cols */}
          <div className="md:col-span-7 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#203D2F] border border-[#DCDDD2]/10 mb-5">
              <img
                src={CURATED_STORIES[0].imageUrl}
                alt={CURATED_STORIES[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142B22] via-[#142B22]/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#94A386] font-mono mb-1">
                    <span>{CURATED_STORIES[0].categoryDisplay}</span>
                    <span aria-hidden="true">·</span>
                    <span className="italic">{CURATED_STORIES[0].scientificName}</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F6F4EC]">
                    {CURATED_STORIES[0].title}
                  </h3>
                </div>
                <button
                  onClick={() => onSelectSpecimen(CURATED_STORIES[0].sampleResult)}
                  className="px-4 py-2 text-xs font-medium bg-[#EAE8DD] hover:bg-white text-[#142B22] rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Examine Specimen</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-[#EAE8DD]/80 leading-relaxed max-w-xl">
              {CURATED_STORIES[0].story}
            </p>
          </div>

          {/* Card 2: Secondary Feature (Fern Fiddlehead) - 5 cols */}
          <div className="md:col-span-5 group flex flex-col justify-between">
            <div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#203D2F] border border-[#DCDDD2]/10 mb-5">
                <img
                  src={CURATED_STORIES[1].imageUrl}
                  alt={CURATED_STORIES[1].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142B22] via-[#142B22]/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#94A386] font-mono mb-1">
                      <span>{CURATED_STORIES[1].categoryDisplay}</span>
                      <span aria-hidden="true">·</span>
                      <span className="italic">{CURATED_STORIES[1].scientificName}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-[#F6F4EC]">
                      {CURATED_STORIES[1].title}
                    </h3>
                  </div>
                  <button
                    onClick={() => onSelectSpecimen(CURATED_STORIES[1].sampleResult)}
                    className="p-2.5 bg-[#EAE8DD] hover:bg-white text-[#142B22] rounded-lg transition-colors shrink-0"
                    aria-label="Examine Fern Fiddlehead"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-[#EAE8DD]/80 leading-relaxed">
                {CURATED_STORIES[1].story}
              </p>
            </div>
            <div className="pt-4 border-t border-[#DCDDD2]/10 mt-6 flex items-center justify-between text-xs text-[#94A386] font-mono">
              <span>Circinate Vernation Geometry</span>
              <button
                onClick={() => onNavigateToIdentify('plant')}
                className="text-[#EAE8DD] hover:text-[#94A386] underline transition-colors"
              >
                Scan a leaf in your area →
              </button>
            </div>
          </div>

          {/* Card 3: Tertiary Feature (Monarch Butterfly) - 5 cols */}
          <div className="md:col-span-5 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#203D2F] border border-[#DCDDD2]/10 mb-5">
              <img
                src={CURATED_STORIES[2].imageUrl}
                alt={CURATED_STORIES[2].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142B22] via-[#142B22]/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#94A386] font-mono mb-1">
                    <span>{CURATED_STORIES[2].categoryDisplay}</span>
                    <span aria-hidden="true">·</span>
                    <span className="italic">{CURATED_STORIES[2].scientificName}</span>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#F6F4EC]">
                    {CURATED_STORIES[2].title}
                  </h3>
                </div>
                <button
                  onClick={() => onSelectSpecimen(CURATED_STORIES[2].sampleResult)}
                  className="p-2.5 bg-[#EAE8DD] hover:bg-white text-[#142B22] rounded-lg transition-colors shrink-0"
                  aria-label="Examine Monarch Butterfly"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-[#EAE8DD]/80 leading-relaxed">
              {CURATED_STORIES[2].story}
            </p>
          </div>

          {/* Card 4: Quaternary Feature (Ancient Oak) - 7 cols */}
          <div className="md:col-span-7 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#203D2F] border border-[#DCDDD2]/10 mb-5">
              <img
                src={CURATED_STORIES[3].imageUrl}
                alt={CURATED_STORIES[3].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142B22] via-[#142B22]/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#94A386] font-mono mb-1">
                    <span>{CURATED_STORIES[3].categoryDisplay}</span>
                    <span aria-hidden="true">·</span>
                    <span className="italic">{CURATED_STORIES[3].scientificName}</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F6F4EC]">
                    {CURATED_STORIES[3].title}
                  </h3>
                </div>
                <button
                  onClick={() => onSelectSpecimen(CURATED_STORIES[3].sampleResult)}
                  className="px-4 py-2 text-xs font-medium bg-[#EAE8DD] hover:bg-white text-[#142B22] rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Examine Specimen</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-[#EAE8DD]/80 leading-relaxed max-w-xl">
              {CURATED_STORIES[3].story}
            </p>
          </div>
        </div>

        {/* Quiet Field Note Strip */}
        <div className="mt-20 p-8 rounded-2xl bg-[#203D2F]/60 border border-[#DCDDD2]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-serif text-xl font-medium text-[#F6F4EC]">
              Ready to explore your own habitat?
            </h4>
            <p className="text-sm text-[#EAE8DD]/70">
              Point your camera at any plant, bird, tree, or insect in your garden or local park.
            </p>
          </div>
          <button
            onClick={() => onNavigateToIdentify()}
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#142B22] bg-[#EAE8DD] hover:bg-white rounded-lg transition-colors shrink-0"
          >
            Launch Identification Workspace
          </button>
        </div>
      </div>
    </section>
  );
};
