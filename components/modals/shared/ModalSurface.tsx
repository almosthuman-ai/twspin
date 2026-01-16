import React from 'react';

interface ModalSurfaceProps {
  overlayClassName?: string;
  panelClassName?: string;
  children: React.ReactNode;
}

export const ModalSurface: React.FC<ModalSurfaceProps> = ({
  overlayClassName = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4',
  panelClassName = 'bg-game-panel border border-indigo-500/30 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden',
  children,
}) => (
  <div className={overlayClassName}>
    <div
      className={panelClassName}
      style={{ height: 'var(--modal-viewport-height)', maxHeight: 'var(--modal-viewport-height)' }}
    >
      {children}
    </div>
  </div>
);

