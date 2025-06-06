'use client';
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/components/painel-aulas/AppContext";
import { PlanejamentoAulas } from "@/app/components/painel-aulas/PlanejamentoAulas";
import { RegistroAulas } from "@/app/components/painel-aulas/RegistroAulas";
import { GerenciarAulasRecorrentes } from "@/app/components/painel-aulas/GerenciarAulasRecorrentes";
import { VincularAlunosTurma } from "@/app/components/painel-aulas/VincularAlunosTurma";
import { VincularMateriasCurso } from "@/app/components/painel-aulas/VincularMateriasCurso";
import { ArquivosTurma } from "@/app/components/painel-aulas/ArquivosTurma";
import { TurmaDashboard } from "@/app/components/dashboard/TurmaDashboard";
import { LancamentoNotas } from "@/app/components/painel-aulas/LancamentoNotas";
import { VisualizarNotas } from "@/app/components/painel-aulas/VisualizarNotas";
import { AtestadosProfessor } from "@/app/components/painel-aulas/AtestadosProfessor";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { UsuariosDashboard } from "@/app/pages/admin/usuarios/dashboard/page";

const menuGroups = [
  {
    label: "Gerenciamento de Turma",
    items: [
      { label: "Dashboard", key: "dashboard", component: TurmaDashboard },
      { label: "Planejamento de Aulas", key: "planejamento", component: PlanejamentoAulas },
      { label: "Registro de Aulas / Frequência", key: "registro", component: RegistroAulas },
      { label: "Gerenciar Aulas Recorrentes", key: "recorrentes", component: GerenciarAulasRecorrentes },
      { label: "Vincular Alunos à Turma", key: "alunos", component: VincularAlunosTurma },
      { label: "Lançamento de Notas", key: "lancamento-notas", component: LancamentoNotas },
      { label: "Visualizar Notas", key: "visualizar-notas", component: VisualizarNotas },
      { label: "Disciplinas", key: "disciplinas", component: VincularMateriasCurso },
      { label: "Arquivos", key: "arquivos", component: ArquivosTurma },
    ],
  },
  {
    label: "Gerenciamento de Usuários",
    items: [
      { label: "Gerenciar Usuários", key: "usuarios-dashboard", component: UsuariosDashboard },
    ],
  },
  {
    label: "Gerenciamento de Cursos",
    items: [
      { label: "Professores", key: "professores", component: () => <div>Em desenvolvimento...</div> },
      { label: "Turmas", key: "turmas", component: () => <div>Em desenvolvimento...</div> },
      { label: "Presenças", key: "presencas", component: () => <div>Em desenvolvimento...</div> },
    ],
  },
];

