import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

export type VoiceCommandStatus = 'idle' | 'listening' | 'processing' | 'error';

export interface VoiceCommandResult {
  command: string;
  action: string;
  recognized: boolean;
}

interface UseVoiceCommandOptions {
  onDarkMode?: () => void;
  onLightMode?: () => void;
  onSystemMode?: () => void;
  onIncreaseFontSize?: () => void;
  onDecreaseFontSize?: () => void;
  onResetFontSize?: () => void;
  onToggleHighContrast?: (direction: 'enable' | 'disable' | null) => void;
  onToggleReduceMotion?: (direction: 'enable' | 'disable' | null) => void;
  onToggleSound?: (direction: 'enable' | 'disable' | null) => void;
  onOpenAccessibility?: () => void;
  onAnnounce?: (message: string) => void;
}

async function classifyCommand(
  transcript: string,
): Promise<{ action: string; description: string; recognized: boolean; direction: 'enable' | 'disable' | null }> {
  const { data } = await api.post<{ action: string; description: string; recognized: boolean; direction: 'enable' | 'disable' | null }>(
    '/voice/command',
    { transcript },
  );
  return data;
}

export function useVoiceCommand(options: UseVoiceCommandOptions) {
  const [status, setStatus] = useState<VoiceCommandStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const listeningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const executeAction = useCallback(
    (action: string, description: string, rawText: string, recognized: boolean, direction: 'enable' | 'disable' | null) => {
      setLastResult({ command: rawText, action, recognized });
      options.onAnnounce?.(description);

      switch (action) {
        case 'dark_mode':
          options.onDarkMode?.();
          break;
        case 'light_mode':
          options.onLightMode?.();
          break;
        case 'system_mode':
          options.onSystemMode?.();
          break;
        case 'increase_font':
          options.onIncreaseFontSize?.();
          break;
        case 'decrease_font':
          options.onDecreaseFontSize?.();
          break;
        case 'reset_font':
          options.onResetFontSize?.();
          break;
        case 'toggle_contrast':
          options.onToggleHighContrast?.(direction);
          break;
        case 'toggle_motion':
          options.onToggleReduceMotion?.(direction);
          break;
        case 'toggle_sound':
          options.onToggleSound?.(direction);
          break;
        case 'open_accessibility':
          options.onOpenAccessibility?.();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options],
  );

  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage('Reconhecimento de voz não suportado neste navegador.');
      setStatus('error');
      return;
    }

    // Opera GX tem webkitSpeechRecognition mas não envia áudio para reconhecimento
    const ua = navigator.userAgent;
    if (ua.includes('OPR/') || ua.includes('Opera/')) {
      setErrorMessage('Opera não suporta reconhecimento de voz. Use Chrome.');
      setStatus('error');
      return;
    }

    if (status === 'listening') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
        listeningTimeoutRef.current = null;
      }
      setStatus('processing');
      const text: string = event.results[0][0].transcript;
      setTranscript(text);

      classifyCommand(text)
        .then(({ action, description, recognized, direction }) => {
          executeAction(action, description, text, recognized, direction);
        })
        .catch(() => {
          setErrorMessage('Erro ao comunicar com o servidor.');
          setStatus('error');
        })
        .finally(() => {
          setStatus('idle');
        });
    };

    const clearListeningTimeout = () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
        listeningTimeoutRef.current = null;
      }
    };

    recognition.onerror = (event: any) => {
      clearListeningTimeout();
      if (event.error === 'no-speech') {
        setErrorMessage('Nenhuma fala detectada. Tente novamente.');
      } else if (event.error === 'not-allowed') {
        setErrorMessage('Permissão para microfone negada.');
      } else if (event.error === 'network') {
        setErrorMessage('Erro de rede: reconhecimento de voz bloqueado neste ambiente.');
      } else {
        setErrorMessage(`Erro: ${event.error}`);
      }
      setStatus('error');
    };

    recognition.onend = () => {
      clearListeningTimeout();
      setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    try {
      setStatus('listening');
      setTranscript('');
      setErrorMessage('');
      setLastResult(null);
      listeningTimeoutRef.current = setTimeout(() => {
        recognition.abort();
        setErrorMessage('Tempo de escuta esgotado. Tente novamente.');
        setStatus('error');
      }, 12000);
      recognition.start();
    } catch {
      if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
      setErrorMessage('Não foi possível iniciar o reconhecimento de voz.');
      setStatus('error');
    }
  }, [isSupported, status, executeAction]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus('idle');
  }, []);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  // Auto-resetar status de erro
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => setStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return {
    isSupported,
    status,
    transcript,
    lastResult,
    errorMessage,
    startListening,
    stopListening,
  };
}
