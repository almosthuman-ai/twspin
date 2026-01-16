import React from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';

interface ModalHeaderControlsProps {
  onClose?: () => void;
  onBack?: () => void;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  showDivider?: boolean;
}

export const ModalHeaderControls: React.FC<ModalHeaderControlsProps> = ({
  onClose,
  onBack,
  leftContent,
  centerContent,
  rightContent,
  className = '',
  showDivider = true,
}) => (
  <div
    className={`flex items-center justify-between gap-2 bg-indigo-950/50 p-3 md:p-4 ${
      showDivider ? 'border-b border-white/10' : ''
    } ${className}`}
  >
    <div className="flex items-center gap-2">
      {onBack && (
        <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
      )}
      {leftContent}
    </div>

    <div className="flex-1 flex justify-center">{centerContent}</div>

    <div className="flex items-center gap-2">
      {rightContent}
      {onClose && (
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <XCircle size={22} />
        </button>
      )}
    </div>
  </div>
);