export function SidebarTurmas() {
  const [openGroup, setOpenGroup] = useState<string | null>("Gerenciamento de Turma");
  const [selectedKey, setSelectedKey] = useState<string>("dashboard");
  const { turma, setTurma, setDisciplina } = useAppContext();
  const [turmas, setTurmas] = useState<{ id: string; nome: string; idCurso: number }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'turmas' | 'calendario' | 'atestados'>('turmas');

  useEffect(() => {
    // Busca turmas do banco - seguindo padrão dos outros arquivos
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "turmas", // Usar nome correto baseado nos outros arquivos
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log('Resultado busca turmas sidebar:', result);
        if (result.success) {
          setTurmas(
            result.data.map((t: { idTurma: number | string; nomeTurma: string; idCurso?: number }) => ({
              id: String(t.idTurma),
              nome: t.nomeTurma,
              idCurso: t.idCurso || 0
            }))
          );
        } else {
          console.error('Erro ao buscar turmas:', result.error);
        }
      })
      .catch(error => {
        console.error('Erro na requisição turmas:', error);
      });
  }, []);

  const handleGroupClick = (label: string) => {
    setOpenGroup(openGroup === label ? null : label);
  };
  // Também adicionar o idCurso quando seleciona uma turma
  interface Turma {
    id: string;
    nome: string;
    idCurso?: number;
  }

  const handleTurmaSelect = (selectedTurma: Turma | null) => {
    if (selectedTurma) {
      setTurma({
        id: selectedTurma.id,
        nome: selectedTurma.nome,
        idCurso: selectedTurma.idCurso ?? 0
      });
    } else {
      setTurma(null);
    }
    setDisciplina(null);
  };

  // Verifica se o grupo atual é Gerenciamento de Turma
  const isGerenciamentoTurma = openGroup === "Gerenciamento de Turma";

  // Encontra o componente atual baseado na key selecionada
  const CurrentComponent = menuGroups
    .flatMap((group) => group.items)
    .find((item) => item.key === selectedKey)?.component;

  // Novo: Wrapper para bloquear acesso se não houver turma selecionada
  function TurmaGuard({ children }: { children: React.ReactNode }) {
    if (!turma?.id) {
      return (
        <div className="p-6">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
            Selecione uma turma para visualizar este conteúdo.
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Lista de componentes que exigem turma selecionada
  const exigeTurma = [
    "planejamento",
    "registro",
    "recorrentes",
    "alunos",
    "lancamento-notas",
    "visualizar-notas",
    "disciplinas",
    "arquivos",
  ];

  return (
    <div className="flex relative">
      {/* Botão flutuante para abrir/fechar sidebar */}
      <button
        className={`fixed top-6 left-6 z-50 bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2
          ${sidebarOpen ? "ring-2 ring-yellow-300" : ""}
        `}
        style={{ boxShadow: "0 4px 24px rgba(13,102,216,0.18)" }}
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {sidebarOpen ? (
          <XMarkIcon className="w-7 h-7" />
        ) : (
          <Bars3Icon className="w-7 h-7" />
        )}
        <span className="hidden md:inline font-semibold">Menu</span>
      </button>

      {/* Overlay escuro ao abrir sidebar (mobile) */}
      {/* Removido background para não escurecer a tela */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${sidebarOpen ? "block" : "hidden"}`}
        style={{ pointerEvents: "none", background: "transparent" }}
        aria-hidden="true"
      />

      {/* Sidebar funcional, permanece aberta até clicar no botão */}
      <aside
        id="sidebar-turmas"
        className={`
          fixed md:static top-0 left-0 z-50 bg-blue-700 text-white w-72 min-h-screen p-4 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          shadow-2xl md:shadow-none
        `}
        style={{
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          display: sidebarOpen ? "block" : "none",
        }}
      >
        {isGerenciamentoTurma && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-white">Turma</label>
            <select
              className="w-full border rounded px-2 py-1 text-gray-900 bg-white"
              value={turma?.id || ""}
              onChange={(e) => {
                const turmaSelected = turmas.find((t) => t.id === e.target.value) || null;
                handleTurmaSelect(turmaSelected);
              }}
            >
              <option value="">Selecione a turma</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Menu de navegação */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('turmas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'turmas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📚 Turmas
            </button>
            <button
              onClick={() => {
                setActiveView('calendario');
                setSelectedKey('planejamento'); // Definir a chave para Planejamento de Aulas
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'calendario'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📅 Calendário
            </button>
            <button
              onClick={() => setActiveView('atestados')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'atestados'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏥 Atestados
            </button>
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            {menuGroups.map((group) => (
              <li key={group.label}>
                <button
                  className="w-full flex justify-between items-center text-left font-semibold px-2 py-2 rounded hover:bg-blue-600 transition"
                  onClick={() => handleGroupClick(group.label)}
                  aria-expanded={openGroup === group.label}
                >
                  {group.label}
                  <span className="ml-2">{openGroup === group.label ? "▲" : "▼"}</span>
                </button>
                {openGroup === group.label && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {group.items.map((item) => (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => setSelectedKey(item.key)}
                          className={`block w-full text-left text-sm px-2 py-1 rounded ${selectedKey === item.key ? "bg-blue-900 font-bold" : "hover:bg-blue-800"
                            }`}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Conteúdo principal */}
      <main className={`flex-1 p-4 ${sidebarOpen ? "md:ml-72" : ""}`}>
        {activeView === 'atestados' ? (
          <AtestadosProfessor />
        ) : activeView === 'calendario' ? (
          <TurmaGuard>
            <PlanejamentoAulas />
          </TurmaGuard>
        ) : CurrentComponent &&
          (selectedKey === "dashboard" ? (
            <CurrentComponent onClose={() => { }} />
          ) : exigeTurma.includes(selectedKey) ? (
            <TurmaGuard>
              <CurrentComponent onClose={() => { }} />
            </TurmaGuard>
          ) : (
            // Para o dashboard de usuários e outros que não dependem de turma
            <CurrentComponent onClose={() => { }} />
          ))}
      </main>
    </div>
  );
}

export default SidebarTurmas;