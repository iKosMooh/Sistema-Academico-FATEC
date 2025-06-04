import { GerenciarAulasRecorrentes } from "./GerenciarAulasRecorrentes";
import { useState } from "react";
import { PlanejamentoAulas } from "./PlanejamentoAulas";
import { TemplatesAula } from "./TemplatesAula";
import { RegistroAulas } from "./RegistroAulas";
import { HistoricoModificacoes } from "./HistoricoModificacoes";
import { VincularMateriasCurso } from "./VincularMateriasCurso"; // NOVO
import { useAppContext } from "./AppContext";

export function TabsContainer() {
  const { turma } = useAppContext();
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const TABS = [
    { label: "Planejamento de Aulas", component: PlanejamentoAulas },
    { label: "Templates e Projetos de Aula", component: TemplatesAula },
    { label: "Registro de Aulas / Frequência", component: RegistroAulas },
    { label: "Histórico de Modificações", component: HistoricoModificacoes },
    { label: "Vincular Matérias ao Curso", component: VincularMateriasCurso },
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
              active === idx
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActive(idx)}
            aria-current={active === idx ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
        <button
          className="px-4 py-2 font-medium border-b-2 border-transparent text-gray-600 hover:text-blue-600"
          onClick={() => setModalOpen(true)}
        >
          Gerenciar Aulas Recorrentes
        </button>
      </nav>
      <div>
        <ActiveComponent />
      </div>
      <GerenciarAulasRecorrentes isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
