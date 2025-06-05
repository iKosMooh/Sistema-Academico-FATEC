'use client';

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Turma { id: string; nome: string; idCurso?: number; }
interface Disciplina { idMateria: number; nomeMateria: string; }

interface AppContextType {
  turma: Turma | null;
  setTurma: (turma: Turma | null) => void;
  disciplina: Disciplina | null;
  setDisciplina: (disciplina: Disciplina | null) => void;
  disciplinas: Disciplina[];
  setDisciplinas: (disciplinas: Disciplina[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [turma, setTurma] = useState<Turma | null>(null);
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);

  return (
    <AppContext.Provider
      value={{
        turma,
        setTurma,
        disciplina,
        setDisciplina,
        disciplinas,
        setDisciplinas,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppContextProvider');
  }
  return context;
}
