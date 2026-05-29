import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceCommand, type VoiceCommandStatus } from '@/hooks/useVoiceCommand';

interface VoiceCommandButtonProps {
  onDarkMode: () => void;
  onLightMode: () => void;
  onSystemMode: () => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onResetFontSize: () => void;
  onToggleHighContrast: (direction: 'enable' | 'disable' | null) => void;
  onToggleReduceMotion: (direction: 'enable' | 'disable' | null) => void;
  onToggleSound: (direction: 'enable' | 'disable' | null) => void;
  onOpenAccessibility: () => void;
  onAnnounce: (message: string) => void;
}

function getButtonStyle(status: VoiceCommandStatus, isSupported: boolean): string {
  const base =
    'relative p-2 rounded-lg transition-colors accessibility-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ae0f0a]';

  if (!isSupported) return `${base} opacity-40 cursor-not-allowed text-gray-400`;
  if (status === 'listening') return `${base} text-[#ae0f0a] bg-[#ae0f0a]/10 hover:bg-[#ae0f0a]/20`;
  if (status === 'error') return `${base} text-red-500 hover:bg-red-50`;
  if (status === 'processing') return `${base} text-[#ae0f0a] bg-[#ae0f0a]/10`;
  return `${base} text-gray-700 hover:bg-gray-100`;
}

function getAriaLabel(status: VoiceCommandStatus, isSupported: boolean): string {
  if (!isSupported) return 'Reconhecimento de voz não suportado neste navegador';
  if (status === 'listening') return 'Parar gravação de voz';
  if (status === 'processing') return 'Processando comando de voz';
  if (status === 'error') return 'Erro no reconhecimento de voz. Clique para tentar novamente';
  return 'Ativar comando de voz';
}

export const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = (props) => {
  const { isSupported, status, transcript, lastResult, errorMessage, startListening, stopListening } =
    useVoiceCommand({
      onDarkMode: props.onDarkMode,
      onLightMode: props.onLightMode,
      onSystemMode: props.onSystemMode,
      onIncreaseFontSize: props.onIncreaseFontSize,
      onDecreaseFontSize: props.onDecreaseFontSize,
      onResetFontSize: props.onResetFontSize,
      onToggleHighContrast: props.onToggleHighContrast,
      onToggleReduceMotion: props.onToggleReduceMotion,
      onToggleSound: props.onToggleSound,
      onOpenAccessibility: props.onOpenAccessibility,
      onAnnounce: props.onAnnounce,
    });

  const handleClick = () => {
    if (!isSupported) return;
    if (status === 'listening') {
      stopListening();
    } else if (status !== 'processing') {
      startListening();
    }
  };

  const showTooltip = status !== 'idle' || !!lastResult || !!errorMessage;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={!isSupported || status === 'processing'}
        className={getButtonStyle(status, isSupported)}
        aria-label={getAriaLabel(status, isSupported)}
        title={!isSupported ? 'Reconhecimento de voz não suportado' : 'Comando de voz'}
      >
        {/* Anel pulsante ao ouvir */}
        {status === 'listening' && (
          <span
            className="absolute inset-0 rounded-lg animate-ping bg-[#ae0f0a]/30"
            aria-hidden="true"
          />
        )}

        {status === 'processing' ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : status === 'error' ? (
          <MicOff className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Mic className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {/* Tooltip de feedback */}
      {showTooltip && (
        <div
          role="status"
          aria-live="polite"
          className="absolute right-0 top-full mt-2 z-50 min-w-[180px] max-w-xs rounded-lg shadow-lg border text-xs px-3 py-2 bg-white dark:bg-[#1c2130] border-gray-200 dark:border-[#30363d] text-gray-700 dark:text-gray-200"
        >
          {status === 'listening' && (
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#ae0f0a] animate-pulse" aria-hidden="true" />
              Ouvindo…
            </span>
          )}
          {status === 'processing' && transcript && (
            <span>
              <span className="font-medium">Detectado: </span>
              <span className="italic">&ldquo;{transcript}&rdquo;</span>
            </span>
          )}
          {status === 'idle' && lastResult && lastResult.recognized && (
            <span className="text-green-700 dark:text-green-400">
              ✓ &ldquo;{lastResult.command}&rdquo;
            </span>
          )}
          {status === 'idle' && lastResult && !lastResult.recognized && (
            <span className="text-yellow-700 dark:text-yellow-400">
              Comando não reconhecido: &ldquo;{lastResult.command}&rdquo;
            </span>
          )}
          {status === 'error' && errorMessage && (
            <span className="text-red-600 dark:text-red-400">{errorMessage}</span>
          )}
        </div>
      )}
    </div>
  );
};
