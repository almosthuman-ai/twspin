
export enum GamePhase {
  SETUP = 'SETUP',
  READY = 'READY',
  SPINNING = 'SPINNING',
  GUESSING_LETTER = 'GUESSING_LETTER',
  SOLVING = 'SOLVING',
  GAME_OVER = 'GAME_OVER',
  IDLE = 'IDLE'
}

export enum WheelSegmentType {
  CASH = 'CASH',
  BANKRUPT = 'BANKRUPT',
  LOSE_TURN = 'LOSE_TURN'
}

export interface WheelSegment {
  id: string;
  label: string;
  value: number;
  type: WheelSegmentType;
  color: string;
  textColor: string;
  weight?: number; // Relative width/size of the wedge (default 1)
}

export interface Player {
  id: string;
  name: string;
  totalScore: number; // Banked score
  roundScore: number; // Current round accumulator
  isComputer: boolean;
  difficulty: number; // 1-4
}

export interface ClassProfile {
    name: string;
    players: string[];
}

export enum DifficultyLevel {
  A1 = 'A1 (Beginner)',
  A2 = 'A2 (Elementary)',
  B1 = 'B1 (Intermediate)',
  B2 = 'B2 (Upper Int.)'
}

export type GameMode = 'STUDENT' | 'TEACHER';

export interface PuzzleData {
  category: string;
  phrase: string;
  difficulty?: DifficultyLevel;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  puzzle: PuzzleData;
  guessedLetters: string[];
  lastWheelResult: WheelSegment | null;
  message: string;
}

export type AiProvider = 'google' | 'openai';

export interface AiSettings {
  googleApiKey: string;
  openAiApiKey: string;
  textProvider: AiProvider;
}
