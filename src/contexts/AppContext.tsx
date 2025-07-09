import React, { createContext, useContext, ReactNode } from 'react';
import { Cliente, Patinete, Contrato, FluxoCaixa } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AppContextType {
  clientes: Cliente[];
  setClientes: (clientes: Cliente[] | ((prev: Cliente[]) => Cliente[])) => void;
  patinetes: Patinete[];
  setPatinetes: (patinetes: Patinete[] | ((prev: Patinete[]) => Patinete[])) => void;
  contratos: Contrato[];
  setContratos: (contratos: Contrato[] | ((prev: Contrato[]) => Contrato[])) => void;
  fluxoCaixa: FluxoCaixa[];
  setFluxoCaixa: (fluxoCaixa: FluxoCaixa[] | ((prev: FluxoCaixa[]) => FluxoCaixa[])) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  // Zerando todos os dados iniciais para começar limpo
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('veeloway-clientes', []);
  const [patinetes, setPatinetes] = useLocalStorage<Patinete[]>('veeloway-patinetes', []);
  const [contratos, setContratos] = useLocalStorage<Contrato[]>('veeloway-contratos', []);
  const [fluxoCaixa, setFluxoCaixa] = useLocalStorage<FluxoCaixa[]>('veeloway-fluxo', []);

  return (
    <AppContext.Provider
      value={{
        clientes,
        setClientes,
        patinetes,
        setPatinetes,
        contratos,
        setContratos,
        fluxoCaixa,
        setFluxoCaixa,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};