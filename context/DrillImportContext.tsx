import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface DrillImportContextValue {
  pendingEncodedPayload: string | null;
  setPendingEncodedPayload: (payload: string | null) => void;
  clearPendingImport: () => void;
}

const DrillImportContext = createContext<DrillImportContextValue | undefined>(undefined);

export function DrillImportProvider({ children }: { children: React.ReactNode }) {
  const [pendingEncodedPayload, setPendingEncodedPayload] = useState<string | null>(null);

  const clearPendingImport = useCallback(() => {
    setPendingEncodedPayload(null);
  }, []);

  const value = useMemo(
    () => ({
      pendingEncodedPayload,
      setPendingEncodedPayload,
      clearPendingImport,
    }),
    [pendingEncodedPayload, clearPendingImport]
  );

  return (
    <DrillImportContext.Provider value={value}>{children}</DrillImportContext.Provider>
  );
}

export function useDrillImport() {
  const context = useContext(DrillImportContext);
  if (!context) {
    throw new Error('useDrillImport must be used within DrillImportProvider');
  }
  return context;
}
