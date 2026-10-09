import React, { useState } from 'react';
import { Compass, CheckCircle2, Circle, ArrowRight, Eye, Wind, Sun, Volume2, Play, Pause } from 'lucide-react';

interface NatureMissionsViewProps {
  onNavigateToIdentify: () => void;
}

interface CoreMission {
  id: string;
  category: string;
  title: string;
  instruction: string;
  fieldBenefit: string;
  sensoryFocus: string;
}

const DEFAULT_MISSIONS: CoreMission[] = [
  {
    id: 'core-mission-1',
    category: 'Botanical Geometry',
    title: 'The Contrast of Leaf Margins',
    instruction: 'Find two distinct leaves from different plants. Hold them up to the morning sky and compare their edges: is one serrated, one smooth (entire), or deeply lobed?',
    fieldBenefit: 'Leaf margin serration regulates water transpirational loss and temperature in varying light conditions.',
    sensoryFocus: 'Visual silhouette & geometry',
  },
  {
    id: 'core-mission-2',
    category: 'Optical Phenology',
    title: 'Translucent Sunlight Veins',
    instruction: 'Select a broad sunlit deciduous leaf. Stand so the sun is directly behind the leaf, casting its vein network into high relief. Observe how the leaf color shifts from deep green to glowing emerald gold.',
    fieldBenefit: 'Develops eye sensitivity for cellular chlorophyll saturation and hydraulic xylem pathways.',
    sensoryFocus: 'Luminance & backlighting',
  },
  {
    id: 'core-mission-3',
    category: 'Bioacoustics',
    title: 'Three Distinct Songbird Calls',
    instruction: 'Sit completely still beneath a tree canopy for 4 minutes with your eyes closed. Listen until you can isolate three distinctly different bird vocalizations by pitch and rhythm.',
    fieldBenefit: 'Sharpens auditory directional discernment and teaches stillness in wild habitats.',
    sensoryFocus: 'Acoustic landscape & stillness',
  },
  {
    id: 'core-mission-4',
    category: 'Micro-Ecology',
    title: 'Pollinator Dwell Duration',
    instruction: 'Locate a patch of flowering blossoms. Without casting your shadow over them, observe the insects visiting. Count how many seconds each bee, fly, or butterfly lingers on an individual flower before departing.',
    fieldBenefit: 'Reveals the delicate energetics of nectar foraging and pollination efficiency.',
    sensoryFocus: 'Temporal patience & motion tracking',
  },
  {
    id: 'core-mission-5',
    category: 'Tactile Dendrology',
    title: 'Bark Texture & Lichen Colonization',
    instruction: 'Find two mature trees of different species. Close your eyes and run your fingertips gently across their bark ridges. Notice differences in furrows, flakiness, and moisture.',
    fieldBenefit: 'Tactile inspection trains sensory observation beyond purely visual photography.',
    sensoryFocus: 'Tactile texture & microclimate',
  },
];

