import { useAppContext } from "./AppContext";
import { useState } from "react";
import { PlanejamentoAulas } from "./PlanejamentoAulas";
import { GerenciarAulasRecorrentes } from "./GerenciarAulasRecorrentes";
import { TemplatesAula } from "./TemplatesAula";
import { RegistroAulas } from "./RegistroAulas";
import { HistoricoModificacoes } from "./HistoricoModificacoes";
import { VincularMateriasCurso } from "./VincularMateriasCurso"; // NOVO
import { ArquivosTurma } from "./ArquivosTurma";
import { VincularAlunosTurma } from "./VincularAlunosTurma";

export function TabsContainer() {
  const { turma } = useAppContext();
  const [active, setActive] = useState(0);
  const [showGerenciarAulas, setShowGerenciarAulas] = useState(false);
  // Novo: flag para forçar reload de todos os dados do TabsContainer
  const [reloadFlag, setReloadFlag] = useState(0);

  // Função para ser chamada após qualquer alteração relevante
  const forceReload = () => setReloadFlag(f => f + 1);

  const TABS = [
    { label: "Planejamento de Aulas", component: PlanejamentoAulas },
    { label: "Templates e Projetos de Aula", component: TemplatesAula },
    { label: "Registro de Aulas / Frequência", component: RegistroAulas },
    { label: "Histórico de Modificações", component: HistoricoModificacoes },
    { label: "Vincular Matérias ao Curso", component: VincularMateriasCurso },
    { label: "Arquivos da Turma/Curso", component: ArquivosTurma },
    { label: "Vincular Aluno à Turma", component: VincularAlunosTurma }, // NOVO
  ];

  if (!turma) {
    return (
      <div className="text-center text-gray-500 mt-12">
        <span>Selecione uma turma no menu lateral para acessar as funcionalidades.</span>
      </div>
    );
  }

  const ActiveComponent = TABS[active].component;

  return (
    <div>
      <nav className="flex gap-2 border-b mb-4 overflow-x-auto">
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              active === idx && !showGerenciarAulas
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => {
              setShowGerenciarAulas(false);
              setActive(idx);
            }}
            aria-current={active === idx && !showGerenciarAulas ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
        <button
          className={`px-4 py-2 font-medium border-b-2 transition ${
            showGerenciarAulas
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => setShowGerenciarAulas(true)}
        >
          Gerenciar Aulas Recorrentes
        </button>
      </nav>
      <div>
        {showGerenciarAulas ? (
          <GerenciarAulasRecorrentes
            onClose={() => setShowGerenciarAulas(false)}
            onAnyChange={forceReload}
          />
        ) : (
          ActiveComponent
            ? <ActiveComponent reloadFlag={reloadFlag} {...(ActiveComponent === PlanejamentoAulas || ActiveComponent === TemplatesAula || ActiveComponent === RegistroAulas ? { forceReload } : {})} />
            : null
        )}
      </div>
    </div>
  );
}
