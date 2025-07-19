import React, { createContext, useContext, useState } from 'react';

interface FiscalYearContextType {
  fiscalYear: number;
  setFiscalYear: (year: number) => void;
}

const FiscalYearContext = createContext<FiscalYearContextType | undefined>(undefined);

export const FiscalYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const now = new Date();
  const defaultYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const [fiscalYear, setFiscalYear] = useState<number>(defaultYear);
  return (
    <FiscalYearContext.Provider value={{ fiscalYear, setFiscalYear }}>
      {children}
    </FiscalYearContext.Provider>
  );
};

export const useFiscalYear = () => {
  const ctx = useContext(FiscalYearContext);
  if (!ctx) throw new Error('useFiscalYear must be used within FiscalYearProvider');
  return ctx;
}; 