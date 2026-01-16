import React from 'react';
import { ALPHABET, VOWELS } from '../constants';

interface VirtualKeyboardProps {
  onGuess: (letter: string) => void;
  guessedLetters: string[];
  disabled: boolean;
  canBuyVowel: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  onGuess, 
  guessedLetters, 
  disabled,
  canBuyVowel
}) => {
  return (
    <div className="w-full bg-slate-900/95 border-t border-white/10 px-[clamp(0.5rem,2vmin,1.5rem)] py-[clamp(0.6rem,2.2vmin,1.35rem)] flex flex-col items-center justify-center">
      <div 
        className="grid gap-[clamp(0.25rem,1vmin,0.6rem)] max-w-[98%] mx-auto w-full content-center"
        style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, 1fr)' }}
      >
        {ALPHABET.map((letter) => {
          const isGuessed = guessedLetters.includes(letter);
          const isVowel = VOWELS.includes(letter);
          const isDisabled = disabled || isGuessed || (isVowel && !canBuyVowel);

          return (
            <button
              key={letter}
              onClick={() => onGuess(letter)}
              disabled={isDisabled}
              className={`
                w-full rounded-lg font-mono font-semibold text-[clamp(0.8rem,2.2vmin,1.35rem)] shadow-[inset_0_-4px_0_rgba(0,0,0,0.25)]
                transition-transform duration-150 active:scale-95 flex items-center justify-center tracking-[0.15em]
                ${isDisabled ? 'pointer-events-none' : 'hover:translate-y-[-1px]'}
                ${isGuessed 
                  ? 'bg-slate-800 text-slate-600 border border-slate-700' 
                  : isDisabled 
                    ? 'bg-slate-700 text-slate-500'
                    : isVowel 
                      ? 'bg-pink-600 hover:bg-pink-500 text-white border border-pink-800'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-800'}
              `}
              style={{ height: 'clamp(3rem, 12vh, 6.25rem)' }}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};
