import React, { createContext, useContext, useMemo } from 'react';

interface ModalContextValue {
  aiProviderName: string;
  hasActiveApiKey: boolean;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

interface ModalContextProviderProps {
  aiProviderName: string;
  hasActiveApiKey: boolean;
  children: React.ReactNode;
}

export const ModalContextProvider: React.FC<ModalContextProviderProps> = ({
  aiProviderName,
  hasActiveApiKey,
  children,
}) => {
  const value = useMemo(
    () => ({ aiProviderName, hasActiveApiKey }),
    [aiProviderName, hasActiveApiKey]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModalContext must be used within ModalContextProvider');
  }
  return ctx;
};