export const NatureMissionsView: React.FC<NatureMissionsViewProps> = ({
  onNavigateToIdentify,
}) => {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('wildlens_core_missions');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [isLoopPaused, setIsLoopPaused] = useState<boolean>(false);

  const toggleMission = (id: string) => {
    setCompletedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('wildlens_core_missions', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save mission to local storage', e);
      }
      return next;
    });
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;

  // Seamless repeating loop for horizontal left-to-right animation
  // Repeating list twice ensures -50% to 0% translation loops without seams
  const baseList = [...DEFAULT_MISSIONS, ...DEFAULT_MISSIONS];
  const loopedMissions = [...baseList, ...baseList];

  return (
    <section id="missions" className="py-24 bg-[#142B22] text-[#F6F4EC] min-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#DCDDD2]/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#94A386] uppercase">
              <span>Sensory Field Protocol</span>
              <span aria-hidden="true">·</span>
              <span>Left-to-Right Continuous Stream</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F6F4EC]">
              Outdoor Missions
            </h2>
            <p className="text-sm sm:text-base text-[#EAE8DD]/75 max-w-xl font-light">
              Structured field exercises to step outside and observe living details. Cards move in a continuous horizontal stream from left to right—hover or click to pause.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Play/Pause Motion Toggle */}
            <button
              onClick={() => setIsLoopPaused(!isLoopPaused)}
              className="px-3 py-2 text-xs font-mono rounded-lg bg-[#203D2F] border border-[#DCDDD2]/15 text-[#EAE8DD] hover:text-white flex items-center gap-2 transition-colors shrink-0"
              title={isLoopPaused ? 'Resume scrolling' : 'Pause scrolling'}
            >
              {isLoopPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resume Stream</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#94A386]" />
                  <span>Pause Stream</span>
                </>
              )}
            </button>

            <div className="text-xs font-mono text-[#94A386] flex items-center gap-2 bg-[#203D2F] px-4 py-2.5 rounded-lg border border-[#DCDDD2]/10">
              <span>Completed:</span>
              <span className="font-bold text-[#F6F4EC] tabular-nums">{completedCount}</span>
              <span>of {DEFAULT_MISSIONS.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Continuous Repeating Loop Track (Left to Right) */}
      <div className="mt-12 relative w-full overflow-hidden">
        {/* Subtle Edge Vignette Scrims */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#142B22] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#142B22] to-transparent z-20" />

        {/* Marquee Track Moving from Left to Right */}
        <div
          className={`flex items-stretch gap-6 py-4 animate-marquee-right ${
            isLoopPaused ? 'animation-paused' : ''
          }`}
        >
          {loopedMissions.map((mission, idx) => {
            const isCompleted = Boolean(completedMap[mission.id]);
            return (
              <div
                key={`${mission.id}-loop-${idx}`}
                className={`w-[320px] sm:w-[370px] shrink-0 rounded-2xl p-7 border transition-all duration-300 flex flex-col justify-between shadow-lg hover:-translate-y-1 ${
                  isCompleted
                    ? 'bg-[#203D2F]/50 border-emerald-800/50'
                    : 'bg-[#203D2F]/80 border-[#DCDDD2]/15 hover:border-[#78866B]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[#94A386]">
                    <span className="uppercase tracking-wider">0{(idx % DEFAULT_MISSIONS.length) + 1} · {mission.category}</span>
                    <span className="text-[#EAE8DD]/60 truncate max-w-[140px]">{mission.sensoryFocus}</span>
                  </div>

                  <h3 className="font-serif text-2xl font-medium text-[#F6F4EC] leading-snug">
                    {mission.title}
                  </h3>

                  <p className="text-sm text-[#EAE8DD]/85 leading-relaxed font-light">
                    {mission.instruction}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#DCDDD2]/10 space-y-4">
                  <div className="text-xs text-[#94A386]">
                    <span className="font-semibold text-[#EAE8DD]/80">Field Naturalist Skill: </span>
                    {mission.fieldBenefit}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleMission(mission.id)}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isCompleted
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60'
                        : 'bg-[#142B22] hover:bg-[#142B22]/80 text-[#EAE8DD] border border-[#DCDDD2]/20'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Completed in Field</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-[#94A386]" />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Under-Row Note */}
        <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-wrap items-center justify-between text-xs font-mono text-[#94A386]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#94A386]" />
            <span>Outdoor sensory missions streaming continuously left-to-right</span>
          </div>
          <div className="text-[#EAE8DD]/60">
            Hover over any mission card to pause and read
          </div>
        </div>
      </div>

      {/* Closing Quote Banner */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="p-8 rounded-2xl bg-[#203D2F]/40 border border-[#DCDDD2]/10 text-center max-w-2xl mx-auto space-y-4">
          <p className="font-serif text-xl text-[#F6F4EC]">
            “In every walk with nature, one receives far more than he seeks.”
          </p>
          <p className="text-xs text-[#94A386] font-mono">
            — John Muir, Field Journals 1877
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToIdentify}
              className="text-xs uppercase tracking-wider font-semibold text-[#EAE8DD] hover:text-white underline underline-offset-4"
            >
              Found something interesting? Identify it now →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
