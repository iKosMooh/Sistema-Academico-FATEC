"use client";
import { useState } from "react";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import SubMenu from "@/app/components/SubMenu/SubMenu";
import { AppProvider } from "@/app/components/painel-aulas/AppContext";
import { PlanejamentoAulas } from "@/app/components/painel-aulas/PlanejamentoAulas";
import { RegistroAulas } from "@/app/components/painel-aulas/RegistroAulas";
import { GerenciarAulasRecorrentes } from "@/app/components/painel-aulas/GerenciarAulasRecorrentes";
import { VincularAlunosTurma } from "@/app/components/painel-aulas/VincularAlunosTurma";
import { VincularMateriasCurso } from "@/app/components/painel-aulas/VincularMateriasCurso";
import { ArquivosTurma } from "@/app/components/painel-aulas/ArquivosTurma";

// Adicione outros componentes conforme necessário

const COMPONENTS: Record<string, React.ReactNode> = {
  planejamento: <PlanejamentoAulas />,
  registro: <RegistroAulas />,
  recorrentes: <GerenciarAulasRecorrentes onClose={() => {}} />,
  alunos: <VincularAlunosTurma />,
  professores: <div>Funcionalidade de Professores</div>,
  turmas: <div>Funcionalidade de Turmas</div>,
  disciplinas: <VincularMateriasCurso />,
  presencas: <div>Funcionalidade de Presenças</div>,
  arquivos: <ArquivosTurma />,
};

export default function PainelAulasPage() {
  const [selectedKey, setSelectedKey] = useState<string>("");

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <SubMenu onSelect={setSelectedKey} selectedKey={selectedKey} />
          <main className="flex-1 p-4 overflow-x-auto">
            {selectedKey
              ? COMPONENTS[selectedKey] || <div>Selecione uma opção no menu.</div>
              : <div>Selecione uma opção no menu.</div>
            }
          </main>
        </div>
        <Footer />
      </div>
    </AppProvider>
  );
}
