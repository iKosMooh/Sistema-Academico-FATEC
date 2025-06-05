'use client';
import { useEffect, useState } from "react";
import { useAppContext } from "./AppContext";
import { PlanejamentoAulas } from "./PlanejamentoAulas";
import { RegistroAulas } from "./RegistroAulas";
import { GerenciarAulasRecorrentes } from "./GerenciarAulasRecorrentes";
import { VincularAlunosTurma } from "./VincularAlunosTurma";
import { VincularMateriasCurso } from "./VincularMateriasCurso";
import { ArquivosTurma } from "./ArquivosTurma";
import { TurmaDashboard } from '../dashboard/TurmaDashboard';
import { LancamentoNotas } from './LancamentoNotas';
import { VisualizarNotas } from './VisualizarNotas';

const menuGroups = [
  {
    label: "Gerenciamento de Turma",
    items: [
      { label: "Dashboard", key: "dashboard", component: TurmaDashboard },
      { label: "Calendário de Aulas", key: "planejamento", component: PlanejamentoAulas },
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
    label: "Outros",
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
  const { turma, setTurma, setDisciplina, setDisciplinas } = useAppContext();
  const [turmas, setTurmas] = useState<{ id: string; nome: string; idCurso: number }[]>([]);

  useEffect(() => {
    // Busca turmas do banco
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "turmas",
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setTurmas(
            result.data.map((t: { idTurma: number | string; nomeTurma: string }) => ({
              id: String(t.idTurma),
              nome: t.nomeTurma,
            }))
          );
        }
      });
  }, []);

  const handleGroupClick = (label: string) => {
    setOpenGroup(openGroup === label ? null : label);
  };

  const handleSelect = (key: string) => {
    setSelectedKey(key);

    if ((key === 'lancamento-notas' || key === 'visualizar-notas') && turma?.id) {
      console.log('Buscando disciplinas para turma:', turma);

      fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "cursoMaterias",
          relations: {
            materia: true,
            curso: {
              include: {
                turmas: {
                  where: {
                    idTurma: Number(turma.id)
                  }
                }
              }
            }
          },
          where: {
            curso: {
              turmas: {
                some: {
                  idTurma: Number(turma.id)
                }
              }
            }
          }
        })
      })
        .then(res => res.json())
        .then(result => {
          console.log('Resposta disciplinas:', result);
          if (result.success && result.data) {
            interface CursoMateria {
              materia: {
                idMateria: number;
                nomeMateria: string;
              } | null;
            }

            const disciplinasFormatadas = result.data
              .filter((cm: CursoMateria) => cm.materia)
              .map((cm: CursoMateria) => ({
                idMateria: cm.materia!.idMateria,
                nomeMateria: cm.materia!.nomeMateria
              }));
            console.log('Disciplinas formatadas:', disciplinasFormatadas);
            setDisciplinas(disciplinasFormatadas);
          } else {
            console.error('Erro ao buscar disciplinas:', result.error);
            setDisciplinas([]);
          }
        })
        .catch(error => {
          console.error('Erro na requisição:', error);
          setDisciplinas([]);
        });
    }
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

  return (
    <div className="flex">
      <aside className="bg-blue-700 text-white w-64 min-h-screen p-4">
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
                          onClick={() => handleSelect(item.key)}
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
      <main className="flex-1 p-4">{CurrentComponent && <CurrentComponent onClose={() => { }} />}</main>
    </div>
  );
}

export default SidebarTurmas;