import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase JSON payload limit to accept base64 camera/uploaded photographs
app.use(express.json({ limit: '25mb' }));

const geminiApiKey = process.env.GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health and provider status endpoint
app.get('/api/inference/status', (_req, res) => {
  res.json({
    hasGeminiKey: Boolean(geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY'),
    providers: [
      {
        id: 'gemini',
        name: 'Gemini 3.8 Flash Vision (Cloud)',
        status: geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY' ? 'ready' : 'key_missing',
        description: 'High-speed multimodal foundation vision model with deep biological taxonomy taxonomy comprehension.',
      },
      {
        id: 'ollama',
        name: 'Qwen2.5-VL / Local Open-Weight (Ollama)',
        status: 'configurable',
        description: 'Privacy-first local open-weight vision model running on http://127.0.0.1:11434.',
      },
      {
        id: 'curated',
        name: 'Curated Field Specimen Archive (Offline Demo)',
        status: 'ready',
        description: 'Verified botanical and zoological reference records for instant offline exploration.',
      },
    ],
  });
});

// AI identification endpoint
app.post('/api/identify', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      categoryHint = 'unsure',
      provider = 'auto',
      ollamaUrl = 'http://127.0.0.1:11434',
      ollamaModel = 'qwen2.5-vl',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided for identification.' });
    }

    // Strip data prefix if present (e.g. data:image/jpeg;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    // 1. Try local Ollama if explicitly requested
    if (provider === 'ollama') {
      try {
        const ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages: [
              {
                role: 'user',
                content: `You are an expert field naturalist. Identify the organism in this photograph (category hint: ${categoryHint}). Return valid JSON with keys: commonName, scientificName, category ("plant"|"bird"|"tree"|"insect"|"unsure"), explanation, facts (array of 3 strings), habitat, missionTitle, missionInstruction, missionBenefit, uncertaintyNote, safetyNotice.`,
                images: [cleanBase64],
              },
            ],
            stream: false,
            format: 'json',
          }),
        });

        if (ollamaResponse.ok) {
          const ollamaData = await ollamaResponse.json();
          const parsed = JSON.parse(ollamaData.message?.content || '{}');
          return res.json({
            id: `id-${Date.now()}`,
            commonName: parsed.commonName || 'Unspecified Organism',
            scientificName: parsed.scientificName || 'Incertae sedis',
            category: parsed.category || categoryHint || 'unsure',
            explanation: parsed.explanation || 'Visual analysis completed using local vision model weights.',
            facts: Array.isArray(parsed.facts) && parsed.facts.length >= 3 ? parsed.facts.slice(0, 3) : [
              'Morphological features evaluated via local tensor inference.',
              'No external cloud transmission required for this observation.',
              'Inspect physical field traits to substantiate visual classification.'
            ],
            habitat: parsed.habitat || 'Temperate field ecosystem',
            mission: {
              id: `mission-${Date.now()}`,
              title: parsed.missionTitle || 'Field Vein & Color Observation',
              instruction: parsed.missionInstruction || 'Observe how natural light changes the organism’s coloration over 3 minutes.',
              fieldBenefit: parsed.missionBenefit || 'Develops deep observational attentiveness in nature.',
              completed: false,
            },
            uncertaintyNote: parsed.uncertaintyNote || 'Local open-weight classification based on image resolution and lighting.',
            safetyNotice: parsed.safetyNotice || (['plant', 'insect'].includes(parsed.category) ? 'WildLens Safety Advisory: Do not touch or ingest wild specimens without expert taxonomic confirmation.' : undefined),
            photoUrl: imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${cleanBase64}`,
            identifiedAt: new Date().toISOString(),
            inferenceProvider: 'local_openweight',
            providerLabel: `Qwen2.5-VL (${ollamaModel} Local)`,
            confidenceDescriptor: 'Open-weight inference match',
            latencyMs: Date.now() - startTime,
          });
        }
      } catch (ollamaErr) {
        console.warn('Ollama local inference failed, falling back to Gemini if available:', ollamaErr);
      }
    }

    // 2. Use Gemini Vision if API key is configured
    if (ai && geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
      const promptText = `You are WildLens, a senior field naturalist and biological taxonomist.
Examine this nature photograph with high scientific precision.
User category hint: "${categoryHint}".
Determine the organism's species (or most likely genus/family if obscured).

Provide accurate natural history details in JSON format.
Adhere strictly to truthfulness: never fabricate scientific names. If the image is ambiguous or blurry, explicitly describe the ambiguity in uncertaintyNote.
Include a specific outdoor "Nature Mission" that the user can immediately perform in the real world to observe this or similar organisms without damaging them.
If the specimen is a plant, mushroom/fungus, or insect, provide a sensible safety advisory.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              commonName: { type: Type.STRING, description: 'Standard common name of species' },
              scientificName: { type: Type.STRING, description: 'Binomial scientific name (e.g. Danaus plexippus)' },
              category: {
                type: Type.STRING,
                description: 'One of: plant, bird, tree, insect, unsure'
              },
              explanation: { type: Type.STRING, description: 'Engaging, scientifically accurate explanation of the species (2-3 sentences)' },
              facts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Exactly 3 fascinating, verified biological or ecological facts'
              },
              habitat: { type: Type.STRING, description: 'Typical natural habitat and ecosystem' },
              missionTitle: { type: Type.STRING, description: 'Short action title for outdoor observation' },
              missionInstruction: { type: Type.STRING, description: 'Concise step-by-step outdoor activity to connect with nature' },
              missionBenefit: { type: Type.STRING, description: 'Why this observation activity trains naturalist skills' },
              uncertaintyNote: { type: Type.STRING, description: 'Truthful assessment of visual alignment and possible lookalikes' },
              safetyNotice: { type: Type.STRING, description: 'Safety warning regarding wild consumption or contact if applicable' }
            },
            required: ['commonName', 'scientificName', 'category', 'explanation', 'facts', 'habitat', 'missionTitle', 'missionInstruction', 'missionBenefit', 'uncertaintyNote']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const category = (['plant', 'bird', 'tree', 'insect', 'unsure'].includes(parsed.category) ? parsed.category : categoryHint) as any;

      return res.json({
        id: `id-${Date.now()}`,
        commonName: parsed.commonName || 'Unknown Nature Specimen',
        scientificName: parsed.scientificName || 'Incertae sedis',
        category,
        explanation: parsed.explanation || 'Visual analysis completed by WildLens naturalist vision system.',
        facts: Array.isArray(parsed.facts) && parsed.facts.length >= 3 ? parsed.facts.slice(0, 3) : [
          'Morphology identified through visual pattern alignment.',
          'Plays an integral role in local biodiversity dynamics.',
          'Look closely for micro-textures and seasonal adaptations.'
        ],
        habitat: parsed.habitat || 'Woodland and meadow edge ecosystems',
        mission: {
          id: `mission-${Date.now()}`,
          title: parsed.missionTitle || 'Field Texture Observation',
          instruction: parsed.missionInstruction || 'Observe how sunlight interacts with the organism’s surface for 2 minutes.',
          fieldBenefit: parsed.missionBenefit || 'Sharpens your observational acuity in the field.',
          completed: false,
        },
        uncertaintyNote: parsed.uncertaintyNote || 'Identified with high visual alignment to diagnostic field markings.',
        safetyNotice: parsed.safetyNotice || (['plant', 'insect'].includes(category) ? 'WildLens Safety Advisory: Never ingest or handle wild plants or insects based solely on photographic identification.' : undefined),
        photoUrl: imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${cleanBase64}`,
        identifiedAt: new Date().toISOString(),
        inferenceProvider: 'live_gemini',
        providerLabel: 'Gemini 3.8 Flash Vision (Cloud)',
        confidenceDescriptor: 'Live multimodal visual classification',
        latencyMs: Date.now() - startTime,
      });
    }

    // 3. Fallback when neither cloud key nor local ollama responded:
    // Inform the client gracefully
    return res.status(503).json({
      error: 'AI vision backend is not configured with an API key and local Ollama is offline.',
      code: 'MODEL_UNAVAILABLE',
      suggestion: 'You can explore using the Curated Field Specimens archive or configure a local open-weight model.',
    });
  } catch (error: any) {
    console.error('Identification error in /api/identify:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process image identification.',
      code: 'INFERENCE_FAILED',
    });
  }
});

// Vite middleware mounting for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WildLens full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
