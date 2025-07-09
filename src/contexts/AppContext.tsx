import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Cliente, Patinete, Contrato, FluxoCaixa } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AppContextType {
  clientes: Cliente[];
  setClientes: (clientes: Cliente[] | ((prev: Cliente[]) => Cliente[])) => void;
  patinetes: Patinete[];
  setPatinetes: (patinetes: Patinete[] | ((prev: Patinete[]) => Patinete[])) => void;
  contratos: Contrato[];
  setContratos: (contratos: Contrato[] | ((prev: Contrato[]) => Contrato[])) => void;
  fluxoCaixa: FluxoCaixa[];
  setFluxoCaixa: (fluxoCaixa: FluxoCaixa[] | ((prev: FluxoCaixa[]) => FluxoCaixa[])) => void;
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
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
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('veeloway-clientes', []);
  const [patinetes, setPatinetes] = useLocalStorage<Patinete[]>('veeloway-patinetes', []);
  const [contratos, setContratos] = useLocalStorage<Contrato[]>('veeloway-contratos', []);
  const [fluxoCaixa, setFluxoCaixa] = useLocalStorage<FluxoCaixa[]>('veeloway-fluxo', []);

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    clientes,
    setClientes,
    patinetes,
    setPatinetes,
    contratos,
    setContratos,
    fluxoCaixa,
    setFluxoCaixa,
    session,
    user,
    loading,
    signOut,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};