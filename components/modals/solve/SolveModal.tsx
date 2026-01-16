import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Trash2, XCircle } from 'lucide-react';
import { AiSettings, GameMode } from '../../../types';
import { ModalSurface } from '../shared';
import { useVoiceRecorder } from './useVoiceRecorder';

interface SolveModalProps {
  phrase: string;
  onSubmit: (guess: string) => void;
  onCancel: () => void;
  aiSettings: AiSettings;
  gameMode: GameMode;
  onOpenSettings: () => void;
}

export const SolveModal: React.FC<SolveModalProps> = ({
  phrase,
  onSubmit,
  onCancel,
  aiSettings,
  gameMode,
  onOpenSettings,
}) => {
  const [guess, setGuess] = useState('');

  const baseIconUrl = (((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) ?? '/').replace(/\/?$/, '/');
  const micIconSrc = `${baseIconUrl}icons/mic_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg`;
  const sendIconSrc = `${baseIconUrl}icons/send_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg`;
  const clearIconSrc = `${baseIconUrl}icons/restart_alt_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg`;

  const {
    isRecording,
    isProcessing,
    recordingError,
    aiRejection,
    hasRecording,
    startRecording,
    stopRecording,
    sendRecording,
    clearRecording,
    setRecordingError,
  } = useVoiceRecorder({
    phrase,
    aiSettings,
    gameMode,
    onOpenSettings,
    onSubmit: (value) => submitAndClose(value),
  });

  useEffect(() => {
    setRecordingError('');
  }, [setRecordingError, aiSettings.googleApiKey]);

  const submitAndClose = (value: string) => {
    onSubmit(value);
  };

  const handleCancel = () => {
    clearRecording();
    onCancel();
  };

  const canRecord = !(gameMode === 'STUDENT' && recordingError === 'Incorrect. Try typing.');
  const voiceDisabled = !canRecord || isProcessing;

  return (
    <ModalSurface panelClassName="bg-game-panel border-2 border-game-accent p-4 md:p-6 rounded-xl w-[95%] max-w-lg shadow-2xl relative overflow-hidden">
      <h3 className="text-lg md:text-xl font-display text-game-accent mb-3 md:mb-4 text-center">Solve the Puzzle</h3>

      {recordingError && (
        <div className="absolute top-2 left-0 right-0 text-center animate-bounce z-50">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {recordingError}
          </span>
        </div>
      )}

      <input
        autoFocus
        className="w-full text-center text-lg md:text-2xl uppercase bg-white text-black font-bold p-2 md:p-4 rounded mb-3 md:mb-4 focus:outline-none focus:ring-4 focus:ring-indigo-500"
        value={guess}
        onChange={(event) => setGuess(event.target.value)}
        placeholder="TYPE YOUR ANSWER"
      />

      <div className="flex flex-col gap-4 md:gap-5">
        <div className="grid grid-cols-3 gap-3">
           <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={voiceDisabled}
              className={`rounded-full flex items-center justify-center transition-all border-2 border-red-500/30 shadow-lg ${
                voiceDisabled
                  ? 'bg-red-900/30 text-red-200/50 cursor-not-allowed opacity-70'
                  : isRecording
                  ? 'bg-red-600 text-white shadow-[0_0_25px_rgba(248,113,113,0.8)] animate-pulse'
                  : 'bg-red-900 text-red-100 hover:bg-red-800'
              }`}
              style={{ width: 'clamp(10vmin, 12vmin, 14vmin)', height: 'clamp(10vmin, 12vmin, 14vmin)' }}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              <img src={micIconSrc} alt="" className={`h-6 w-6 ${voiceDisabled ? 'opacity-60' : ''}`} />
            </button>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Record</span>
          </div>

           <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={sendRecording}
              disabled={!hasRecording || isRecording || isProcessing}
              className={`rounded-full flex items-center justify-center transition-all border-2 border-emerald-400/30 shadow-lg ${
                !hasRecording || isRecording || isProcessing
                  ? 'bg-emerald-900/30 text-emerald-200/50 cursor-not-allowed opacity-70'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
              style={{ width: 'clamp(10vmin, 12vmin, 14vmin)', height: 'clamp(10vmin, 12vmin, 14vmin)' }}
              aria-label="Send recording to AI"
              title="Send recording to AI"
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <img
                  src={sendIconSrc}
                  alt=""
                  className={`h-6 w-6 ${!hasRecording || isRecording ? 'opacity-60' : ''}`}
                />
              )}
            </button>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Send</span>
          </div>

           <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={clearRecording}
              disabled={!hasRecording && !isRecording && !isProcessing}
              className={`rounded-full flex items-center justify-center transition-all border-2 border-gray-400/20 shadow-lg ${
                !hasRecording && !isRecording && !isProcessing
                  ? 'bg-gray-800/40 text-gray-400/60 cursor-not-allowed opacity-70'
                  : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
              }`}
              style={{ width: 'clamp(10vmin, 12vmin, 14vmin)', height: 'clamp(10vmin, 12vmin, 14vmin)' }}
              aria-label="Clear recording"
              title="Clear recording"
            >
              <img
                src={clearIconSrc}
                alt=""
                className={`h-6 w-6 ${!hasRecording && !isRecording && !isProcessing ? 'opacity-60' : ''}`}
              />
            </button>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Clear</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          Tap to record, send the clip for AI scoring, or clear and retry. Audio is discarded automatically when the modal closes.
        </p>

        {aiRejection && gameMode === 'TEACHER' && (
          <div className="bg-red-900/30 border border-red-500/50 rounded p-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-red-300 mb-3 justify-center text-sm md:text-base font-bold">
              <AlertCircle size={16} />
              <span>AI didn't catch that.</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => submitAndClose('INCORRECT_ANSWER_OVERRIDE')}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded flex items-center justify-center gap-1 text-xs md:text-sm"
              >
                <XCircle size={14} /> Mark Incorrect
              </button>
              <button
                onClick={() => submitAndClose(phrase)}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded flex items-center justify-center gap-1 text-xs md:text-sm"
              >
                <CheckCircle2 size={14} /> Teacher Override
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 md:gap-4 mt-2">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-600 py-2 md:py-3 rounded font-bold text-white hover:bg-gray-500 text-sm md:text-base"
          >
            Cancel
          </button>
          <button
            onClick={() => submitAndClose(guess)}
            className="flex-1 bg-game-accent text-game-dark py-2 md:py-3 rounded font-bold hover:bg-yellow-400 text-sm md:text-base"
          >
            SOLVE
          </button>
        </div>
      </div>
    </ModalSurface>
  );
};

