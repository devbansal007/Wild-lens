import React, { useState } from 'react';
import {
  Trash2,
  Edit3,
  Calendar,
  MapPin,
  Check,
  X,
  Compass,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  BookOpen,
  Play,
  Pause,
  Eye
} from 'lucide-react';
import { JournalEntry, NatureCategory } from '../types/nature';
import { updateJournalNotes, deleteJournalEntry, toggleMissionStatus } from '../storage/journalDb';
import { ASSETS } from '../data/assets';

interface FieldJournalProps {
  entries: JournalEntry[];
  onRefreshEntries: () => void;
  onNavigateToIdentify: () => void;
}

export const FieldJournal: React.FC<FieldJournalProps> = ({
  entries,
  onRefreshEntries,
  onNavigateToIdentify,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEntry, setExpandedEntry] = useState<JournalEntry | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoopPaused, setIsLoopPaused] = useState<boolean>(false);

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesCategory =
      selectedCategory === 'all' || entry.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      entry.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.personalNotes && entry.personalNotes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Create seamless repeated items for infinite horizontal loop
  // Ensure track has sufficient items to fill widescreen display and loop smoothly
  const getRepeatedItems = (items: JournalEntry[]) => {
    if (items.length === 0) return [];
    let repeated = [...items];
    while (repeated.length < 12) {
      repeated = [...repeated, ...items];
    }
    // Duplicate the entire set to allow 50% translation infinite loop
    return [...repeated, ...repeated];
  };

  const loopedEntries = getRepeatedItems(filteredEntries);

  const handleStartEdit = (entry: JournalEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(entry.id);
    setEditText(entry.personalNotes || '');
    setExpandedEntry(entry);
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await updateJournalNotes(id, editText);
      setEditingId(null);
      onRefreshEntries();
      if (expandedEntry && expandedEntry.id === id) {
        setExpandedEntry({ ...expandedEntry, personalNotes: editText });
      }
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await deleteJournalEntry(id);
      setConfirmDeleteId(null);
      if (expandedEntry?.id === id) {
        setExpandedEntry(null);
      }
      onRefreshEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const handleToggleMission = async (entryId: string, currentStatus: boolean, e?: React.MouseEvent | React.ChangeEvent) => {
    e?.stopPropagation();
    try {
      await toggleMissionStatus(entryId, !currentStatus);
      onRefreshEntries();
      if (expandedEntry && expandedEntry.id === entryId && expandedEntry.mission) {
        setExpandedEntry({
          ...expandedEntry,
          mission: { ...expandedEntry.mission, completed: !currentStatus },
        });
      }
    } catch (err) {
      console.error('Failed to toggle mission status:', err);
    }
  };

  return (
    <section id="journal" className="py-24 bg-[#142B22] text-[#F6F4EC] min-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#DCDDD2]/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#94A386] uppercase">
              <span>Personal Observation Archive</span>
              <span aria-hidden="true">·</span>
              <span>Smooth Continuous Gallery</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F6F4EC]">
              Field Journal
            </h2>
            <p className="text-sm sm:text-base text-[#EAE8DD]/75 max-w-xl font-light">
              Your living repository of nature encounters. Observations move in a continuous horizontal stream from right to left—hover or click any photograph to pause and examine.
            </p>
          </div>

          {/* Search, Filter Tabs & Motion Control */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Play/Pause Motion Toggle */}
            <button
              onClick={() => setIsLoopPaused(!isLoopPaused)}
              className="px-3 py-2 text-xs font-mono rounded-lg bg-[#203D2F] border border-[#DCDDD2]/15 text-[#EAE8DD] hover:text-white flex items-center justify-center gap-2 transition-colors shrink-0"
              title={isLoopPaused ? 'Resume scrolling' : 'Pause scrolling'}
            >
              {isLoopPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resume Gallery</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#94A386]" />
                  <span>Pause Gallery</span>
                </>
              )}
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A386]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search encounters..."
                className="pl-8 pr-3 py-2 text-xs bg-[#203D2F] border border-[#DCDDD2]/15 rounded-lg text-[#F6F4EC] placeholder-[#EAE8DD]/40 focus:outline-none focus:border-[#78866B] w-full sm:w-44"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#203D2F] rounded-lg border border-[#DCDDD2]/10 text-xs">
              {['all', 'plant', 'bird', 'tree', 'insect'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#EAE8DD] text-[#142B22] font-semibold'
                      : 'text-[#EAE8DD]/70 hover:text-[#F6F4EC]'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {entries.length === 0 ? (
        /* Empty State */
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <div className="relative rounded-3xl overflow-hidden bg-[#203D2F] border border-[#DCDDD2]/10 p-10 md:p-16 text-center max-w-3xl mx-auto shadow-2xl">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#142B22] border border-[#78866B]/30 flex items-center justify-center text-[#94A386]">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-3xl font-normal text-[#F6F4EC]">
                  Every discovery starts somewhere.
                </h3>
                <p className="text-base text-[#EAE8DD]/80 font-light leading-relaxed">
                  Your field journal is waiting for its first observation.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateToIdentify}
                className="px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#142B22] bg-[#EAE8DD] hover:bg-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <span>Identify your first discovery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="max-w-7xl mx-auto px-6 mt-16 text-center py-16 space-y-3">
          <p className="font-serif text-2xl text-[#F6F4EC]">No matching observations</p>
          <p className="text-xs text-[#EAE8DD]/60">
            Try adjusting your category filter or search query.
          </p>
        </div>
      ) : (
        /* Single Horizontal Row Moving Continuously in a Repeating Loop from Right to Left */
        <div className="mt-12 relative w-full overflow-hidden">
          {/* Subtle edge gradient masks for gentle vignette fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#142B22] to-transparent z-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#142B22] to-transparent z-20" />

          {/* Continuous Loop Ribbon Track */}
          <div
            className={`flex items-stretch gap-6 py-4 animate-marquee-left ${
              isLoopPaused ? 'animation-paused' : ''
            }`}
          >
            {loopedEntries.map((entry, idx) => (
              <div
                key={`${entry.id}-loop-${idx}`}
                onClick={() => setExpandedEntry(entry)}
                className="w-[310px] sm:w-[350px] shrink-0 group rounded-2xl bg-[#203D2F]/70 border border-[#DCDDD2]/15 overflow-hidden flex flex-col justify-between hover:border-[#78866B] transition-all duration-300 shadow-xl cursor-pointer hover:-translate-y-1"
              >
                <div>
                  {/* Photo with Natural Aspect Ratio */}
                  <div className="relative aspect-[4/3] bg-[#142B22] overflow-hidden">
                    <img
                      src={entry.photoUrl}
                      alt={entry.commonName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#142B22]/95 via-[#142B22]/20 to-transparent" />

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#142B22] bg-[#EAE8DD] rounded-md font-semibold shadow-sm">
                        {entry.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 space-y-0.5">
                      <h4 className="font-serif text-xl font-medium text-[#F6F4EC] leading-tight group-hover:text-white">
                        {entry.commonName}
                      </h4>
                      <p className="font-serif italic text-xs text-[#94A386]">
                        {entry.scientificName}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#94A386] font-mono border-b border-[#DCDDD2]/10 pb-2.5">
                      <span>{new Date(entry.savedAt).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-[140px]">{entry.locationName || 'Field Station'}</span>
                    </div>

                    <p className="text-xs text-[#EAE8DD]/80 line-clamp-2 leading-relaxed font-light">
                      {entry.personalNotes ? `“${entry.personalNotes}”` : entry.explanation}
                    </p>

                    {entry.mission && (
                      <div className="p-2.5 rounded-lg bg-[#142B22]/80 border border-[#DCDDD2]/10 flex items-center justify-between text-[11px]">
                        <span className="text-[#94A386] truncate max-w-[190px]">
                          {entry.mission.title}
                        </span>
                        <span className={entry.mission.completed ? 'text-emerald-400 font-mono' : 'text-[#EAE8DD]/50 font-mono'}>
                          {entry.mission.completed ? 'Done ✓' : 'Mission'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-4 py-3 bg-[#142B22]/40 border-t border-[#DCDDD2]/10 flex items-center justify-between text-xs">
                  <span className="text-[#94A386] group-hover:text-[#F6F4EC] font-mono transition-colors flex items-center gap-1 text-[11px]">
                    <Eye className="w-3 h-3" />
                    <span>Examine Record</span>
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleStartEdit(entry, e)}
                      className="p-1 text-[#EAE8DD]/60 hover:text-[#F6F4EC] transition-colors"
                      title="Edit field notes"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(entry.id, e)}
                      className="p-1 text-[#EAE8DD]/40 hover:text-rose-400 transition-colors"
                      title="Delete observation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Under-Row Navigation Note */}
          <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-wrap items-center justify-between text-xs font-mono text-[#94A386]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#94A386]" />
              <span>Displaying {filteredEntries.length} field observations in continuous loop</span>
            </div>
            <div className="text-[#EAE8DD]/60">
              Hover over any specimen to pause the stream
            </div>
          </div>
        </div>
      )}

      {/* Modal for Full Entry Examination */}
      {expandedEntry && (
        <div className="fixed inset-0 z-50 bg-[#142B22]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#203D2F] border border-[#DCDDD2]/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => {
                setExpandedEntry(null);
                setEditingId(null);
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#142B22]/80 hover:bg-[#142B22] text-[#F6F4EC] border border-[#DCDDD2]/15"
              aria-label="Close record view"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-[16/9] w-full bg-[#142B22] relative overflow-hidden">
              <img
                src={expandedEntry.photoUrl}
                alt={expandedEntry.commonName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#203D2F] via-[#203D2F]/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-xs font-mono text-[#94A386] mb-1 uppercase">
                  {expandedEntry.category} · {expandedEntry.providerLabel}
                </div>
                <h3 className="font-serif text-3xl font-semibold text-[#F6F4EC]">
                  {expandedEntry.commonName}
                </h3>
                <p className="font-serif italic text-sm text-[#94A386]">
                  {expandedEntry.scientificName}
                </p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h4 className="font-serif text-lg font-medium text-[#F6F4EC] mb-2">
                  Natural History
                </h4>
                <p className="text-sm text-[#EAE8DD]/85 leading-relaxed font-light">
                  {expandedEntry.explanation}
                </p>
              </div>

              {expandedEntry.facts && expandedEntry.facts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-serif text-lg font-medium text-[#F6F4EC]">
                    Ecological Insights
                  </h4>
                  <ul className="space-y-2">
                    {expandedEntry.facts.map((f, i) => (
                      <li key={i} className="text-xs text-[#EAE8DD]/80 flex items-start gap-2">
                        <span className="text-[#94A386] font-mono">·</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {expandedEntry.mission && (
                <div className="p-5 rounded-xl bg-[#142B22] border border-[#78866B]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-[#94A386] uppercase">
                      Outdoor Nature Mission
                    </div>
                    <button
                      onClick={(e) => handleToggleMission(expandedEntry.id, expandedEntry.mission.completed, e)}
                      className={`text-xs px-2.5 py-1 rounded font-medium ${
                        expandedEntry.mission.completed
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : 'bg-[#203D2F] text-[#EAE8DD]'
                      }`}
                    >
                      {expandedEntry.mission.completed ? 'Completed ✓' : 'Mark Completed'}
                    </button>
                  </div>
                  <h5 className="font-serif text-base text-[#F6F4EC]">
                    {expandedEntry.mission.title}
                  </h5>
                  <p className="text-xs text-[#EAE8DD]/80 leading-relaxed">
                    {expandedEntry.mission.instruction}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-serif text-lg font-medium text-[#F6F4EC]">
                    Personal Field Notes
                  </h4>
                  {editingId !== expandedEntry.id && (
                    <button
                      onClick={() => {
                        setEditingId(expandedEntry.id);
                        setEditText(expandedEntry.personalNotes || '');
                      }}
                      className="text-xs text-[#94A386] hover:text-white flex items-center gap-1 font-mono"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Notes</span>
                    </button>
                  )}
                </div>

                {editingId === expandedEntry.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 text-xs bg-[#142B22] border border-[#DCDDD2]/20 rounded-xl text-[#F6F4EC] focus:outline-none focus:border-[#78866B] resize-none h-24"
                      placeholder="Record your field observations..."
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs text-[#EAE8DD]/70 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNotes(expandedEntry.id)}
                        className="px-4 py-1.5 text-xs bg-[#EAE8DD] text-[#142B22] font-semibold rounded-lg"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#142B22] border border-[#DCDDD2]/10 text-xs text-[#EAE8DD]/80">
                    {expandedEntry.personalNotes || 'No notes added for this encounter yet.'}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#DCDDD2]/10 flex items-center justify-between text-xs text-[#94A386] font-mono">
                <span>Encounter ID: {expandedEntry.id}</span>
                <span>Recorded: {new Date(expandedEntry.savedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
