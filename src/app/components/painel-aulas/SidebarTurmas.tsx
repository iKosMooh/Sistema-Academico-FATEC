'use client';
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/components/painel-aulas/AppContext";
import { PlanejamentoAulas } from "@/app/components/painel-aulas/PlanejamentoAulas";
import { RegistroAulas } from "@/app/components/painel-aulas/RegistroAulas";
import { GerenciarAulasRecorrentes } from "@/app/components/painel-aulas/GerenciarAulasRecorrentes";
import { VincularAlunosTurma } from "@/app/components/painel-aulas/VincularAlunosTurma";
import { VincularMateriasCurso } from "@/app/components/painel-aulas/VincularMateriasCurso";
import { ArquivosTurma } from "@/app/components/painel-aulas/ArquivosTurma";
import { LancamentoNotas } from "@/app/components/painel-aulas/LancamentoNotas";
import { VisualizarNotas } from "@/app/components/painel-aulas/VisualizarNotas";
import { AtestadosProfessor } from "@/app/components/painel-aulas/AtestadosProfessor";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import UsuariosDashboard from "@/app/pages/admin/usuarios/dashboard/page";
import AcademicoDashboardPage from "@/app/pages/admin/academico/dashboard/page";
import { TurmaDashboard } from "@/app/components/dashboard/TurmaDashboard";
import { useSession } from "next-auth/react";
import { AvaliacaoPreCadastros } from "@/app/components/painel-aulas/AvaliacaoPreCadastros";

// Menu para professores
const menuGroupsProfessor = [
  {
    label: "Gerenciamento de Turma",
    items: [
      { label: "Registro de Aulas / Frequência", key: "registro", component: RegistroAulas },
      { label: "Gerenciar Aulas Recorrentes", key: "recorrentes", component: GerenciarAulasRecorrentes },
      { label: "Lançamento de Notas", key: "lancamento-notas", component: LancamentoNotas },
      { label: "Visualizar Notas", key: "visualizar-notas", component: VisualizarNotas },
      { label: "Arquivos", key: "arquivos", component: ArquivosTurma },
    ],
  },
];

// Menu para admin e coordenador
const menuGroupsAdmin = [
  {
    label: "Gerenciamento de Turma",
    items: [
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
      {
        label: "Gerenciar Cursos",
        key: "dashboard-academico",
        component: AcademicoDashboardPage
      }
    ],
  },
  {
    label: "Pré-Matrículas",
    items: [
      {
        label: "Avaliar Pré-Cadastros",
        key: "pre-cadastros",
        component: AvaliacaoPreCadastros
      }
    ],
  },
];

