/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { DiscoverSection } from './components/DiscoverSection';
import { IdentifyWorkspace } from './components/IdentifyWorkspace';
import { FieldJournal } from './components/FieldJournal';
import { NatureMissionsView } from './components/NatureMissionsView';
import { ModelArchitectureModal } from './components/ModelArchitectureModal';
import { Footer } from './components/Footer';
import { IdentificationResult, JournalEntry, NatureCategory } from './types/nature';
import { getAllJournalEntries, seedCuratedJournalIfEmpty } from './storage/journalDb';

export default function App() {
  const [activeTab, setActiveTab] = useState<'discover' | 'identify' | 'journal' | 'missions'>('discover');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedSpecimen, setSelectedSpecimen] = useState<IdentificationResult | null>(null);
  const [targetCategory, setTargetCategory] = useState<NatureCategory>('unsure');
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);

  // Load or seed journal entries on initial mount
  const refreshJournal = async () => {
    try {
      const entries = await seedCuratedJournalIfEmpty();
      setJournalEntries(entries);
    } catch (err) {
      console.error('Failed to load journal entries from IndexedDB:', err);
    }
  };

  useEffect(() => {
    refreshJournal();
  }, []);

  // Handle selecting a specimen from the editorial Discover section
  const handleSelectSpecimen = (result: IdentificationResult) => {
    setSelectedSpecimen(result);
    setActiveTab('identify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToIdentify = (categoryHint?: string) => {
    if (categoryHint && ['plant', 'bird', 'tree', 'insect'].includes(categoryHint)) {
      setTargetCategory(categoryHint as NatureCategory);
    } else {
      setTargetCategory('unsure');
    }
    setSelectedSpecimen(null);
    setActiveTab('identify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavedToJournal = (_saved: IdentificationResult) => {
    refreshJournal();
  };

  return (
    <div className="min-h-screen bg-[#142B22] text-[#F6F4EC] flex flex-col font-sans selection:bg-[#78866B] selection:text-white">
      {/* Top Bar Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenModelInfo={() => setIsModelModalOpen(true)}
        journalCount={journalEntries.length}
      />

      {/* Main View Port Routing */}
      <main className="flex-1">
        {activeTab === 'discover' && (
          <>
            <Hero
              onStartExploring={() => {
                setActiveTab('identify');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenJournal={() => {
                setActiveTab('journal');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <DiscoverSection
              onSelectSpecimen={handleSelectSpecimen}
              onNavigateToIdentify={handleNavigateToIdentify}
            />
          </>
        )}

        {activeTab === 'identify' && (
          <IdentifyWorkspace
            initialCategory={targetCategory}
            externalSpecimenResult={selectedSpecimen}
            onClearExternalSpecimen={() => setSelectedSpecimen(null)}
            onSavedToJournal={handleSavedToJournal}
          />
        )}

        {activeTab === 'journal' && (
          <FieldJournal
            entries={journalEntries}
            onRefreshEntries={refreshJournal}
            onNavigateToIdentify={() => {
              setActiveTab('identify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'missions' && (
          <NatureMissionsView
            onNavigateToIdentify={() => {
              setActiveTab('identify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Open-Weight AI Architecture and Privacy Modal */}
      <ModelArchitectureModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
      />

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenModelInfo={() => setIsModelModalOpen(true)}
      />
    </div>
  );
}
