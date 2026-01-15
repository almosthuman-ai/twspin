
import { WheelSegment, WheelSegmentType, DifficultyLevel } from './types';

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Weight 0.5 = Super Thin, Weight 1 = Thin, Weight 2 = Standard
// Total Weights:
// $2500 (1) + 2x Lose Turn (0.5) = 2
// 10x Standard (2) = 20
// Total = 22

export const WHEEL_SEGMENTS: WheelSegment[] = [
  // --- The Top Trio ($2500 flanked by Lose Turns) ---
  { id: '1', label: '$2500', value: 2500, type: WheelSegmentType.CASH, color: '#FFD700', textColor: '#000', weight: 1 }, 
  { id: '2', label: 'LOSE TURN', value: 0, type: WheelSegmentType.LOSE_TURN, color: '#FFFFFF', textColor: '#000', weight: 0.5 }, 

  // --- Standard Wedges ---
  { id: '3', label: '$600', value: 600, type: WheelSegmentType.CASH, color: '#9C27B0', textColor: '#FFF', weight: 2 },
  { id: '4', label: '$400', value: 400, type: WheelSegmentType.CASH, color: '#FF9800', textColor: '#FFF', weight: 2 },
  { id: '5', label: '$550', value: 550, type: WheelSegmentType.CASH, color: '#2196F3', textColor: '#FFF', weight: 2 },
  { id: '6', label: '$800', value: 800, type: WheelSegmentType.CASH, color: '#E91E63', textColor: '#FFF', weight: 2 },
  
  // Formerly BANKRUPT, now Cash
  { id: '7', label: '$300', value: 300, type: WheelSegmentType.CASH, color: '#00BCD4', textColor: '#FFF', weight: 2 }, // Cyan
  
  { id: '8', label: '$650', value: 650, type: WheelSegmentType.CASH, color: '#4CAF50', textColor: '#FFF', weight: 2 },
  { id: '9', label: '$500', value: 500, type: WheelSegmentType.CASH, color: '#F44336', textColor: '#FFF', weight: 2 },
  { id: '10', label: '$900', value: 900, type: WheelSegmentType.CASH, color: '#673AB7', textColor: '#FFF', weight: 2 },
  
  // Formerly BANKRUPT, now Cash
  { id: '11', label: '$700', value: 700, type: WheelSegmentType.CASH, color: '#FF5722', textColor: '#FFF', weight: 2 }, // Deep Orange
  
  { id: '12', label: '$350', value: 350, type: WheelSegmentType.CASH, color: '#2962FF', textColor: '#FFF', weight: 2 }, // Bright Blue
  
  // --- Left Flank (Wraps to be next to $2500) ---
  { id: '13', label: 'LOSE TURN', value: 0, type: WheelSegmentType.LOSE_TURN, color: '#FFFFFF', textColor: '#000', weight: 0.5 }, 
];

export const VOWELS = ['A', 'E', 'I', 'O', 'U'];
export const VOWEL_COST = 250;

// English Letter Frequency (approximate percentage) for Computer AI Logic
export const LETTER_FREQUENCY: Record<string, number> = {
  E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1, R: 6.0, D: 4.3,
  L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2, G: 2.0, Y: 2.0, P: 1.9, B: 1.5,
  V: 1.0, K: 0.8, J: 0.15, X: 0.15, Q: 0.10, Z: 0.07
};

export const PUZZLE_CATEGORIES = [
  "DAILY LIFE",
  "FOOD & DRINK",
  "SCHOOL",
  "ANIMALS",
  "MOVIES",
  "FAMILY",
  "TRAVEL",
  "HOBBIES",
  "PHRASE",
  "QUESTION",
  "THING",
  "PLACE"
];

export const COMPUTER_NAMES = [
    "HAL 9000", "GLaDOS", "Data", "Wall-E", "R2-D2", "BB-8", "Jarvis", "Cortana", "Siri", "Alexa", "Deep Blue", "Watson"
];

export const PRELOADED_CLASSES = [
    {
        name: "EOW1",
        players: ["Joan", "Jimmy", "Janet", "Cynthia"]
    }
];

export const DEFAULT_EFL_PUZZLES = [
  { id: 'efl1', category: 'QUESTION', phrase: 'WHAT TIME IS IT NOW', createdAt: 1700000000000, difficulty: DifficultyLevel.A1 },
  { id: 'efl2', category: 'DAILY LIFE', phrase: 'I GO TO SCHOOL BY BUS', createdAt: 1700000000000, difficulty: DifficultyLevel.A1 },
  { id: 'efl3', category: 'FAMILY', phrase: 'MY FATHER IS A DOCTOR', createdAt: 1700000000000, difficulty: DifficultyLevel.A1 },
  { id: 'efl4', category: 'WEATHER', phrase: 'IT IS RAINING OUTSIDE NOW', createdAt: 1700000000000, difficulty: DifficultyLevel.A1 },
  { id: 'efl5', category: 'FOOD', phrase: 'DO YOU WANT SOME ICE CREAM', createdAt: 1700000000000, difficulty: DifficultyLevel.A1 },
];
