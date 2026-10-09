import { JournalEntry, IdentificationResult } from '../types/nature';
import { CURATED_STORIES } from '../data/curatedSpecimens';
import { ASSETS } from '../data/assets';

const DB_NAME = 'wildlens_field_journal_db';
const DB_VERSION = 1;
const STORE_NAME = 'observations';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Return sorted descending by savedAt
        const entries: JournalEntry[] = request.result || [];
        entries.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        resolve(entries);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable or error, falling back to empty list', err);
    return [];
  }
}

export async function saveJournalEntry(entry: IdentificationResult, personalNotes?: string, locationName?: string): Promise<JournalEntry> {
  const db = await openDb();
  const journalEntry: JournalEntry = {
    ...entry,
    personalNotes: personalNotes || '',
    locationName: locationName || 'Local Field Exploration',
    savedAt: entry.identifiedAt || new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(journalEntry);

    request.onsuccess = () => {
      resolve(journalEntry);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function updateJournalNotes(id: string, notes: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const entry: JournalEntry = getReq.result;
      if (!entry) {
        reject(new Error(`Entry ${id} not found`));
        return;
      }
      entry.personalNotes = notes;
      const putReq = store.put(entry);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

export async function toggleMissionStatus(entryId: string, completed: boolean): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(entryId);

    getReq.onsuccess = () => {
      const entry: JournalEntry = getReq.result;
      if (!entry) {
        reject(new Error(`Entry ${entryId} not found`));
        return;
      }
      if (entry.mission) {
        entry.mission.completed = completed;
      }
      const putReq = store.put(entry);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Complete set of 16 gentle field entries (minimum 4 per category: bird, plant, insect, tree)
const GENTLE_CURATED_ENTRIES: JournalEntry[] = [
  // --- BIRDS (4 entries) ---
  {
    ...CURATED_STORIES[0].sampleResult,
    id: 'journal-seed-1',
    photoUrl: ASSETS.cedarWaxwing,
    personalNotes: 'Observed near the edge of a dewy conifer grove at 7:15 AM. Traveled with a loose flock of six individuals feeding gently on cedar berries.',
    locationName: 'Pine Ridge Trailhead',
    savedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'journal-seed-bird-2',
    commonName: 'Eurasian Blue Tit',
    scientificName: 'Cyanistes caeruleus',
    category: 'bird',
    explanation: 'A gentle, acrobatic passerine with azure-blue crown feathers, a delicate lemon-yellow chest, and a serene posture while foraging among spring cherry blossoms.',
    facts: [
      'Able to see into the ultraviolet spectrum, allowing them to detect UV markings on feathers and identify ripe berries.',
      'Known for gentle hanging postures from the tips of twigs to inspect bud aphid colonies.',
      'Mated pairs frequently share quiet high-frequency trills to maintain contact within flowering canopies.'
    ],
    habitat: 'Deciduous woodlands, flowering orchards, and tranquil garden hedgerows.',
    mission: {
      id: 'mission-blue-tit',
      title: 'Blossom Twig Perch Observation',
      instruction: 'Find a flowering fruit tree in gentle morning light and listen for soft bell-like trills. Observe how the bird tests petal buds with light touches.',
      fieldBenefit: 'Attuning to delicate canopy foragers increases observational patience.',
      completed: true,
    },
    uncertaintyNote: 'Vivid azure cap and yellow breast provide definitive visual alignment.',
    photoUrl: ASSETS.gentleBlueTit,
    identifiedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Resting gently on a blooming cherry twig. Soft morning sunlight illuminating delicate powder-blue plumage.',
    locationName: 'Old Orchard Glade',
    savedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'journal-seed-bird-3',
    commonName: 'European Robin',
    scientificName: 'Erithacus rubecula',
    category: 'bird',
    explanation: 'A tranquil, inquisitive songbird renowned for its fluffy round silhouette, quiet dark eye, and soft terracotta-orange breast glowing against damp woodland moss.',
    facts: [
      'Each individual robin possesses a uniquely phrased, gentle melancholic flute-like song.',
      'Possesses cryptochrome photoreceptors in the eye that allow it to detect magnetic navigation lines.',
      'Often approaches peaceful gardeners and naturalists quietly to inspect turned woodland earth.'
    ],
    habitat: 'Temperate shaded woodlands, damp mossy river corridors, and quiet garden borders.',
    mission: {
      id: 'mission-robin',
      title: 'Stillness & Territorial Whistle',
      instruction: 'Sit on a fallen mossy log for 3 minutes without moving. Listen for a single sweet, high-pitched phrase repeated after a pause.',
      fieldBenefit: 'Teaches naturalist stillness and directional sound awareness.',
      completed: false,
    },
    uncertaintyNote: 'Distinctive rufous breast and olive-brown crown align with Erithacus.',
    photoUrl: ASSETS.gentleRobin,
    identifiedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Perched motionless on a decaying oak branch covered in lichen. Soft mist drifting through the understory.',
    locationName: 'Mossy Brook Hollow',
    savedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'journal-seed-bird-4',
    commonName: 'Barn Owl',
    scientificName: 'Tyto alba',
    category: 'bird',
    explanation: 'A serene twilight raptor characterized by a heart-shaped white facial disc, delicate honey-gold wing mottling, and silent velvet flight feathers designed for whisper-quiet flight.',
    facts: [
      'Heart-shaped facial disc functions as a parabolic acoustic reflector, funneling subtle rustles straight to its offset ears.',
      'Fringed leading-edge wing feathers break up air turbulence, allowing totally soundless flight.',
      'Can locate prey in complete darkness solely through acoustic triangulation.'
    ],
    habitat: 'Rough grasslands, quiet woodland margins, ancient hollow trees, and quiet meadows.',
    mission: {
      id: 'mission-barn-owl',
      title: 'Twilight Hollow Listening',
      instruction: 'At dusk, locate an ancient hollow tree at the woodland boundary. Listen for whisper-quiet rustles and soft rasping calls.',
      fieldBenefit: 'Trains nocturnal awareness and respect for silent predators.',
      completed: false,
    },
    uncertaintyNote: 'Heart-shaped facial disc and silky plumage confirm Tyto alba.',
    photoUrl: ASSETS.gentleBarnOwl,
    identifiedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Discovered resting calmly in a hollow oak cavity during early twilight. Peaceful, serene expression.',
    locationName: 'Elder Oak Copse',
    savedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },

  // --- PLANTS (4 entries) ---
  {
    ...CURATED_STORIES[1].sampleResult,
    id: 'journal-seed-2',
    photoUrl: ASSETS.fernFrond,
    personalNotes: 'Found along shaded creek bank where morning fog was lifting. Delicate dew pearls clinging to the inner crosier spiral.',
    locationName: 'Fern Valley Creek',
    savedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'journal-seed-plant-2',
    commonName: 'Wood Anemone',
    scientificName: 'Anemone nemorosa',
    category: 'plant',
    explanation: 'A delicate spring woodland ephemeral with six to eight luminous white petals with soft golden stamens, opening gently to greet morning sun filtering through bare branches.',
    facts: [
      'Petals close downward during rain and overcast periods to protect the delicate central pollen grains from humidity.',
      'Takes centuries to spread across a woodland floor, often serving as an indicator of ancient undisturbed woodland.',
      'Seed distribution is gently assisted by woodland ants who harvest nutrient-rich appendages called elaiosomes.'
    ],
    habitat: 'Ancient broadleaf woodlands, shaded limestone ravines, and mossy river valleys.',
    mission: {
      id: 'mission-anemone',
      title: 'Dew & Petal Angle Inspection',
      instruction: 'Find a woodland ephemeral flower and notice how its petals align toward the brightest patch of sky.',
      fieldBenefit: 'Reveals heliotropism in understory spring flora.',
      completed: false,
    },
    uncertaintyNote: 'Luminous six-petaled star form and palmately lobed basal leaves confirm Anemone nemorosa.',
    safetyNotice: 'WildLens Safety Advisory: Contains ranunculin; gentle observation only, do not consume.',
    photoUrl: ASSETS.gentleWoodAnemone,
    identifiedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Gently unfurled among damp fallen leaves. Fresh morning rain droplets resting like crystals on the petals.',
    locationName: 'Shaded Beech Hollow',
    savedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'journal-seed-plant-3',
    commonName: 'Common Star Moss',
    scientificName: 'Polytrichum commune',
    category: 'plant',
    explanation: 'A miniature emerald evergreen moss forming dense velvet cushions across the forest floor, each leaf arranged like a pointed green star collecting luminous dew.',
    facts: [
      'Lacks true roots; absorbs water and dissolved ambient nutrients directly through leaf cell membranes.',
      'Possesses specialized internal water-conducting cells called hydroids, resembling primitive xylem.',
      'Can lose up to 90% of its moisture and spring back into vibrant emerald life within minutes of rain.'
    ],
    habitat: 'Humid forest floors, peaty woodland margins, damp shaded granite boulders.',
    mission: {
      id: 'mission-star-moss',
      title: 'Dew Drop Surface Tension',
      instruction: 'Gently lean close to a patch of star moss and look for single dew drops suspended between the pointed leaf stars.',
      fieldBenefit: 'Attuning to macro-scale water physics on living surfaces.',
      completed: true,
    },
    uncertaintyNote: 'Star-shaped pointed phyllid arrangement confirms Polytrichum genus.',
    photoUrl: ASSETS.gentleStarMoss,
    identifiedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'A soft, luminous green carpet under conifer needles. Completely covered in minute spherical dewdrops.',
    locationName: 'Highland Pine Floor',
    savedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'journal-seed-plant-4',
    commonName: 'Harebell (Wild Bluebell)',
    scientificName: 'Campanula rotundifolia',
    category: 'plant',
    explanation: 'A graceful, slender perennial wildflower with nodding lavender-blue bell flowers that sway gently with the slightest woodland breeze.',
    facts: [
      'Slender wiry stems allow the flower to bend freely in strong winds without snapping.',
      'Nodding downward-facing bells shelter inner nectar glands from morning rain and heavy dew.',
      'Has symbolized humility and constancy in traditional botanical lore for centuries.'
    ],
    habitat: 'Dry meadows, sandy heathlands, grassy hillsides, and peaceful sunlit clearings.',
    mission: {
      id: 'mission-harebell',
      title: 'Breeze Rhythm Tracking',
      instruction: 'Watch a cluster of nodding bellflowers for 2 minutes. Notice the gentle rhythmic sway in response to air currents.',
      fieldBenefit: 'Teaches appreciation of aerodynamic plant adaptations in open landscapes.',
      completed: false,
    },
    uncertaintyNote: 'Pendant bell blossom and papery blue corolla lobes confirm Campanula.',
    photoUrl: ASSETS.gentleBluebell,
    identifiedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Dozens of nodding pale violet bells scattered through misty morning grassland. Delicate sunrise glow.',
    locationName: 'Dewy Highland Meadow',
    savedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },

  // --- TREES (4 entries) ---
  {
    ...CURATED_STORIES[3].sampleResult,
    id: 'journal-seed-4',
    photoUrl: ASSETS.ancientOak,
    personalNotes: 'Found an ancient moss-draped patriarch standing in the lower valley glade. Deeply furrowed bark colonized by epiphytic ferns and lichens.',
    locationName: 'Ancient Oak Wood Pasture',
    savedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 'journal-seed-tree-2',
    commonName: 'Silver Birch',
    scientificName: 'Betula pendula',
    category: 'tree',
    explanation: 'An elegant woodland tree with chalk-white peeling bark, dark horizontal lenticels, and gentle drooping twigs clothed in shimmering triangular leaves.',
    facts: [
      'The white bark contains betulin, a natural resin that repels fungi and reflects solar heat in cold climates.',
      'Acts as a pioneer tree species, restoring degraded soil and sheltering slower-growing saplings like oak.',
      'Pliable twigs were historically used in gentle crafts and woven forest shelters.'
    ],
    habitat: 'Heathlands, open light woods, moorland fringes, and sunny woodland clearings.',
    mission: {
      id: 'mission-birch',
      title: 'Bark Paper & Lenticel Inspection',
      instruction: 'Find a mature silver birch and inspect where paper-thin bark strips peel away naturally without tearing.',
      fieldBenefit: 'Understanding bark transpiration mechanisms and lenticel breathing pores.',
      completed: true,
    },
    uncertaintyNote: 'Characteristic papery white bark with diamond-shaped black fissures confirms Betula pendula.',
    photoUrl: ASSETS.gentleSilverBirch,
    identifiedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Golden leaves filtering soft autumn light in a quiet birch glade. White trunks gleaming softly.',
    locationName: 'Birchwood Trail',
    savedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'journal-seed-tree-3',
    commonName: 'Weeping Willow',
    scientificName: 'Salix babylonica',
    category: 'tree',
    explanation: 'A serene waterside tree with gracefully cascading branches that trail down like green curtains, brushing the tranquil surface of mist-veiled ponds.',
    facts: [
      'Contains salicin in its bark, the natural biochemical precursor from which aspirin was synthesized.',
      'Flexible pendulous branch architecture sheds heavy wind loads without breaking.',
      'Extensive root networks absorb bank runoff, stabilizing river and pond edges against erosion.'
    ],
    habitat: 'Riparian river corridors, tranquil pond edges, lake margins, and moist wetlands.',
    mission: {
      id: 'mission-willow',
      title: 'Water Reflection & Drooping Fronds',
      instruction: 'Stand quietly by a waterside willow and observe where the tips touch the water. Notice the gentle circular ripples created by branch movement.',
      fieldBenefit: 'Deepens appreciation for riparian ecology and water surface tension.',
      completed: false,
    },
    uncertaintyNote: 'Dramatic pendulous branch growth and narrow lanceolate leaves confirm Salix babylonica.',
    photoUrl: ASSETS.gentleWeepingWillow,
    identifiedAt: new Date(Date.now() - 86400000 * 11).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Whispering green willow trails dipping into a glass-calm morning pond. Complete stillness.',
    locationName: 'Willow Brook Tarn',
    savedAt: new Date(Date.now() - 86400000 * 11).toISOString(),
  },
  {
    id: 'journal-seed-tree-4',
    commonName: 'Japanese Mountain Maple',
    scientificName: 'Acer palmatum',
    category: 'tree',
    explanation: 'A graceful understory tree with delicate hand-lobed lacy foliage, growing beside mossy forest streams with calm Japanese garden aesthetics.',
    facts: [
      'Leaves have 5 to 9 deep lobes with delicate serrated margins that maximize filtered light absorption.',
      'Thrives in shaded humid microclimates along mossy woodland brooks.',
      'Cultivated for centuries for its serene calming form and luminous seasonal leaf transitions.'
    ],
    habitat: 'Sheltered humid mountain valleys, streamside slopes, and mossy temperate ravines.',
    mission: {
      id: 'mission-maple',
      title: 'Filtered Light Vein Architecture',
      instruction: 'Find a delicate maple leaf and hold it against filtered stream sunlight. Trace the radiating hand-like palm veins.',
      fieldBenefit: 'Understanding palmate hydraulic distribution in shade-adapted deciduous trees.',
      completed: false,
    },
    uncertaintyNote: 'Delicate five-lobed palmate structure and slender shoots confirm Acer palmatum.',
    photoUrl: ASSETS.gentleJapaneseMaple,
    identifiedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Graceful curving trunk leaning gently over a crystal-clear mossy brook. Gentle dappled sunshine.',
    locationName: 'Moss Creek Ravine',
    savedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },

  // --- INSECTS (4 entries) ---
  {
    ...CURATED_STORIES[2].sampleResult,
    id: 'journal-seed-3',
    photoUrl: ASSETS.monarchMacro,
    personalNotes: 'Observed resting gently on wild mountain lilac after morning rain. Dew droplets beaded across its chitin wing scales as the sun warmed the meadow.',
    locationName: 'Sunlit Meadow Clearing',
    savedAt: new Date(Date.now() - 86400000 * 13).toISOString(),
  },
  {
    id: 'journal-seed-insect-2',
    commonName: 'Western Honeybee',
    scientificName: 'Apis mellifera',
    category: 'insect',
    explanation: 'A gentle, industrious pollinator dusted in golden pollen, tenderly probing the nectar heart of pale pink apple blossoms in peaceful morning warmth.',
    facts: [
      'Communicates the direction and distance of rich floral sources through intricate waggle dances in the dark hive.',
      'Possesses specialized pollen baskets (corbiculae) with microscopic hairs on their hind legs to carry pollen grains.',
      'Flaps its wings approximately 230 times per second, generating gentle acoustic humming.'
    ],
    habitat: 'Flowering fruit orchards, wildflower meadows, sunny woodland margins, and garden beds.',
    mission: {
      id: 'mission-honeybee',
      title: 'Gentle Pollen Basket Observation',
      instruction: 'Watch a foraging bee from a respectful 2-foot distance. Notice the bright yellow or orange pollen pellets packed onto its hind legs.',
      fieldBenefit: 'Cultivates peaceful, calm observational proximity to beneficial pollinators.',
      completed: true,
    },
    uncertaintyNote: 'Golden-amber banded abdomen, hairy thorax, and corbicular structure confirm Apis mellifera.',
    safetyNotice: 'WildLens Safety Advisory: Always observe foraging bees peacefully without swatting or obstructing their flight path.',
    photoUrl: ASSETS.gentleHoneybee,
    identifiedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Softly gathering nectar on wild apple blossoms. Covered in delicate yellow pollen dust.',
    locationName: 'Apple Blossom Row',
    savedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'journal-seed-insect-3',
    commonName: 'Emerald Damselfly',
    scientificName: 'Lestes sponsa',
    category: 'insect',
    explanation: 'A slender, delicate wetland insect with metallic turquoise body segments and crystalline translucent wings, resting peacefully along morning water reeds.',
    facts: [
      'Folds its wings gently backward along its slender abdomen while resting, unlike true dragonflies which hold wings spread.',
      'Compound eyes have over 28,000 ommatidia lenses providing an almost 360-degree field of view.',
      'Has inhabited freshwater ecosystems virtually unchanged since the Carboniferous era, 300 million years ago.'
    ],
    habitat: 'Quiet reed-fringed ponds, calm marshlands, peat bogs, and sheltered lakeside coves.',
    mission: {
      id: 'mission-damselfly',
      title: 'Crystalline Wing Vein Transparency',
      instruction: 'Observe a perched damselfly against the morning sky. Notice the delicate stained-glass vein grid in its glassy wings.',
      fieldBenefit: 'Appreciating lightweight micro-structural engineering in aquatic insects.',
      completed: false,
    },
    uncertaintyNote: 'Slender metallic turquoise body and wing posture confirm Lestes genus.',
    photoUrl: ASSETS.gentleDamselfly,
    identifiedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Clinging serenely to a slender green reed tip with microscopic dewdrops on its thorax. Pastel background waters.',
    locationName: 'Reed Marsh Lagoon',
    savedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'journal-seed-insect-4',
    commonName: 'Luna Moth',
    scientificName: 'Actias luna',
    category: 'insect',
    explanation: 'An ethereal nocturnal silk moth with pale seafoam-green wings, delicate twisting hindwing tails, and soft feather-like golden antennae, resting serenely on a birch leaf.',
    facts: [
      'The long twisted hindwing tails disrupt the echolocation sonar clicks of hunting bats.',
      'Adults do not feed; their sole gentle purpose over a one-week adult lifespan is finding a mate in peaceful night air.',
      'Possesses translucent circular eyespots rimmed in violet and yellow to deter predators.'
    ],
    habitat: 'Deciduous hardwood forests, birch woodlands, and quiet mountain valleys.',
    mission: {
      id: 'mission-luna-moth',
      title: 'Feather Antenna Structure Observation',
      instruction: 'If you encounter a silk moth at rest, carefully observe its bipectinate feathery antennae under a gentle beam of red light.',
      fieldBenefit: 'Understanding biological pheromone detection sensitivity in nocturnal Lepidoptera.',
      completed: false,
    },
    uncertaintyNote: 'Seafoam green coloration, elongated hindwing tails, and distinct eyespots confirm Actias luna.',
    photoUrl: ASSETS.gentleLunaMoth,
    identifiedAt: new Date(Date.now() - 86400000 * 16).toISOString(),
    inferenceProvider: 'curated_specimen',
    providerLabel: 'Gentle Field Specimen',
    confidenceDescriptor: 'High visual alignment',
    personalNotes: 'Discovered resting calmly under a silver birch leaf at dawn. Breathtaking seafoam green hue with feathery golden antennae.',
    locationName: 'Birch Ridge Crest',
    savedAt: new Date(Date.now() - 86400000 * 16).toISOString(),
  },
];

/**
 * Seed initial sample observations including bird, plant, insect, and tree,
 * ensuring all four nature categories have at least 4 gentle entries in the field journal.
 */
export async function seedCuratedJournalIfEmpty(): Promise<JournalEntry[]> {
  try {
    const existing = await getAllJournalEntries();
    const existingIds = new Set(existing.map((e) => e.id));
    let addedAny = false;

    // Check all 16 gentle curated entries and ensure they exist
    for (const entry of GENTLE_CURATED_ENTRIES) {
      if (!existingIds.has(entry.id)) {
        await saveJournalEntry(entry, entry.personalNotes, entry.locationName);
        addedAny = true;
      }
    }

    if (addedAny || existing.length === 0) {
      return await getAllJournalEntries();
    }

    return existing;
  } catch (e) {
    console.error('Error seeding initial journal entries:', e);
    return [];
  }
}