export function SidebarTurmas() {
  const [openGroup, setOpenGroup] = useState<string | null>("Gerenciamento de Turma");
  const [selectedKey, setSelectedKey] = useState<string>("dashboard");
  const { turma, setTurma, setDisciplina } = useAppContext();
  const [turmas, setTurmas] = useState<{ id: string; nome: string; idCurso: number }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'painel' | 'normal'>('normal');
  const { data: session } = useSession();


  // Referência para chamar método do filho AvaliacaoPreCadastros
  const preCadastrosRef = useState<{ carregarPreCadastros?: () => void }>({})[0];

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const response = await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "get",
            table: "turmas",
            relations: { curso: true }
          }),
        });

        const result = await response.json();
        console.log('Resultado busca turmas sidebar:', result);

        if (result.success && result.data) {
          setTurmas(
            result.data.map((t: { idTurma: number | string; nomeTurma: string; idCurso?: number }) => ({
              id: String(t.idTurma),
              nome: t.nomeTurma,
              idCurso: t.idCurso || 0
            }))
          );
        } else {
          console.error('Erro ao buscar turmas:', result.error);
          setTurmas([]);
        }
      } catch (error) {
        console.error('Erro na requisição turmas:', error);
        setTurmas([]);
      }
    };

    fetchTurmas();
  }, []);

  const handleGroupClick = (label: string) => {
    setOpenGroup(openGroup === label ? null : label);
    // Resetar para view normal ao clicar em qualquer grupo
    setActiveView('normal');
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

  // Removido código morto de CurrentComponent, pois não é mais utilizado

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
  const exigeTurma = ["registro", "recorrentes", "alunos", "lancamento-notas", "visualizar-notas", "disciplinas", "arquivos"];

  // Determinar perfil do usuário
  let perfil: "admin" | "coordenador" | "professor" = "professor";
  if (session?.user?.tipo === "Admin") perfil = "admin";
  if (session?.user?.tipo === "Coordenador") perfil = "coordenador";
  // Se não for admin nem coordenador, assume professor

  // Escolhe o menu conforme o perfil
  let menuGroupsToUse = menuGroupsProfessor;
  if (perfil === "admin" || perfil === "coordenador") menuGroupsToUse = menuGroupsAdmin;

  // Busca o componente atual baseado na selectedKey
  const getCurrentComponent = () => {
    for (const group of menuGroupsToUse) {
      const item = group.items.find(item => item.key === selectedKey);
      if (item) return item.component;
    }
    return null;
  };

  const CurrentComponent = getCurrentComponent();

  return (
    <div className="flex relative w-full max-w-full overflow-x-hidden">
      {/* Botão flutuante para abrir/fechar sidebar - sempre visível */}
      <button
        className={`fixed top-6 left-6 z-50 bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2
          ${sidebarOpen ? "ring-2 ring-yellow-300" : ""}
        `}
        style={{ boxShadow: "0 4px 24px rgba(13,102,216,0.18)" }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
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
          display: sidebarOpen ? "block" : "none",
        }}
      >
        {/* Botão fechar apenas no mobile */}
        <div className="flex justify-end mb-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-white hover:bg-blue-600 rounded-lg transition-colors"
            aria-label="Fechar menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

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
              onClick={() => {
                setActiveView('painel');
                setSelectedKey('dashboard');
                setOpenGroup("Gerenciamento de Turma");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'painel'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-white hover:bg-gray-300'
                }`}
            >
              📊 Painel
            </button>
            <button
              onClick={() => {
                setActiveView('painel');
                setSelectedKey('planejamento');
                setOpenGroup("Gerenciamento de Turma");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'painel' && selectedKey === 'planejamento'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-white hover:bg-gray-300'
                }`}
            >
              📅 Calendário
            </button>
            <button
              onClick={() => {
                setActiveView('painel');
                setSelectedKey('atestados');
                setOpenGroup(null); // Não precisa de grupo específico
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'painel' && selectedKey === 'atestados'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-white hover:bg-gray-300'
                }`}
            >
              🏥 Atestados
            </button>
            {/* Botão de Pré-Cadastros apenas para admins e coordenadores */}
            {(perfil === "admin" || perfil === "coordenador") && (
              <button
                onClick={() => {
                  setActiveView('painel');
                  setSelectedKey('pre-cadastros');
                  setOpenGroup(null);
                  // Chama o carregamento dos pré-cadastros ao clicar
                  setTimeout(() => {
                    if (preCadastrosRef.carregarPreCadastros) preCadastrosRef.carregarPreCadastros();
                  }, 0);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'painel' && selectedKey === 'pre-cadastros'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-white hover:bg-gray-300'
                  }`}
              >
                📝 Pré-Matrículas
              </button>
            )}
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            {menuGroupsToUse.map((group) => (
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
                          onClick={() => {
                            setSelectedKey(item.key);
                            setActiveView('normal'); // Resetar para view normal
                          }}
                          className={`block w-full text-left text-sm px-2 py-1 rounded ${selectedKey === item.key && activeView === 'normal' ? "bg-blue-900 font-bold" : "hover:bg-blue-800"
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
      <main className={`flex-1 p-4 min-w-0 w-0`}>
        {activeView === 'painel' && selectedKey === 'atestados' ? (
          <AtestadosProfessor />
        ) : activeView === 'painel' && selectedKey === 'planejamento' ? (
          <TurmaGuard>
            <PlanejamentoAulas />
          </TurmaGuard>
        ) : activeView === 'painel' && selectedKey === 'dashboard' ? (
          <TurmaDashboard />
        ) : activeView === 'painel' && selectedKey === 'pre-cadastros' ? (
          <AvaliacaoPreCadastros />
        ) : activeView === 'normal' && CurrentComponent ? (
          exigeTurma.includes(selectedKey) ? (
            <TurmaGuard>
              <CurrentComponent onClose={() => { }} />
            </TurmaGuard>
          ) : (
            <CurrentComponent onClose={() => { }} />
          )
        ) : (
          // Mensagem padrão quando nada está carregado
          <div className="flex flex-col items-center justify-center text-center text-blue-900 mt-24 overflow-hidden">
            <span className="text-2xl font-semibold mb-4">Painel de Aulas</span>
            <p className="text-base md:text-lg bg-blue-100 border border-blue-200 rounded-xl px-6 py-4 shadow">
              No menu lateral esquerdo selecione uma turma e uma opção para visualizar suas respectivas informações.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default SidebarTurmas;