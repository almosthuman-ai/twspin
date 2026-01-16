import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Play,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  AiSettings,
  DifficultyLevel,
  GameMode,
  PuzzleData,
} from '../../../types';
import { PUZZLE_CATEGORIES } from '../../../constants';
import { ModalHeaderControls, ModalSurface } from '../shared';
import { usePuzzleLibraryState, type DifficultyScope } from './usePuzzleLibraryState';
import { usePuzzleGenerator } from './usePuzzleGenerator';
import { upsertPuzzleLibraryEntry } from '../../../services/puzzleStorage';

interface PuzzleModalProps {
  onSetPuzzle: (data: PuzzleData) => void;
  onCancel: () => void;
  onBackToSetup: () => void;
  aiSettings: AiSettings;
  playedPuzzleIds: string[];
  onOpenSettings: () => void;
  gameMode: GameMode;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  onSetPuzzle,
  onCancel,
  onBackToSetup,
  aiSettings,
  playedPuzzleIds,
  onOpenSettings,
  gameMode,
}) => {
  const [mode, setMode] = useState<'MANUAL' | 'LIBRARY' | 'AI'>('LIBRARY');
  const [manualCategory, setManualCategory] = useState('');
  const [manualPhrase, setManualPhrase] = useState('');
  const [manualDifficulty, setManualDifficulty] = useState<DifficultyLevel>(DifficultyLevel.A1);
  const [aiCategory, setAiCategory] = useState(PUZZLE_CATEGORIES[0]);
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>(DifficultyLevel.A1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());

  const ensureCategoryExpanded = useCallback((category: string | undefined | null) => {
    if (!category) {
      return;
    }
    setExpandedCategories((prev) => {
      if (prev.has(category)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(category);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const {
    savedPuzzles,
    setSavedPuzzles,
    groupedPuzzles,
    uniqueCategories,
    libraryFilter,
    setLibraryFilter,
    difficultyScope,
    setDifficultyScope,
    availableDifficulties,
    selectedPuzzleId,
    setSelectedPuzzleId,
    revealLibrary,
    setRevealLibrary,
    handleDeleteSaved,
    handleRandomSelect,
  } = usePuzzleLibraryState({ playedPuzzleIds });

  const { generatedPuzzle, isLoading, errorMsg, generate, clearPreview } = usePuzzleGenerator({
    aiSettings,
    aiCategory,
    aiDifficulty,
    onMissingApiKey: onOpenSettings,
  });

  useEffect(() => {
    if (gameMode === 'STUDENT') {
      setRevealLibrary(false);
    }
  }, [gameMode, setRevealLibrary]);

  useEffect(() => {
    setExpandedCategories((prev) => {
      const valid = new Set(Object.keys(groupedPuzzles));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((category) => {
        if (valid.has(category)) {
          next.add(category);
        } else {
          changed = true;
        }
      });
      if (!changed && next.size === prev.size) {
        return prev;
      }
      return next;
    });
  }, [groupedPuzzles]);

  useEffect(() => {
    setSelectedPuzzleId(null);
  }, [libraryFilter, setSelectedPuzzleId]);

  useEffect(() => {
    setSelectedPuzzleId(null);
  }, [difficultyScope, setSelectedPuzzleId]);

  useEffect(() => {
    if (libraryFilter === 'ALL') {
      return;
    }
    ensureCategoryExpanded(libraryFilter);
  }, [libraryFilter, ensureCategoryExpanded]);

  useEffect(() => {
    if (!selectedPuzzleId) {
      return;
    }
    const owningCategory = (Object.entries(groupedPuzzles) as [string, typeof savedPuzzles][]).find(([, puzzles]) =>
      puzzles.some((puzzle) => puzzle.id === selectedPuzzleId)
    )?.[0];
    ensureCategoryExpanded(owningCategory);
  }, [selectedPuzzleId, groupedPuzzles, ensureCategoryExpanded]);

  const providerName = useMemo(
    () => (aiSettings.textProvider === 'openai' ? 'OpenAI' : 'Google Gemini'),
    [aiSettings.textProvider]
  );

  const activeKey = aiSettings.textProvider === 'google' ? aiSettings.googleApiKey : aiSettings.openAiApiKey;
  const missingApiKey = !activeKey;

  const difficultyOptions = useMemo<DifficultyScope[]>(() => {
    const scoped = availableDifficulties.length > 0 ? availableDifficulties : [DifficultyLevel.A1];
    return ['ALL', ...scoped];
  }, [availableDifficulties]);

  const maskPhrase = (phrase: string) =>
    Array.from(phrase)
      .map((char) => {
        if (char === ' ') return ' ';
        if (/[A-Za-z0-9]/.test(char)) return '•';
        return char;
      })
      .join('');

  const normalizedManualPhrase = manualPhrase.toUpperCase().trim();
  const normalizedManualCategory = manualCategory.toUpperCase().trim();

  const setLibraryState = (next: typeof savedPuzzles) => {
    setSavedPuzzles(next);
  };

  const handleManualSubmit = () => {
    if (!normalizedManualCategory || !normalizedManualPhrase) return;

    if (editingId) {
      const updated = savedPuzzles.map((puzzle) =>
        puzzle.id === editingId
          ? {
              ...puzzle,
              category: normalizedManualCategory,
              phrase: normalizedManualPhrase,
              difficulty: manualDifficulty,
              createdAt: Date.now(),
            }
          : puzzle
      );
      setLibraryState(updated);
      upsertPuzzleLibraryEntry({
        id: editingId,
        category: normalizedManualCategory,
        phrase: normalizedManualPhrase,
        difficulty: manualDifficulty,
        createdAt: Date.now(),
      });
      setEditingId(null);
      setMode('LIBRARY');
      return;
    }

    onSetPuzzle({
      category: normalizedManualCategory,
      phrase: normalizedManualPhrase,
      difficulty: manualDifficulty,
    });
  };

  const handleSaveToLibrary = () => {
    if (!normalizedManualCategory || !normalizedManualPhrase) return;

    const duplicate = savedPuzzles.some(
      (puzzle) => puzzle.phrase === normalizedManualPhrase && puzzle.id !== editingId
    );
    if (duplicate) {
      setLibraryError('This puzzle phrase already exists in the library.');
      setTimeout(() => setLibraryError(''), 2500);
      return;
    }

    const now = Date.now();
    const newPuzzle = {
      id: editingId || now.toString(),
      category: normalizedManualCategory,
      phrase: normalizedManualPhrase,
      difficulty: manualDifficulty,
      createdAt: now,
    };

    const updated = editingId
      ? savedPuzzles.map((puzzle) => (puzzle.id === editingId ? newPuzzle : puzzle))
      : [newPuzzle, ...savedPuzzles];

    setLibraryState(updated);
    upsertPuzzleLibraryEntry(newPuzzle);
    setMode('LIBRARY');
    setManualCategory('');
    setManualPhrase('');
    setEditingId(null);
  };

  const handleEditPuzzle = (puzzleId: string) => {
    const puzzle = savedPuzzles.find((entry) => entry.id === puzzleId);
    if (!puzzle) return;
    setManualCategory(puzzle.category);
    setManualPhrase(puzzle.phrase);
    setManualDifficulty(puzzle.difficulty || DifficultyLevel.A1);
    setEditingId(puzzle.id);
    setMode('MANUAL');
  };

  const handleGenerate = () => {
    generate(savedPuzzles, (next) => setLibraryState(next));
  };

  const tabs = [
    { key: 'LIBRARY' as const, label: 'Library', icon: <BookOpen size={14} /> },
    { key: 'AI' as const, label: 'AI Gen', icon: <Sparkles size={14} /> },
    { key: 'MANUAL' as const, label: 'Manual', icon: <Pencil size={14} /> },
  ];

  return (
    <ModalSurface panelClassName="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl w-[95vw] max-w-[900px] md:w-[85vw] flex flex-col relative overflow-hidden shadow-2xl">
      <ModalHeaderControls
        onBack={onBackToSetup}
        onClose={onCancel}
        leftContent={null}
        centerContent={
          <div className="flex w-full max-w-2xl items-center gap-1 bg-gray-800 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'MANUAL') {
                    setEditingId(null);
                    setManualCategory('');
                    setManualPhrase('');
                  }
                  setMode(tab.key);
                }}
                className={`flex-1 py-1.5 md:py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors text-xs md:text-sm ${
                  mode === tab.key ? 'bg-teal-600 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        }
        rightContent={null}
        className="bg-gray-800 p-1 border-b border-gray-700"
      />

      <div className="flex-1 overflow-hidden min-h-0 relative bg-gray-900" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="flex-1 overflow-y-auto min-h-0">
        {mode === 'LIBRARY' && (
          <div className="p-3 pb-20">
            <div className="flex flex-col gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] md:text-xs uppercase tracking-wide text-gray-500">Difficulty</span>
                <div className="flex flex-wrap gap-1">
                  {difficultyOptions.map((scope) => (
                    <button
                      key={scope}
                      onClick={() => setDifficultyScope(scope)}
                      className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-colors ${
                        difficultyScope === scope
                          ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(167,139,250,0.35)]'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {scope === 'ALL' ? 'All Levels' : scope}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pb-1">
                <button
                  onClick={() => setLibraryFilter('ALL')}
                  className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${
                    libraryFilter === 'ALL' ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  ALL
                </button>
                {uniqueCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setLibraryFilter(category)}
                    className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${
                      libraryFilter === category ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              {gameMode === 'TEACHER' ? (
                <button
                  onClick={() => setRevealLibrary(!revealLibrary)}
                  className="text-gray-400 hover:text-white flex items-center gap-1 text-[10px] md:text-xs"
                >
                  {revealLibrary ? <EyeOff size={14} /> : <Eye size={14} />}{' '}
                  {revealLibrary ? 'Hide' : 'Show Answers'}
                </button>
              ) : (
                <span className="text-[10px] text-gray-500 italic">Hidden (Student Mode)</span>
              )}

              <button
                onClick={handleRandomSelect}
                className="bg-game-accent hover:bg-yellow-400 text-black px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <RefreshCw size={12} /> Random
              </button>
            </div>

            <div className="space-y-3">
              {(Object.entries(groupedPuzzles) as [string, typeof savedPuzzles][]).map(([category, puzzles]) => {
                if (libraryFilter !== 'ALL' && libraryFilter !== category) return null;
                const isExpanded = expandedCategories.has(category);
                return (
                  <div key={category} className="border border-gray-800 rounded-lg bg-gray-900/60">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      aria-expanded={isExpanded}
                      className="w-full flex items-center justify-between px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-teal-500/60"
                    >
                      <h3 className="text-teal-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                        {category}
                      </h3>
                      <ChevronDown
                        size={14}
                        className={`text-teal-400 transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-3 pb-3">
                        {puzzles.map((puzzle) => (
                          <div
                            key={puzzle.id}
                            onClick={() => setSelectedPuzzleId(puzzle.id)}
                            className={`p-2 rounded border cursor-pointer transition-all relative group ${
                              selectedPuzzleId === puzzle.id
                                ? 'bg-teal-900/30 border-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.2)]'
                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className="pr-6">
                              <div className="flex items-center gap-1 mb-1">
                                <span
                                  className={`text-[9px] px-1 rounded ${
                                    selectedPuzzleId === puzzle.id ? 'bg-teal-500 text-black' : 'bg-gray-700 text-gray-300'
                                  }`}
                                >
                                  {puzzle.difficulty || 'A1'}
                                </span>
                                {playedPuzzleIds.includes(puzzle.id) && (
                                  <span className="text-[9px] text-gray-500">(Played)</span>
                                )}
                              </div>
                              <div
                                className={`font-mono font-bold text-xs md:text-sm ${
                                  selectedPuzzleId === puzzle.id ? 'text-white' : 'text-gray-400'
                                } truncate`}
                              >
                                {revealLibrary
                                  ? puzzle.phrase
                                  : '•'.repeat(Math.min(puzzle.phrase.length, 30))}
                              </div>
                            </div>

                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleEditPuzzle(puzzle.id);
                                }}
                                className="p-1 hover:text-blue-400 text-gray-500"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={(event) => handleDeleteSaved(puzzle.id, event)}
                                className="p-1 hover:text-red-400 text-gray-500"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'AI' && (
          <div className="p-4 space-y-4">
            <div className="bg-purple-900/20 border border-purple-500/40 rounded-xl p-3 text-xs text-purple-100">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-purple-200 flex items-center gap-1">
                  <Sparkles size={14} /> AI Puzzle Generator
                </p>
                <button
                  onClick={onOpenSettings}
                  className="text-purple-300 hover:text-white transition-colors"
                  title="Configure AI settings"
                >
                  <Settings size={16} />
                </button>
              </div>
              <div className="mt-1 flex flex-col gap-1 text-[11px] md:text-xs text-purple-100/90">
                <p>
                  Select a category and level, then let the {providerName} model craft a fresh puzzle. Generated
                  puzzles are auto-saved to your library for later reuse.
                </p>
                <p className="text-purple-200/80">
                  Using: <span className="font-semibold text-purple-100">{providerName}</span>{' '}
                  {activeKey ? '(key detected)' : '(key missing)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Category</label>
                <select
                  value={aiCategory}
                  onChange={(event) => setAiCategory(event.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm focus:border-purple-500 outline-none"
                >
                  {PUZZLE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Difficulty</label>
                <select
                  value={aiDifficulty}
                  onChange={(event) => setAiDifficulty(event.target.value as DifficultyLevel)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm focus:border-purple-500 outline-none"
                >
                  {Object.values(DifficultyLevel).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {missingApiKey && (
              <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-xs text-red-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle size={14} /> {providerName} API key required
                </div>
                <p className="text-[11px] md:text-xs">
                  Add your {providerName} key in settings to enable AI generation.
                </p>
                <button
                  onClick={onOpenSettings}
                  className="self-start bg-red-500/80 hover:bg-red-500 text-white px-3 py-1.5 rounded text-[11px] font-bold"
                >
                  Open Settings
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-xs text-red-200 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading || missingApiKey}
              className={`w-full py-3 rounded-lg font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-colors ${
                isLoading || missingApiKey
                  ? 'bg-purple-700/40 text-purple-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isLoading ? 'Generating...' : 'Generate Puzzle'}
            </button>

            {generatedPuzzle && (
              <div className="bg-gray-800 border border-purple-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-purple-200">
                  <span className="font-semibold uppercase tracking-wide">Generated Puzzle</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(generatedPuzzle.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] md:text-xs text-gray-300 flex flex-col gap-1">
                  <span>
                    <strong className="text-purple-200">Category:</strong> {generatedPuzzle.category}
                  </span>
                  <span>
                    <strong className="text-purple-200">Difficulty:</strong>{' '}
                    {generatedPuzzle.difficulty || aiDifficulty}
                  </span>
                  <div>
                    <span className="text-purple-200 font-semibold block mb-1">Phrase Preview</span>
                    <div className="font-mono text-sm md:text-base text-white bg-black/40 rounded px-3 py-2">
                      {gameMode === 'TEACHER'
                        ? generatedPuzzle.phrase
                        : maskPhrase(generatedPuzzle.phrase)}
                    </div>
                    {gameMode === 'STUDENT' && (
                      <span className="text-[10px] text-gray-500 italic mt-1 block">
                        Hidden in student mode. Switch to Teacher to reveal.
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <button
                    onClick={() => onSetPuzzle(generatedPuzzle)}
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <Play size={16} /> Use Puzzle
                  </button>
                  <button
                    onClick={clearPreview}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 size={16} /> Clear Preview
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPuzzleId(generatedPuzzle.id);
                      setMode('LIBRARY');
                    }}
                    className="flex-1 bg-purple-700/60 hover:bg-purple-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <BookOpen size={16} /> View in Library
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                  This puzzle has been added to your library automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {mode === 'MANUAL' && (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-indigo-300">
              {editingId ? 'Edit Puzzle' : 'Create Custom Puzzle'}
            </h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <select
                value={manualCategory}
                onChange={(event) => setManualCategory(event.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm mb-2"
              >
                <option value="">Select or Type...</option>
                {PUZZLE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                value={manualCategory}
                onChange={(event) => setManualCategory(event.target.value.toUpperCase())}
                placeholder="Or type custom category..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Phrase</label>
              <input
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm focus:border-indigo-500 outline-none font-mono uppercase"
                value={manualPhrase}
                onChange={(event) => setManualPhrase(event.target.value.toUpperCase())}
                placeholder="THE PHRASE"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
              <select
                value={manualDifficulty}
                onChange={(event) => setManualDifficulty(event.target.value as DifficultyLevel)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm"
              >
                {Object.values(DifficultyLevel).map((difficultyLevel) => (
                  <option key={difficultyLevel} value={difficultyLevel}>
                    {difficultyLevel}
                  </option>
                ))}
              </select>
            </div>

            {libraryError && (
              <div className="bg-red-900/30 border border-red-500/40 rounded-lg p-2 text-xs text-red-200">
                {libraryError}
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={handleSaveToLibrary}
                disabled={!normalizedManualCategory || !normalizedManualPhrase}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded flex items-center justify-center gap-1 text-sm disabled:opacity-50"
              >
                <Save size={14} /> Save
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={!normalizedManualCategory || !normalizedManualPhrase}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm disabled:opacity-50"
              >
                {editingId ? 'Update & Play' : 'Play Now'}
              </button>
            </div>
          </div>
        )}
      </div>

        {mode === 'LIBRARY' && selectedPuzzleId && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-teal-500 p-2 md:p-3 flex gap-2 shadow-2xl z-20 animate-in slide-in-from-bottom-5">
            <button
              onClick={() => setSelectedPuzzleId(null)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-bold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const puzzle = savedPuzzles.find((entry) => entry.id === selectedPuzzleId);
                if (puzzle) {
                  onSetPuzzle(puzzle);
                }
              }}
              className="flex-[2] bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Play fill="currentColor" size={16} /> PLAY
            </button>
          </div>
        )}
      </div>
    </ModalSurface>
  );
};

