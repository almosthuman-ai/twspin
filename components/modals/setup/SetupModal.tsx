import React, { useState } from 'react';
import { Bot, FolderOpen, Plus, Save, Settings, Trash2, User, Zap } from 'lucide-react';
import { DifficultyLevel, GameMode, Player } from '../../../types';
import { ModalHeaderControls, ModalSurface } from '../shared';
import { useSetupProfiles } from './useSetupProfiles';
import { COMPUTER_NAMES } from '../../../constants';

interface SetupModalProps {
  onSetupComplete: (
    players: Partial<Player>[],
    vowelsCostMoney: boolean,
    gameMode: GameMode,
    difficulty: DifficultyLevel
  ) => void;
  onQuickPlay: (
    players: Partial<Player>[],
    vowelsCostMoney: boolean,
    gameMode: GameMode,
    difficulty: DifficultyLevel
  ) => void;
  onCancel: () => void;
  initialPlayers?: Player[];
}

export const SetupModal: React.FC<SetupModalProps> = ({
  onSetupComplete,
  onQuickPlay,
  onCancel,
  initialPlayers,
}) => {
  const {
    players,
    isSolo,
    classProfiles,
    selectedProfileId,
    newProfileName,
    setNewProfileName,
    handleSoloToggle,
    addPlayer,
    removePlayer,
    updatePlayer,
    loadClassProfile,
    saveClassProfile,
  } = useSetupProfiles({ initialPlayers });

  const [gameMode, setGameMode] = useState<GameMode>(() => {
    try {
      return (window.localStorage.getItem('fs_last_gamemode') as GameMode) || 'STUDENT';
    } catch {
      return 'STUDENT';
    }
  });

  const [difficulty, setDifficulty] = useState<DifficultyLevel>(() => {
    try {
      return (
        (window.localStorage.getItem('fs_last_difficulty') as DifficultyLevel) || DifficultyLevel.A1
      );
    } catch {
      return DifficultyLevel.A1;
    }
  });

  const [vowelsCostMoney, setVowelsCostMoney] = useState(true);

  const savePreferences = () => {
    try {
      window.localStorage.setItem('fs_last_gamemode', gameMode);
      window.localStorage.setItem('fs_last_issolo', isSolo.toString());
      window.localStorage.setItem('fs_last_difficulty', difficulty);
      if (players[0]?.name) {
        window.localStorage.setItem('fs_player1_name', players[0].name);
      }
    } catch {
      /* ignore storage errors */
    }
  };

  const handleSetupAction = (type: 'SETUP' | 'QUICK') => {
    savePreferences();
    const action = type === 'SETUP' ? onSetupComplete : onQuickPlay;
    action(players, vowelsCostMoney, gameMode, difficulty);
  };

  const togglePlayerComputer = (index: number) => {
    const target = players[index];
    if (!target) return;
    const nextValue = !target.isComputer;
    updatePlayer(index, 'isComputer', nextValue);
    if (nextValue) {
      const botName = COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)];
      updatePlayer(index, 'name', botName);
    } else if (target.name && COMPUTER_NAMES.includes(target.name)) {
      updatePlayer(index, 'name', `Player ${index + 1}`);
    }
  };

  return (
    <ModalSurface panelClassName="bg-game-panel border border-indigo-500/30 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <ModalHeaderControls
          leftContent={
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors">
                <span className="text-xs md:text-sm font-bold text-indigo-200">Solo Play</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSolo}
                    onChange={(event) => handleSoloToggle(event.target.checked)}
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${isSolo ? 'bg-purple-600' : 'bg-gray-600'}`}>
                  </div>
                  <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isSolo ? 'translate-x-5' : ''}`}></div>
                </div>
              </label>
              <label className="flex items-center cursor-pointer gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors">
                <span className="text-xs md:text-sm font-bold text-indigo-200">Vowel Cost</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={vowelsCostMoney}
                    onChange={(event) => setVowelsCostMoney(event.target.checked)}
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${vowelsCostMoney ? 'bg-green-600' : 'bg-gray-600'}`}>
                  </div>
                  <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${vowelsCostMoney ? 'translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>
          }
          centerContent={
            <div className="flex bg-black/40 rounded-lg p-1">
              <button
                onClick={() => setGameMode('STUDENT')}
                className={`px-4 py-1.5 rounded-md font-bold text-xs md:text-sm transition-colors ${
                  gameMode === 'STUDENT' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setGameMode('TEACHER')}
                className={`px-4 py-1.5 rounded-md font-bold text-xs md:text-sm transition-colors ${
                  gameMode === 'TEACHER' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Teacher
              </button>
            </div>
          }
          rightContent={
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-indigo-300 font-bold hidden md:inline">Level:</span>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as DifficultyLevel)}
                className="bg-black/30 border border-indigo-500/30 rounded px-2 py-1.5 text-xs md:text-sm text-white focus:outline-none focus:border-game-accent"
              >
                {Object.values(DifficultyLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          }
          onClose={onCancel}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-indigo-900/10 to-transparent">
          {gameMode === 'TEACHER' && (
            <div className="mb-6 bg-black/20 p-3 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300">
                <FolderOpen size={18} />
                <span className="text-sm font-bold">Class Profiles:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {classProfiles.map((profile) => (
                  <button
                    key={profile.name}
                    onClick={() => loadClassProfile(profile.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      selectedProfileId === profile.name
                        ? 'bg-teal-700 border-teal-400 text-white shadow-lg'
                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {profile.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(event) => setNewProfileName(event.target.value)}
                  placeholder="New profile name..."
                className="bg-black/40 border border-indigo-700/50 rounded px-3 py-1.5 text-xs text-white focus:border-game-accent focus:outline-none flex-1"
                />
                <button
                  onClick={saveClassProfile}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Save size={14} /> Save Current Players
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-2">
                Players
              </h3>
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5 animate-in slide-in-from-left-2"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      player.isComputer ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'
                    }`}
                  >
                    {player.isComputer ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(event) => updatePlayer(index, 'name', event.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 focus:border-game-accent px-2 py-1 text-sm text-white focus:outline-none"
                    placeholder={`Player ${index + 1}`}
                  />

                  {(!isSolo || index === 0) && (
                    <button
                      onClick={() => togglePlayerComputer(index)}
                      className="text-xs text-gray-500 hover:text-white px-2"
                      title="Toggle Computer"
                    >
                      {player.isComputer ? 'CPU' : 'Human'}
                    </button>
                  )}

                  {!isSolo && players.length > 2 && (
                    <button
                      onClick={() => removePlayer(index)}
                      className="text-red-500/50 hover:text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              {!isSolo && players.length < 5 && (
                <button
                  onClick={addPlayer}
                  className="w-full py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg text-sm hover:bg-white/5 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Player
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-900/20 p-4 rounded-xl text-xs text-indigo-300 leading-relaxed">
                <p className="mb-2">
                  <strong className="text-white">Quick Tip:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>In Solo Mode, the computer plays automatically.</li>
                  <li>Teacher Mode allows saving class rosters.</li>
                  <li>Quick Play picks a random puzzle for the selected Level.</li>
                  <li>Use the toggle in the header to change Vowel costs.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-indigo-950/80 border-t border-white/10 shrink-0 flex gap-3">
          <button
            onClick={() => handleSetupAction('QUICK')}
            className="flex-1 bg-game-accent hover:bg-yellow-400 text-black font-display font-bold text-lg py-3 rounded-xl shadow-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            <Zap size={20} /> QUICK PLAY
          </button>
          <button
            onClick={() => handleSetupAction('SETUP')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-lg py-3 rounded-xl shadow-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            <Settings size={20} /> SETUP PUZZLE
          </button>
        </div>
    </ModalSurface>
  );
};

