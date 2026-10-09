import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Share2,
  Layers,
  ShieldAlert,
  ChevronRight,
  Sliders,
  Settings2,
  Compass,
  ArrowRight,
  X
} from 'lucide-react';
import { IdentificationResult, NatureCategory } from '../types/nature';
import { identifySpecimen, InferenceMode, checkInferenceHealth, ProviderHealth } from '../services/inferenceService';
import { saveJournalEntry } from '../storage/journalDb';
import { ASSETS } from '../data/assets';

interface IdentifyWorkspaceProps {
  initialCategory?: NatureCategory;
  onSavedToJournal: (result: IdentificationResult) => void;
  externalSpecimenResult?: IdentificationResult | null;
  onClearExternalSpecimen?: () => void;
}

export const IdentifyWorkspace: React.FC<IdentifyWorkspaceProps> = ({
  initialCategory = 'unsure',
  onSavedToJournal,
  externalSpecimenResult,
  onClearExternalSpecimen,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [categoryHint, setCategoryHint] = useState<NatureCategory>(initialCategory);
  const [inferenceMode, setInferenceMode] = useState<InferenceMode>('auto');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('Preparing image analysis...');
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [personalNotes, setPersonalNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Backend status
  const [providerHealth, setProviderHealth] = useState<ProviderHealth | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://127.0.0.1:11434');
  const [ollamaModel, setOllamaModel] = useState<string>('qwen2.5-vl');

  useEffect(() => {
    checkInferenceHealth().then((h) => {
      if (h) setProviderHealth(h);
    });
  }, []);

  // When external specimen is passed from Discover section
  useEffect(() => {
    if (externalSpecimenResult) {
      setResult(externalSpecimenResult);
      setSelectedImage(externalSpecimenResult.photoUrl);
      setCategoryHint(externalSpecimenResult.category);
      setSavedSuccess(false);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }, [externalSpecimenResult]);

  // Handle Camera Startup
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Unable to access device camera. Please upload an image file instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setSelectedImage(dataUrl);
      stopCamera();
      setResult(null);
      setSavedSuccess(false);
    }
  };

  // Clean up camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      setSelectedImage(dataUrl);
      setResult(null);
      setSavedSuccess(false);
      setErrorMessage(null);
      if (onClearExternalSpecimen) onClearExternalSpecimen();
    };
    reader.readAsDataURL(file);
  };

  // Select quick test specimen photograph
  const handleSelectSample = (sampleUrl: string, sampleCategory: NatureCategory) => {
    stopCamera();
    setSelectedImage(sampleUrl);
    setCategoryHint(sampleCategory);
    setResult(null);
    setSavedSuccess(false);
    setErrorMessage(null);
    if (onClearExternalSpecimen) onClearExternalSpecimen();
  };

  // Perform AI Identification
  const handleIdentify = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setErrorMessage(null);
    setScanStatusMessage('Initializing visual sensor capture...');

    try {
      const idResult = await identifySpecimen(selectedImage, {
        mode: inferenceMode,
        categoryHint,
        ollamaUrl,
        ollamaModel,
        onStatusUpdate: (msg) => setScanStatusMessage(msg),
      });

      setResult(idResult);
      setSavedSuccess(false);
    } catch (err: any) {
      console.error('Identification failed:', err);
      setErrorMessage(
        err.message || 'Nature identification was unable to complete. Please check image framing and try again.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Save to Field Journal in IndexedDB
  const handleSaveJournal = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await saveJournalEntry(result, personalNotes, 'Field Station Encounter');
      setSavedSuccess(true);
      onSavedToJournal(result);
    } catch (err) {
      console.error('Failed to save to journal IndexedDB:', err);
      setErrorMessage('Could not save to local field journal.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setPersonalNotes('');
    setSavedSuccess(false);
    setErrorMessage(null);
    stopCamera();
    if (onClearExternalSpecimen) onClearExternalSpecimen();
  };

  return (
    <section id="identify" className="py-24 bg-[#142B22] text-[#F6F4EC] relative min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Workspace Title & Configuration */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#DCDDD2]/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#94A386] uppercase">
              <span>WildLens Visual Taxonomy Engine</span>
              <span aria-hidden="true">·</span>
              <span>Field Optical Sensor</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F6F4EC]">
              Identify Nature
            </h2>
            <p className="text-sm sm:text-base text-[#EAE8DD]/75 max-w-xl font-light">
              Photograph any leaf, bird, insect, or woodland tree. WildLens analyzes diagnostic anatomical characteristics and guides your outdoor observation.
            </p>
          </div>

          {/* Model Inference Settings Bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-[#203D2F] rounded-lg border border-[#DCDDD2]/10 text-xs font-medium">
              <button
                type="button"
                onClick={() => setInferenceMode('auto')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  inferenceMode === 'auto'
                    ? 'bg-[#EAE8DD] text-[#142B22] font-semibold'
                    : 'text-[#EAE8DD]/70 hover:text-[#F6F4EC]'
                }`}
                title="Automatically uses Gemini 3.8 Flash Vision or local Open-Weight models"
              >
                Auto Vision AI
              </button>
              <button
                type="button"
                onClick={() => setInferenceMode('ollama')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  inferenceMode === 'ollama'
                    ? 'bg-[#EAE8DD] text-[#142B22] font-semibold'
                    : 'text-[#EAE8DD]/70 hover:text-[#F6F4EC]'
                }`}
                title="Connects to local Qwen2.5-VL via Ollama"
              >
                Local Qwen2.5-VL
              </button>
              <button
                type="button"
                onClick={() => setInferenceMode('demo')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  inferenceMode === 'demo'
                    ? 'bg-[#EAE8DD] text-[#142B22] font-semibold'
                    : 'text-[#EAE8DD]/70 hover:text-[#F6F4EC]'
                }`}
                title="Offline Field Specimen Archive"
              >
                Field Archive
              </button>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 rounded-lg bg-[#203D2F] hover:bg-[#203D2F]/80 border border-[#DCDDD2]/10 text-[#EAE8DD] hover:text-[#F6F4EC] transition-colors"
              title="Inference Engine Configuration"
              aria-label="Inference Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inference Settings Drawer */}
        {showSettings && (
          <div className="mt-6 p-6 rounded-2xl bg-[#203D2F]/90 border border-[#DCDDD2]/15 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-lg font-medium text-[#F6F4EC]">
                Inference Engine Configuration
              </h4>
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs text-[#94A386] hover:text-[#F6F4EC]"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-[#EAE8DD]/75 leading-relaxed">
              WildLens supports open-weight vision models (such as Qwen2.5-VL running locally via Ollama) and cloud vision foundation models (Gemini 3.8 Flash). Photographs are stored in your device’s IndexedDB and never retained on remote servers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-[#94A386] mb-1">
                  Local Ollama Endpoint
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#142B22] border border-[#DCDDD2]/20 rounded-md text-[#F6F4EC] focus:outline-none focus:border-[#78866B]"
                  placeholder="http://127.0.0.1:11434"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#94A386] mb-1">
                  Model Weight Identifier
                </label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#142B22] border border-[#DCDDD2]/20 rounded-md text-[#F6F4EC] focus:outline-none focus:border-[#78866B]"
                  placeholder="qwen2.5-vl"
                />
              </div>
            </div>
            <div className="pt-1 text-xs text-[#94A386] font-mono flex items-center gap-3">
              <span>Cloud Vision Key: {providerHealth?.hasGeminiKey ? 'Active (Gemini 3.8 Flash)' : 'Unset (Using Local / Archive Fallback)'}</span>
            </div>
          </div>
        )}

        {/* Workspace Body */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Input & Scanning Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category Filter Selector */}
            <div>
              <label className="block text-xs font-mono tracking-wider text-[#94A386] uppercase mb-2">
                Taxonomic Focus (Optional Hint)
              </label>
              <div className="flex flex-wrap gap-2">
                {(['unsure', 'plant', 'bird', 'tree', 'insect'] as NatureCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryHint(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                      categoryHint === cat
                        ? 'bg-[#EAE8DD] text-[#142B22] shadow-sm'
                        : 'bg-[#203D2F] text-[#EAE8DD]/70 hover:text-[#F6F4EC] border border-[#DCDDD2]/10'
                    }`}
                  >
                    {cat === 'unsure' ? 'Unsure / Any' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Input Area */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#203D2F] border border-[#DCDDD2]/15 shadow-xl flex flex-col items-center justify-center">
              {/* Live Camera View */}
              {isCameraActive && (
                <div className="absolute inset-0 z-20 bg-black flex flex-col">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Camera viewfinder HUD */}
                  <div className="absolute inset-8 pointer-events-none border border-white/30 rounded-xl">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
                  </div>
                  {/* Camera controls */}
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-30">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-2.5 rounded-full bg-white text-[#142B22] font-semibold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 hover:bg-neutral-100"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Frame
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-full bg-[#142B22]/80 text-white font-medium text-xs hover:bg-[#142B22]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Uploaded / Selected Image Preview */}
              {selectedImage && !isCameraActive ? (
                <div className="relative w-full h-full group">
                  <img
                    src={selectedImage}
                    alt="Nature Specimen Input"
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Animation Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#142B22]/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10">
                      {/* Animated Scanning Line */}
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#94A386] to-transparent shadow-[0_0_15px_#94A386] animate-[bounce_2s_infinite]" />
                      <div className="w-16 h-16 rounded-full border-2 border-[#94A386]/30 border-t-[#EAE8DD] animate-spin mb-4" />
                      <p className="font-serif text-lg text-[#F6F4EC] font-medium">
                        Analyzing Morphological Traits
                      </p>
                      <p className="text-xs font-mono text-[#94A386] mt-2 max-w-xs animate-pulse">
                        {scanStatusMessage}
                      </p>
                    </div>
                  )}

                  {/* Top-right overlay actions */}
                  {!isScanning && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={handleReset}
                        className="p-2 rounded-lg bg-[#142B22]/80 hover:bg-[#142B22] text-[#F6F4EC] border border-[#DCDDD2]/20 text-xs flex items-center gap-1 backdrop-blur-sm"
                        title="Remove photograph"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : !isCameraActive && (
                /* Empty Upload State */
                <div className="p-8 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#142B22] border border-[#78866B]/30 flex items-center justify-center text-[#94A386]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-serif text-lg font-medium text-[#F6F4EC]">
                      Provide a Nature Photograph
                    </p>
                    <p className="text-xs text-[#EAE8DD]/60 mt-1 max-w-xs">
                      Drag and drop an image file, use your camera, or pick from our curated field samples below.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-xs font-medium bg-[#EAE8DD] hover:bg-white text-[#142B22] rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photo
                    </button>

                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 text-xs font-medium bg-[#203D2F] hover:bg-[#203D2F]/80 text-[#F6F4EC] border border-[#DCDDD2]/20 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#94A386]" />
                      Use Camera
                    </button>
                  </div>

                  {cameraError && (
                    <p className="text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Quick Test Samples Selection */}
            <div>
              <p className="text-xs font-mono tracking-wider text-[#94A386] uppercase mb-2">
                Quick Test Field Specimens
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectSample(ASSETS.cedarWaxwing, 'bird')}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-[#DCDDD2]/10 hover:border-[#94A386] transition-colors"
                  title="Test Cedar Waxwing photo"
                >
                  <img src={ASSETS.cedarWaxwing} alt="Cedar Waxwing" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-[#F6F4EC] py-0.5 text-center truncate">Waxwing</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample(ASSETS.fernFrond, 'plant')}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-[#DCDDD2]/10 hover:border-[#94A386] transition-colors"
                  title="Test Fiddlehead Fern photo"
                >
                  <img src={ASSETS.fernFrond} alt="Fern Frond" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-[#F6F4EC] py-0.5 text-center truncate">Fern</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample(ASSETS.monarchMacro, 'insect')}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-[#DCDDD2]/10 hover:border-[#94A386] transition-colors"
                  title="Test Monarch Butterfly photo"
                >
                  <img src={ASSETS.monarchMacro} alt="Monarch" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-[#F6F4EC] py-0.5 text-center truncate">Monarch</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample(ASSETS.ancientOak, 'tree')}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-[#DCDDD2]/10 hover:border-[#94A386] transition-colors"
                  title="Test Ancient Oak photo"
                >
                  <img src={ASSETS.ancientOak} alt="Ancient Oak" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-[#F6F4EC] py-0.5 text-center truncate">Oak</span>
                </button>
              </div>
            </div>

            {/* Identify Trigger Action */}
            {selectedImage && !isScanning && !result && (
              <button
                type="button"
                onClick={handleIdentify}
                className="w-full py-4 rounded-xl bg-[#EAE8DD] hover:bg-white text-[#142B22] font-semibold text-sm uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-[#142B22] group-hover:scale-110 transition-transform" />
                Run AI Nature Identification
              </button>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Right Column: Identification Result Page (7 cols) */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-8 animate-fadeIn">
                {/* Result Header & Classification */}
                <div className="p-8 rounded-2xl bg-[#203D2F]/70 border border-[#DCDDD2]/15 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCDDD2]/10 pb-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#94A386]">
                      <span className="uppercase">{result.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{result.providerLabel}</span>
                      {result.latencyMs && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{result.latencyMs}ms</span>
                        </>
                      )}
                    </div>

                    <div className="text-xs font-mono text-[#EAE8DD]/70">
                      {result.confidenceDescriptor}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-[#F6F4EC] leading-tight">
                      {result.commonName}
                    </h3>
                    <p className="font-serif italic text-lg text-[#94A386] mt-1">
                      {result.scientificName}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-[#EAE8DD]/85 leading-relaxed font-light">
                    {result.explanation}
                  </p>

                  {/* Habitat */}
                  <div className="pt-2 text-xs font-mono text-[#EAE8DD]/80">
                    <span className="text-[#94A386]">Typical Habitat:</span> {result.habitat}
                  </div>
                </div>

                {/* 3 Biological Facts */}
                <div className="space-y-3">
                  <h4 className="font-serif text-xl font-medium text-[#F6F4EC]">
                    Key Ecological Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.facts.map((fact, index) => (
                      <div
                        key={index}
                        className="p-5 rounded-xl bg-[#203D2F]/50 border border-[#DCDDD2]/10 space-y-2 flex flex-col justify-between"
                      >
                        <span className="text-xs font-mono text-[#94A386]">
                          0{index + 1}. Insight
                        </span>
                        <p className="text-xs text-[#EAE8DD]/80 leading-relaxed font-light">
                          {fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outdoor Nature Mission Card */}
                {result.mission && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#203D2F] to-[#142B22] border border-[#78866B]/30 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#94A386] uppercase">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Suggested Outdoor Nature Mission</span>
                    </div>

                    <div>
                      <h4 className="font-serif text-xl font-medium text-[#F6F4EC]">
                        {result.mission.title}
                      </h4>
                      <p className="text-sm text-[#EAE8DD]/90 mt-2 leading-relaxed">
                        {result.mission.instruction}
                      </p>
                    </div>

                    <div className="text-xs text-[#94A386] pt-1 border-t border-[#DCDDD2]/10">
                      <span>Field Benefit: </span>
                      <span className="text-[#EAE8DD]/70">{result.mission.fieldBenefit}</span>
                    </div>
                  </div>
                )}

                {/* Uncertainty Note */}
                {result.uncertaintyNote && (
                  <div className="p-4 rounded-xl bg-[#203D2F]/30 border border-[#DCDDD2]/10 text-xs text-[#EAE8DD]/70 leading-relaxed font-mono">
                    <span className="text-[#94A386]">Taxonomic Assessment Note: </span>
                    {result.uncertaintyNote}
                  </div>
                )}

                {/* Safety Advisory if applicable */}
                {result.safetyNotice && (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{result.safetyNotice}</p>
                  </div>
                )}

                {/* Journal Personal Note & Save Action */}
                <div className="p-6 rounded-2xl bg-[#203D2F]/60 border border-[#DCDDD2]/10 space-y-4">
                  <h4 className="font-serif text-lg font-medium text-[#F6F4EC]">
                    Record in Field Journal
                  </h4>

                  <textarea
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    placeholder="Add personal field observations (e.g., weather conditions, location details, behavior observed)..."
                    className="w-full h-24 p-3.5 text-xs bg-[#142B22] border border-[#DCDDD2]/20 rounded-xl text-[#F6F4EC] placeholder-[#EAE8DD]/40 focus:outline-none focus:border-[#78866B] leading-relaxed resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveJournal}
                      disabled={savedSuccess || isSaving}
                      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
                        savedSuccess
                          ? 'bg-emerald-800 text-white cursor-default'
                          : 'bg-[#EAE8DD] hover:bg-white text-[#142B22]'
                      }`}
                    >
                      {savedSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Saved to IndexedDB Journal
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          {isSaving ? 'Saving...' : 'Save to Field Journal'}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-3 text-xs font-medium text-[#EAE8DD] hover:text-white bg-[#203D2F] hover:bg-[#203D2F]/80 border border-[#DCDDD2]/20 rounded-lg transition-colors"
                    >
                      Identify Another Organism
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Waiting / Exploration State */
              <div className="h-full min-h-[420px] rounded-2xl border border-dashed border-[#DCDDD2]/20 p-10 flex flex-col items-center justify-center text-center space-y-4 bg-[#203D2F]/20">
                <div className="w-16 h-16 rounded-full bg-[#203D2F] border border-[#78866B]/30 flex items-center justify-center text-[#94A386]">
                  <Compass className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="font-serif text-2xl font-normal text-[#F6F4EC]">
                    Observation Workspace Awaiting Input
                  </h3>
                  <p className="text-sm text-[#EAE8DD]/70 font-light leading-relaxed">
                    Upload a photograph or snap a picture with your camera. WildLens will identify the species, synthesize its natural history, and generate an outdoor exploration activity.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
