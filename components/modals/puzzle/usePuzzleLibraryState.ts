import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { DifficultyLevel, PuzzleData } from '../../../types';
import { loadPuzzleLibrary, removePuzzleLibraryEntry, upsertPuzzleLibraryEntry } from '../../../services/puzzleStorage';

export interface LibraryPuzzle extends PuzzleData {
  id: string;
  createdAt: number;
}

export type LibraryFilter = 'ALL' | string;
export type DifficultyScope = DifficultyLevel | 'ALL';

interface UsePuzzleLibraryStateOptions {
  playedPuzzleIds: string[];
}

interface UsePuzzleLibraryStateResult {
  savedPuzzles: LibraryPuzzle[];
  setSavedPuzzles: Dispatch<SetStateAction<LibraryPuzzle[]>>;
  groupedPuzzles: Record<string, LibraryPuzzle[]>;
  uniqueCategories: string[];
  libraryFilter: LibraryFilter;
  setLibraryFilter: (filter: LibraryFilter) => void;
  difficultyScope: DifficultyScope;
  setDifficultyScope: (scope: DifficultyScope) => void;
  availableDifficulties: DifficultyLevel[];
  selectedPuzzleId: string | null;
  setSelectedPuzzleId: (id: string | null) => void;
  revealLibrary: boolean;
  setRevealLibrary: (value: boolean) => void;
  handleDeleteSaved: (id: string, event?: { stopPropagation: () => void }) => void;
  handleRandomSelect: () => void;
  handleEdit: (puzzle: LibraryPuzzle) => void;
}

export const usePuzzleLibraryState = ({ playedPuzzleIds }: UsePuzzleLibraryStateOptions): UsePuzzleLibraryStateResult => {
  const [savedPuzzles, setSavedPuzzles] = useState<LibraryPuzzle[]>([]);
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
  const [revealLibrary, setRevealLibrary] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>('ALL');
  const [difficultyScope, setDifficultyScope] = useState<DifficultyScope>(DifficultyLevel.A1);

  useEffect(() => {
    const library = loadPuzzleLibrary();
    setSavedPuzzles(library as LibraryPuzzle[]);
  }, []);

  const filteredByDifficulty = useMemo(() => {
    return savedPuzzles.filter((puzzle) => {
      const difficulty = puzzle.difficulty ?? DifficultyLevel.A1;
      return difficultyScope === 'ALL' || difficulty === difficultyScope;
    });
  }, [savedPuzzles, difficultyScope]);

  const groupedPuzzles = useMemo(() => {
    return filteredByDifficulty.reduce<Record<string, LibraryPuzzle[]>>((acc, puzzle) => {
      if (!acc[puzzle.category]) {
        acc[puzzle.category] = [];
      }
      acc[puzzle.category].push(puzzle);
      return acc;
    }, {});
  }, [filteredByDifficulty]);

  const uniqueCategories = useMemo(() => Object.keys(groupedPuzzles).sort(), [groupedPuzzles]);

  const availableDifficulties = useMemo(() => {
    const ordered = Object.values(DifficultyLevel);
    const encountered = new Set<DifficultyLevel>();
    savedPuzzles.forEach((puzzle) => {
      encountered.add((puzzle.difficulty as DifficultyLevel) ?? DifficultyLevel.A1);
    });
    return ordered.filter((difficulty) => encountered.has(difficulty));
  }, [savedPuzzles]);

  useEffect(() => {
    if (libraryFilter !== 'ALL' && !uniqueCategories.includes(libraryFilter)) {
      setLibraryFilter('ALL');
    }
  }, [libraryFilter, uniqueCategories]);

  useEffect(() => {
    if (savedPuzzles.length === 0) {
      return;
    }
    const hasDifficulty = savedPuzzles.some((puzzle) => {
      const difficulty = puzzle.difficulty ?? DifficultyLevel.A1;
      return difficultyScope === 'ALL' || difficulty === difficultyScope;
    });
    if (!hasDifficulty) {
      if (availableDifficulties.length > 0) {
        setDifficultyScope(availableDifficulties[0]);
      } else {
        setDifficultyScope('ALL');
      }
    }
  }, [savedPuzzles, difficultyScope, availableDifficulties]);

  const handleDeleteSaved = useCallback(
    (id: string, event?: { stopPropagation: () => void }) => {
      event?.stopPropagation();
      setSavedPuzzles((prev) => prev.filter((puzzle) => puzzle.id !== id));
      removePuzzleLibraryEntry(id);
      if (selectedPuzzleId === id) {
        setSelectedPuzzleId(null);
      }
    },
    [selectedPuzzleId]
  );

  const handleRandomSelect = useCallback(() => {
    const scopeMatches = savedPuzzles.filter((puzzle) => {
      const difficulty = puzzle.difficulty ?? DifficultyLevel.A1;
      return difficultyScope === 'ALL' || difficulty === difficultyScope;
    });
    const unplayed = scopeMatches.filter((puzzle) => !playedPuzzleIds.includes(puzzle.id));
    const pool = unplayed.length > 0 ? unplayed : scopeMatches;
    if (pool.length === 0) return;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setSelectedPuzzleId(random.id);
  }, [savedPuzzles, difficultyScope, playedPuzzleIds]);

  const handleEdit = useCallback((puzzle: LibraryPuzzle) => {
    setSelectedPuzzleId(puzzle.id);
  }, []);

  return {
    savedPuzzles,
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
    handleEdit,
    setSavedPuzzles,
  };
};

