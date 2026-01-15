
import React, { useState } from 'react';
import { AiSettings, AiProvider } from '../types';
import { Save, X, Key, Globe, Cpu, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  currentSettings: AiSettings;
  onSave: (settings: AiSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ currentSettings, onSave, onClose }) => {
  const [googleKey, setGoogleKey] = useState(currentSettings.googleApiKey);
  const [openAiKey, setOpenAiKey] = useState(currentSettings.openAiApiKey);
  const [provider, setProvider] = useState<AiProvider>(currentSettings.textProvider);

  const handleSave = () => {
    onSave({
      googleApiKey: googleKey,
      openAiApiKey: openAiKey,
      textProvider: provider
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-game-panel border border-indigo-500 rounded-xl md:rounded-2xl w-[95%] max-w-md md:max-w-lg shadow-[0_0_50px_rgba(79,70,229,0.3)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-3 md:p-6 border-b border-white/10 flex justify-between items-center bg-indigo-950/50 rounded-t-xl md:rounded-t-2xl shrink-0">
          <h2 className="text-lg md:text-2xl font-display text-game-accent flex items-center gap-2">
            <Cpu className="w-5 h-5 md:w-7 md:h-7" /> Game Settings
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content - Scrollable area */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent">
            
            {/* Google Section */}
            <div className="space-y-2 md:space-y-3">
                <label className="flex items-center gap-2 text-indigo-200 font-bold text-sm md:text-base">
                    <Globe className="w-4 h-4 md:w-[18px] md:h-[18px]" /> Google Gemini API Key
                </label>
                <div className="text-[10px] md:text-xs text-indigo-400 mb-1 leading-tight flex justify-between items-center">
                    <span>Required for Voice Solutions.</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-game-accent hover:underline flex items-center gap-1">
                        Get Key <ExternalLink size={10} />
                    </a>
                </div>
                <div className="relative">
                    <input 
                        type="password"
                        value={googleKey}
                        onChange={(e) => setGoogleKey(e.target.value)}
                        placeholder="AIza..."
                        className="w-full bg-black/40 border border-indigo-700/50 rounded-lg px-3 py-2 md:px-4 md:py-3 pl-9 md:pl-10 text-white focus:border-game-accent focus:outline-none font-mono text-xs md:text-sm"
                    />
                    <Key className="absolute left-2.5 top-2.5 md:left-3 md:top-3.5 text-gray-500 w-4 h-4 md:w-4 md:h-4" />
                </div>
            </div>

            {/* OpenAI Section */}
            <div className="space-y-2 md:space-y-3">
                <label className="flex items-center gap-2 text-indigo-200 font-bold text-sm md:text-base">
                    <Cpu className="w-4 h-4 md:w-[18px] md:h-[18px]" /> OpenAI API Key
                </label>
                <div className="text-[10px] md:text-xs text-indigo-400 mb-1 leading-tight flex justify-between items-center">
                    <span>Optional. For puzzle generation.</span>
                     <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-game-accent hover:underline flex items-center gap-1">
                        Get Key <ExternalLink size={10} />
                    </a>
                </div>
                <div className="relative">
                    <input 
                        type="password"
                        value={openAiKey}
                        onChange={(e) => setOpenAiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-black/40 border border-indigo-700/50 rounded-lg px-3 py-2 md:px-4 md:py-3 pl-9 md:pl-10 text-white focus:border-game-accent focus:outline-none font-mono text-xs md:text-sm"
                    />
                    <Key className="absolute left-2.5 top-2.5 md:left-3 md:top-3.5 text-gray-500 w-4 h-4 md:w-4 md:h-4" />
                </div>
            </div>

            <div className="h-px bg-white/10 my-2 md:my-4" />

            {/* Provider Selection */}
            <div className="space-y-2 md:space-y-3">
                <label className="block text-indigo-200 font-bold text-sm md:text-base">
                    Puzzle Generation Provider
                </label>
                <div className="flex gap-2 md:gap-4">
                    <button 
                        onClick={() => setProvider('google')}
                        className={`flex-1 py-2 md:py-3 rounded-lg border font-bold text-xs md:text-sm transition-all ${provider === 'google' ? 'bg-indigo-600 border-game-accent text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Google Gemini
                    </button>
                    <button 
                        onClick={() => setProvider('openai')}
                        className={`flex-1 py-2 md:py-3 rounded-lg border font-bold text-xs md:text-sm transition-all ${provider === 'openai' ? 'bg-teal-700 border-teal-400 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                    >
                        OpenAI
                    </button>
                </div>
                <p className="text-[10px] md:text-xs text-indigo-400 mt-1 md:mt-2">
                    Note: Audio solution checking will always use Google Gemini regardless of this setting.
                </p>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-white/10 bg-indigo-950/30 rounded-b-xl md:rounded-b-2xl shrink-0">
            <button 
                onClick={handleSave}
                className="w-full bg-game-accent hover:bg-yellow-400 text-black font-display font-bold text-base md:text-xl py-2 md:py-3 rounded-lg md:rounded-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4 md:w-5 md:h-5" /> Save Settings
            </button>
        </div>

      </div>
    </div>
  );
};
