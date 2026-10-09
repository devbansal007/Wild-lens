export type NatureCategory = 'plant' | 'bird' | 'tree' | 'insect' | 'unsure';

export interface NatureMission {
  id: string;
  title: string;
  instruction: string;
  fieldBenefit: string;
  completed: boolean;
}

export interface IdentificationResult {
  id: string;
  commonName: string;
  scientificName: string;
  category: NatureCategory;
  explanation: string;
  facts: [string, string, string];
  habitat: string;
  mission: NatureMission;
  uncertaintyNote: string;
  safetyNotice?: string;
  photoUrl: string;
  identifiedAt: string; // ISO date
  inferenceProvider: 'live_gemini' | 'local_openweight' | 'curated_specimen';
  providerLabel: string;
  confidenceDescriptor: string; // e.g. "High visual alignment", "Preliminary field match"
  latencyMs?: number;
}

export interface JournalEntry extends IdentificationResult {
  personalNotes?: string;
  locationName?: string;
  savedAt: string;
}

export interface CuratedStory {
  id: string;
  category: NatureCategory;
  categoryDisplay: string;
  title: string;
  subtitle: string;
  scientificName: string;
  imageUrl: string;
  aspectRatio: string;
  story: string;
  fieldNotes: string;
  habitat: string;
  missionSnippet: string;
  sampleResult: IdentificationResult;
}
