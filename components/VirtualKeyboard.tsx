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
    <div className="h-full w-full bg-slate-900/90 border-t border-white/10 p-1 flex flex-col justify-center">
      {/* Explicitly define 13 columns using inline style to guarantee support */}
      <div 
        className="grid gap-1 max-w-[98%] mx-auto w-full h-full content-center"
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
                w-full h-full rounded md:rounded-md font-bold text-xs sm:text-sm lg:text-lg font-mono shadow-sm
                transition-all duration-150 active:scale-95 flex items-center justify-center
                ${isGuessed 
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                  : isDisabled 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : isVowel 
                      ? 'bg-pink-600 hover:bg-pink-500 text-white border-b-2 border-pink-800'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-b-2 border-indigo-800'}
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>
      <div className="h-4 mt-1 text-center text-gray-400 text-[10px] md:text-xs font-mono flex items-center justify-center shrink-0">
        {canBuyVowel ? "VOWELS COST $250" : "VOWELS REQUIRE $250"}
      </div>
    </div>
  );
};