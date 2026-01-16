import { useCallback, useState } from 'react';
import { generatePuzzle } from '../../../services/geminiService';
import { AiSettings, DifficultyLevel } from '../../../types';
import { upsertPuzzleLibraryEntry } from '../../../services/puzzleStorage';
import type { LibraryPuzzle } from './usePuzzleLibraryState';

interface UsePuzzleGeneratorOptions {
  aiSettings: AiSettings;
  aiCategory: string;
  aiDifficulty: DifficultyLevel;
  onMissingApiKey: () => void;
}

interface UsePuzzleGeneratorResult {
  generatedPuzzle: LibraryPuzzle | null;
  isLoading: boolean;
  errorMsg: string;
  generate: (savedPuzzles: LibraryPuzzle[], setSavedPuzzles: (puzzles: LibraryPuzzle[]) => void) => Promise<void>;
  clearPreview: () => void;
}

export const usePuzzleGenerator = ({
  aiSettings,
  aiCategory,
  aiDifficulty,
  onMissingApiKey,
}: UsePuzzleGeneratorOptions): UsePuzzleGeneratorResult => {
  const [generatedPuzzle, setGeneratedPuzzle] = useState<LibraryPuzzle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hasRequiredKey = useCallback(() => {
    if (aiSettings.textProvider === 'openai') {
      return Boolean(aiSettings.openAiApiKey);
    }
    return Boolean(aiSettings.googleApiKey);
  }, [aiSettings]);

  const clearPreview = useCallback(() => {
    setGeneratedPuzzle(null);
    setErrorMsg('');
  }, []);

  const generate = useCallback(
    async (savedPuzzles: LibraryPuzzle[], setSavedPuzzles: (puzzles: LibraryPuzzle[]) => void) => {
      if (!hasRequiredKey()) {
        onMissingApiKey();
        return;
      }

      setIsLoading(true);
      setErrorMsg('');
      setGeneratedPuzzle(null);

      try {
        const data = await generatePuzzle(aiSettings, aiCategory, aiDifficulty);

        if (data.category === 'FALLBACK' && data.phrase === 'API CONFIGURATION ERROR') {
          setErrorMsg('API Config Error. Please check Settings.');
          return;
        }

        const newPuzzle: LibraryPuzzle = {
          id: Date.now().toString(),
          ...data,
          createdAt: Date.now(),
        };

        const updated = [newPuzzle, ...savedPuzzles];
        setSavedPuzzles(updated);
        upsertPuzzleLibraryEntry(newPuzzle);
        setGeneratedPuzzle(newPuzzle);
      } catch (error) {
        console.error('Puzzle generation failed', error);
        setErrorMsg('Generation failed. Check API keys.');
      } finally {
        setIsLoading(false);
      }
    },
    [aiSettings, aiCategory, aiDifficulty, hasRequiredKey, onMissingApiKey]
  );

  return {
    generatedPuzzle,
    isLoading,
    errorMsg,
    generate,
    clearPreview,
  };
};

