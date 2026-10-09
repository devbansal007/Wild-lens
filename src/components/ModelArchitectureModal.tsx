import React from 'react';
import { X, ShieldCheck, Cpu, HardDrive, Terminal, Lock, Globe } from 'lucide-react';

interface ModelArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelArchitectureModal: React.FC<ModelArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#142B22]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#203D2F] border border-[#DCDDD2]/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#142B22]/80 hover:bg-[#142B22] text-[#F6F4EC] border border-[#DCDDD2]/15 transition-colors"
          aria-label="Close Architecture Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-8 border-b border-[#DCDDD2]/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#94A386] uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Open-Weight AI & Privacy Transparency</span>
          </div>
          <h3 className="font-serif text-3xl font-semibold text-[#F6F4EC]">
            WildLens Inference Architecture
          </h3>
          <p className="text-xs sm:text-sm text-[#EAE8DD]/75 font-light leading-relaxed">
            Built for the “Touch Grass” Open-Source AI Challenge with a privacy-first, replaceable inference pipeline.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-8 text-xs sm:text-sm text-[#EAE8DD]/85 leading-relaxed font-light">
          {/* Section 1: Model Lineage & Open-Weight Weights */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-medium text-[#F6F4EC] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#94A386]" />
              <span>1. Open-Weight Model: Qwen2.5-VL</span>
            </h4>
            <p>
              WildLens is engineered around open-weight vision-language models, natively supporting <strong className="text-white">Qwen2.5-VL-7B-Instruct</strong> and <strong className="text-white">Qwen2.5-VL-3B-Instruct</strong> (Apache 2.0 license). The vision encoder processes high-resolution nature photographs at native dynamic resolutions, extracting fine features such as leaf margins, serrations, and insect venation.
            </p>
            <div className="p-4 rounded-xl bg-[#142B22] border border-[#DCDDD2]/10 font-mono text-xs text-[#94A386] space-y-1">
              <p className="text-[#EAE8DD]"># Run local inference in 1 command with Ollama:</p>
              <p className="text-emerald-400">ollama run qwen2.5-vl</p>
              <p className="text-[#EAE8DD]/60"># Configured endpoint in WildLens Settings: http://127.0.0.1:11434</p>
            </div>
          </div>

          {/* Section 2: Hybrid Cloud Fallback (Gemini 3.8 Flash Vision) */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-medium text-[#F6F4EC] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#94A386]" />
              <span>2. Server-Side Foundation Model (Gemini 3.8 Flash)</span>
            </h4>
            <p>
              For mobile devices or lightweight laptops without discrete GPUs, WildLens includes a server-side proxy route using Google’s Gemini 3.8 Flash vision model. All API keys remain isolated strictly on the server backend (<code className="text-[#94A386] font-mono">server.ts</code>) and are never exposed to browser client bundles.
            </p>
          </div>

          {/* Section 3: Privacy & Local Persistence */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-medium text-[#F6F4EC] flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#94A386]" />
              <span>3. Local Client-Side Field Journal (IndexedDB)</span>
            </h4>
            <p>
              Your Field Journal entries, high-resolution photographs, personal field notes, and completed outdoor missions are saved in your browser&apos;s native <strong className="text-white">IndexedDB</strong> storage. No user accounts, registration, or third-party telemetry are required. Photographs stay on your device unless submitted for live inference.
            </p>
          </div>

          {/* Section 4: Truthful Labeling & Fallback */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-medium text-[#F6F4EC] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#94A386]" />
              <span>4. Truthful AI Verification Policy</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#EAE8DD]/80">
              <li>No hallucinated certainty scores (WildLens explains visual diagnostic markers instead).</li>
              <li>Clear visual labels distinguishing live model inference from curated reference records.</li>
              <li>Safety advisory notices automatically attached to wild plant and insect identifications.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#142B22]/60 border-t border-[#DCDDD2]/10 flex items-center justify-between text-xs font-mono text-[#94A386]">
          <span>Touch Grass Challenge Edition</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#EAE8DD] text-[#142B22] font-semibold rounded-lg hover:bg-white transition-colors"
          >
            Close Transparency Panel
          </button>
        </div>
      </div>
    </div>
  );
};
