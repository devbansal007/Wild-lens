# WildLens — Immersive AI Nature Discovery & Field Journal

> Built for the **“Touch Grass” Open-Source AI Challenge**.
> Discover the living world around you. Identify plants, birds, trees, and insects through photography, learn their natural history, and cultivate a living field journal.

---

## 🌿 Overview

**WildLens** is an art-directed nature identification and ecological observation application. Inspired by cinematic natural history documentaries and field journals, WildLens combines high-resolution wildlife photography, open-weight vision-language intelligence, and sensory outdoor missions to encourage exploration of real-world ecosystems.

---

## ⚡ Key Features

- **Cinematic Discovery**: Editorial catalog showcasing four primary wildlife taxonomies: *Birds of the wild*, *The language of leaves*, *Tiny worlds*, and *Trees and forests*.
- **Live Multimodal Identification**:
  - Drag-and-drop or file upload for high-resolution photographs.
  - Device camera access with live viewfinder, aspect ratio preservation, and frame capture.
  - Pre-loaded specimen photographs for quick field testing.
- **Replaceable Vision Architecture**:
  - **Local Open-Weight Model**: Compatible with `Qwen2.5-VL-7B-Instruct` or `Qwen2.5-VL-3B-Instruct` running locally via Ollama.
  - **Server-Side Multimodal AI**: High-speed identification via Gemini 3.8 Flash Vision without exposing client-side credentials.
  - **Curated Field Archive**: Offline field specimen catalog for hermetic or offline expeditions.
- **Ecological Narratives & Scientific Rigor**:
  - Common and binomial scientific names.
  - Three distinct verified ecological facts per specimen.
  - Habitat descriptions and truthful assessment notes.
  - Automatic safety advisories for wild plants and insects.
- **Field Journal with IndexedDB**:
  - Saved observations, custom field notes, and photographs persist directly in browser storage across sessions.
  - Category filtering and search.
  - Inline note editing and deletion with confirmation.
- **Sensory Nature Missions**:
  - Short outdoor activities (e.g. leaf venation comparison, bioacoustic stillness, pollinator dwell timing) that encourage users to look away from their screen and engage with their environment.

---

## 🧠 Open-Weight AI Architecture & License

| Component | Specification | License |
|---|---|---|
| **Primary Open Model** | `Qwen2.5-VL-7B-Instruct` / `3B-Instruct` | Apache 2.0 |
| **Local Runtime** | Ollama (`http://127.0.0.1:11434`) | MIT |
| **Cloud Multimodal Fallback** | Gemini 3.8 Flash Vision (Proxy Server) | Proprietary API via Google GenAI SDK |
| **Storage Engine** | Browser Native IndexedDB | Client-side W3C Standard |

### Hardware Requirements for Local Inference
- **Qwen2.5-VL-7B**: Recommended 16GB RAM + 8GB VRAM (Apple Silicon M-series unified memory or NVIDIA RTX 3060+).
- **Qwen2.5-VL-3B**: Recommended 8GB RAM + 4GB VRAM.
- **Gemini 3.8 Flash / Curated Fallback**: Runs on any modern browser and laptop with standard hardware.

---

## 🔒 Privacy & Data Sovereignty

- **Client-Side Persistence**: Your saved field journal entries, personal notes, and high-resolution images are stored locally in your browser's **IndexedDB**.
- **No Third-Party Tracking**: No telemetry, tracking pixels, or intrusive user analytics.
- **Explicit Image Dispatch**: Photographs are never transmitted to external servers unless you trigger AI Identification while configured in Cloud mode.
- **Zero API Key Exposure**: Server-side proxy keeps all keys completely out of browser bundles.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration (Optional for Cloud AI)
Copy `.env.example` to `.env` if you wish to use server-side Gemini 3.8 Flash:
```bash
cp .env.example .env
```
*(If no API key is configured, WildLens will automatically guide you with local open-weight Ollama setup or use the Curated Field Archive!)*

### 3. Local Open-Weight Model Setup with Ollama (Optional)
To run fully offline inference with open-weight model weights:
```bash
# Pull and start the vision model
ollama run qwen2.5-vl
```
WildLens defaults to querying `http://127.0.0.1:11434` when the Local Qwen2.5-VL mode is enabled.

### 4. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build and Production Deployment

To compile and verify production build:
```bash
npm run build
npm start
```
