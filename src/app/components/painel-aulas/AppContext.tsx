import React, { createContext, useContext, useState } from "react";

export interface Turma { id: string; nome: string; }
export interface Disciplina { id: string; nome: string; }
export interface Usuario { nome: string; tipo: string; }

interface AppContextType {
  turma: Turma | null;
  setTurma: (t: Turma | null) => void;
  disciplina: Disciplina | null;
  setDisciplina: (d: Disciplina | null) => void;
  usuario: Usuario;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [turma, setTurma] = useState<Turma | null>(null);
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null);
  const usuario = { nome: "Administrador", tipo: "Admin" };

  return (
    <AppContext.Provider value={{ turma, setTurma, disciplina, setDisciplina, usuario }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext deve ser usado dentro de AppProvider");
  return ctx;
}
