import { useCallback, useEffect, useRef, useState } from 'react';
import { checkVoiceSolution } from '../../../services/geminiService';
import { AiSettings, GameMode } from '../../../types';

interface UseVoiceRecorderOptions {
  phrase: string;
  aiSettings: AiSettings;
  gameMode: GameMode;
  onOpenSettings: () => void;
  onSubmit: (value: string) => void;
}

interface UseVoiceRecorderResult {
  isRecording: boolean;
  isProcessing: boolean;
  recordingError: string;
  aiRejection: boolean;
  hasRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  sendRecording: () => Promise<void>;
  clearRecording: () => void;
  setRecordingError: (message: string) => void;
}

const readBlobAsBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read audio data'));
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Unexpected audio format'));
      }
    };
    reader.readAsDataURL(blob);
  });
};

export const useVoiceRecorder = ({
  phrase,
  aiSettings,
  gameMode,
  onOpenSettings,
  onSubmit,
}: UseVoiceRecorderOptions): UseVoiceRecorderResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [aiRejection, setAiRejection] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingBlobRef = useRef<Blob | null>(null);

  const cleanupRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    chunksRef.current = [];
    recordingBlobRef.current = null;
    setIsRecording(false);
    setHasRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [cleanupRecording]);

  useEffect(() => {
    if (!recordingError) return;
    const timer = setTimeout(() => setRecordingError(''), 3000);
    return () => clearTimeout(timer);
  }, [recordingError]);

  const startRecording = useCallback(async () => {
    if (isProcessing || isRecording) return;

    if (!aiSettings.googleApiKey) {
      onOpenSettings();
      return;
    }

    cleanupRecording();
    setAiRejection(false);
    setRecordingError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];

        if (blob.size < 2000) {
          recordingBlobRef.current = null;
          setHasRecording(false);
          setRecordingError('Recording too short. Tap record and speak clearly.');
        } else {
          recordingBlobRef.current = blob;
          setHasRecording(true);
        }

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Mic access denied', error);
      setRecordingError('Mic Access Denied');
      cleanupRecording();
    }
  }, [aiSettings.googleApiKey, cleanupRecording, isProcessing, isRecording, onOpenSettings]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setIsRecording(false);
      return;
    }

    mediaRecorderRef.current.stop();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const sendRecording = useCallback(async () => {
    if (!hasRecording || isRecording || isProcessing) return;

    if (!aiSettings.googleApiKey) {
      onOpenSettings();
      return;
    }

    const blob = recordingBlobRef.current;
    if (!blob || blob.size === 0) {
      setRecordingError('No recording available. Record again.');
      setHasRecording(false);
      return;
    }

    setIsProcessing(true);
    setRecordingError('');
    setAiRejection(false);

    try {
      const base64String = await readBlobAsBase64(blob);
      const isMatch = await checkVoiceSolution(aiSettings, base64String, phrase);

      if (isMatch) {
        cleanupRecording();
        onSubmit(phrase);
      } else {
        if (gameMode === 'TEACHER') {
          setAiRejection(true);
        } else {
          setRecordingError('Incorrect. Try typing.');
        }
      }
    } catch (error) {
      console.error('Voice analysis error', error);
      setRecordingError('Could not send audio. Try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [aiSettings, cleanupRecording, gameMode, hasRecording, isProcessing, isRecording, onOpenSettings, onSubmit, phrase]);

  const clearRecording = useCallback(() => {
    cleanupRecording();
    setAiRejection(false);
    setRecordingError('');
  }, [cleanupRecording]);

  return {
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
  };
};

