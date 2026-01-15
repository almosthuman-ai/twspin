import { DefaultEflPuzzle, DEFAULT_EFL_PUZZLES, DEFAULT_EFL_PUZZLE_SEED_VERSION } from '../data/defaultEflPuzzles';
import { PuzzleLibraryEntry } from '../types';

const STORAGE_KEY = 'fortune_spin_saved_puzzles';
const VERSION_KEY = 'fortune_spin_saved_puzzles_version';

type StoredPuzzle = PuzzleLibraryEntry;

const isLibraryEntry = (value: unknown): value is StoredPuzzle => {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<StoredPuzzle>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.category === 'string' &&
    typeof entry.phrase === 'string'
  );
};

const coerceEntry = (value: any): StoredPuzzle | null => {
  if (!isLibraryEntry(value)) return null;
  return {
    id: value.id,
    category: value.category.toUpperCase(),
    phrase: value.phrase.toUpperCase(),
    difficulty: value.difficulty,
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
    seedVersion: typeof value.seedVersion === 'number' ? value.seedVersion : undefined,
  };
};

const parseStoredList = (raw: string | null): StoredPuzzle[] => {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .map(coerceEntry)
      .filter((entry): entry is StoredPuzzle => entry !== null);
  } catch {
    return [];
  }
};

const writeStorage = (entries: StoredPuzzle[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  localStorage.setItem(VERSION_KEY, DEFAULT_EFL_PUZZLE_SEED_VERSION.toString());
};

const seedDefaults = (): StoredPuzzle[] => DEFAULT_EFL_PUZZLES.map((puzzle: DefaultEflPuzzle): StoredPuzzle => ({
  id: puzzle.id,
  category: puzzle.category,
  phrase: puzzle.phrase,
  difficulty: puzzle.difficulty,
  createdAt: puzzle.createdAt,
  seedVersion: puzzle.seedVersion,
}));

const indexById = (entries: StoredPuzzle[]): Map<string, StoredPuzzle> => {
  const map = new Map<string, StoredPuzzle>();
  entries.forEach((entry) => map.set(entry.id, entry));
  return map;
};

const mergeDefaults = (existing: StoredPuzzle[]): StoredPuzzle[] => {
  const currentDefaults = seedDefaults();
  const incomingById = indexById(existing);
  currentDefaults.forEach((defaultPuzzle) => {
    const current = incomingById.get(defaultPuzzle.id);
    if (!current) {
      incomingById.set(defaultPuzzle.id, defaultPuzzle);
      return;
    }

    const isSeeded = current.seedVersion === defaultPuzzle.seedVersion;
    const seededDiffers = current.seedVersion !== undefined && current.seedVersion < defaultPuzzle.seedVersion;
    if (seededDiffers || (!current.seedVersion && current.createdAt === defaultPuzzle.createdAt)) {
      incomingById.set(defaultPuzzle.id, defaultPuzzle);
    } else if (!isSeeded && current.seedVersion && current.seedVersion < defaultPuzzle.seedVersion) {
      incomingById.set(defaultPuzzle.id, defaultPuzzle);
    }
  });

  return Array.from(incomingById.values()).sort((a, b) => a.createdAt - b.createdAt);
};

export const loadPuzzleLibrary = (): StoredPuzzle[] => {
  const storedRaw = localStorage.getItem(STORAGE_KEY);
  const storedVersionRaw = localStorage.getItem(VERSION_KEY);

  const storedVersion = storedVersionRaw ? Number(storedVersionRaw) : null;
  const parsed = parseStoredList(storedRaw);

  if (!storedRaw || !storedVersion || storedVersion < DEFAULT_EFL_PUZZLE_SEED_VERSION) {
    const merged = mergeDefaults(parsed);
    writeStorage(merged);
    return merged;
  }

  return parsed;
};

export const savePuzzleLibrary = (entries: StoredPuzzle[]) => {
  const normalized = entries.map((entry) => ({
    ...entry,
    category: entry.category.toUpperCase(),
    phrase: entry.phrase.toUpperCase(),
  }));
  writeStorage(normalized);
};

export const upsertPuzzleLibraryEntry = (entry: StoredPuzzle) => {
  const entries = loadPuzzleLibrary();
  const byId = indexById(entries);
  byId.set(entry.id, {
    ...entry,
    category: entry.category.toUpperCase(),
    phrase: entry.phrase.toUpperCase(),
    seedVersion: entry.seedVersion,
  });
  writeStorage(Array.from(byId.values()));
};

export const removePuzzleLibraryEntry = (id: string) => {
  const entries = loadPuzzleLibrary();
  const filtered = entries.filter((entry) => entry.id !== id);
  writeStorage(filtered);
};
