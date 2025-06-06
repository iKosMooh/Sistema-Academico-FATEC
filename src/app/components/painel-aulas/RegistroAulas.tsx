import { useEffect, useState, useCallback } from "react";
import { useAppContext } from "./AppContext";
import { useSession } from "next-auth/react";
import { ConteudoMinistradoForm } from "./ConteudoMinistradoForm";

interface Aula {
  idAula: number;
  dataAula: string;
  horario: string;
  materia?: { nomeMateria?: string };
  presencasAplicadas: boolean;
  aulaConcluida: boolean;
  conteudoMinistrado?: string;
}

interface Aluno {
  idAluno: number;
  nome: string;
  sobrenome: string;
  cpf: string;
}

interface Presenca {
  idAula: number;
  idAluno: number;
  presente: boolean;
}

export function RegistroAulas() {
  const { turma } = useAppContext();
  const { data: session } = useSession();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [selectedAulas, setSelectedAulas] = useState<number[]>([]);
  const [showPresencaModal, setShowPresencaModal] = useState(false);
  const [presencaAulaIds, setPresencaAulaIds] = useState<number[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [presencas, setPresencas] = useState<Record<number, Record<number, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [confirmForaHoje, setConfirmForaHoje] = useState(false);
  const [aulaSelected, setAulaSelected] = useState<Aula | null>(null);

  // Função para carregar aulas
  const carregarAulas = useCallback(async () => {
    if (!turma?.id) {
      setAulas([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "aula",
          relations: { materia: true },
        }),
      });
      const result = await res.json();
      if (result.success) {
        interface AulaAPI {
          idAula: number;
          idTurma: number;
          dataAula: string;
          horario: string;
          materia?: { nomeMateria?: string };
          presencasAplicadas?: boolean;
          aulaConcluida?: boolean;
        }
        setAulas(
          (result.data as AulaAPI[])
            .filter((a: AulaAPI) => String(a.idTurma) === String(turma.id))
            .map((a: AulaAPI) => ({
              idAula: a.idAula,
              dataAula: a.dataAula,
              horario: a.horario,
              materia: a.materia,
              presencasAplicadas: !!a.presencasAplicadas,
              aulaConcluida: !!a.aulaConcluida,
            }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [turma?.id]); // Adicionada dependência turma.id

  // Carrega aulas da turma
  useEffect(() => {
    carregarAulas();
  }, [carregarAulas]); // Atualizado para usar carregarAulas como dependência

  // Carrega alunos vinculados à turma
  useEffect(() => {
    if (!turma?.id) {
      setAlunos([]);
      return;
    }
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "turmaAluno",
        relations: { aluno: true },
        where: { idTurma: Number(turma.id) },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          interface TurmaAlunoAPI {
            idAluno: number;
            aluno?: {
              nome?: string;
              sobrenome?: string;
              cpf?: string;
            };
          }
          setAlunos(
            (result.data as TurmaAlunoAPI[]).map((ta: TurmaAlunoAPI) => ({
              idAluno: ta.idAluno,
              nome: ta.aluno?.nome ?? "",
              sobrenome: ta.aluno?.sobrenome ?? "",
              cpf: ta.aluno?.cpf ?? "",
            }))
          );
        }
      });
  }, [turma]);

  // Carrega presenças das aulas selecionadas
  useEffect(() => {
    if (!showPresencaModal || presencaAulaIds.length === 0) return;
    setLoading(true);
    Promise.all(
      presencaAulaIds.map((idAula) =>
        fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "get",
            table: "presencas",
            where: { idAula },
          }),
        })
          .then((res) => res.json())
          .then((result) => ({
            idAula,
            presencas: result.success ? result.data : [],
          }))
      )
    ).then((results) => {
      const map: Record<number, Record<number, boolean>> = {};
      results.forEach(({ idAula, presencas }) => {
        map[idAula] = {};
        presencas.forEach((p: Presenca) => {
          map[idAula][p.idAluno] = !!p.presente;
        });
      });
      setPresencas(map);
      setLoading(false);
    });
  }, [showPresencaModal, presencaAulaIds]);

  // Seleção de aulas
  const toggleAula = (idAula: number) => {
    setSelectedAulas((prev) =>
      prev.includes(idAula) ? prev.filter((id) => id !== idAula) : [...prev, idAula]
    );
  };

  // Aplica presença em massa
  const handleAplicarPresenca = () => {
    if (selectedAulas.length === 0) return;
    // Verifica se alguma aula não é do dia atual
    const hoje = new Date().toISOString().slice(0, 10);
    const temForaHoje = aulas
      .filter((a) => selectedAulas.includes(a.idAula))
      .some((a) => a.dataAula.slice(0, 10) !== hoje);
    if (temForaHoje && !confirmForaHoje) {
      setConfirmForaHoje(true);
      return;
    }
    setPresencaAulaIds(selectedAulas);
    setShowPresencaModal(true);
    setConfirmForaHoje(false);
  };

  // Salva presenças no banco (permite editar presença já aplicada)
  const salvarPresencas = async () => {
    setLoading(true);
    const idProfessor = session?.user?.cpf || "";
    
    if (!idProfessor) {
      alert("Não foi possível identificar o professor. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      for (const idAula of presencaAulaIds) {
        for (const aluno of alunos) {
          const presente = presencas[idAula]?.[aluno.idAluno] || false;
          
          const response = await fetch("/api/presencas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idAula,
              idAluno: aluno.idAluno,
              idProfessor,
              presente
            })
          });

          if (!response.ok) {
            throw new Error('Erro ao salvar presença');
          }
        }
      }

      setShowPresencaModal(false);
      setSelectedAulas([]);
      setPresencas({});
      await carregarAulas();

    } catch (error) {
      console.error("Erro ao salvar presenças:", error);
      alert("Erro ao salvar presenças. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Atualiza presença de um aluno em uma aula (permite editar sempre)
  const togglePresenca = (idAula: number, idAluno: number) => {
    setPresencas((prev) => ({
      ...prev,
      [idAula]: {
        ...prev[idAula],
        [idAluno]: !prev[idAula]?.[idAluno],
      },
    }));
  };

  // Remove presença (desmarca) no banco para aulas já ministradas
  // (opcional: pode ser removido se togglePresenca + salvarPresencas já faz upsert)
  // Função removerPresenca removida pois não está sendo utilizada.

  // Permite editar presenças mesmo para aulas já aplicadas
  // (não desabilite o checkbox e sempre permita togglePresenca)
  // O botão "Aplicar Presença para Selecionadas" pode ser usado para editar qualquer aula, inclusive já aplicada

  const handleSaveConteudoMinistrado = async (conteudo: string) => {
    if (!aulaSelected) return;

    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          table: "aula",
          where: { idAula: aulaSelected.idAula },
          data: { conteudoMinistrado: conteudo },
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Conteúdo ministrado salvo com sucesso!");
        setAulaSelected({ ...aulaSelected, conteudoMinistrado: conteudo });
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar conteúdo");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-blue-800">Registro de Aulas / Frequência</h2>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={selectedAulas.length === 0}
          onClick={handleAplicarPresenca}
        >
          {selectedAulas.some(idAula => aulas.find(a => a.idAula === idAula)?.presencasAplicadas)
            ? "Editar Presenças das Selecionadas"
            : "Aplicar Presença para Selecionadas"}
        </button>
      </div>
      <div className="bg-gray-200 rounded-xl p-6 shadow border border-gray-300 mb-6">
        <table className="min-w-full text-sm border border-gray-200 rounded-2xl bg-white bg-opacity-60 shadow-sm">
          <thead>
            <tr>
              <th></th>
              <th className="text-blue-900">Data</th>
              <th className="text-blue-900">Horário</th>
              <th className="text-blue-900">Matéria</th>
              <th className="text-blue-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {aulas.map((aula, idx) => (
              <tr key={aula.idAula}>
                <td className={idx % 2 === 0 ? "bg-gray-200" : "bg-gray-50"}>
                  <input
                    type="checkbox"
                    checked={selectedAulas.includes(aula.idAula)}
                    onChange={() => toggleAula(aula.idAula)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-400 focus:ring-blue-500 transition"
                  />
                </td>
                <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900" : "bg-gray-50 text-blue-900"}>
                  {aula.dataAula.slice(0, 10)}
                </td>
                <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900" : "bg-gray-50 text-blue-900"}>
                  {aula.horario}
                </td>
                <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900" : "bg-gray-50 text-blue-900"}>
                  {aula.materia?.nomeMateria || "-"}
                </td>
                <td className={idx % 2 === 0 ? "bg-gray-200" : "bg-gray-50"}>
                  {aula.presencasAplicadas ? (
                    <span className="text-green-700 font-semibold">Presença Aplicada</span>
                  ) : (
                    <span className="text-blue-900">Pendente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmação para aplicar presença em data diferente de hoje */}
      {confirmForaHoje && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-xs w-full">
            <div className="mb-4 text-lg font-semibold text-gray-900">
              Você está aplicando presença para uma data diferente de hoje. Deseja continuar?
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-900"
                onClick={() => setConfirmForaHoje(false)}
              >
                Não
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  setConfirmForaHoje(false);
                  setPresencaAulaIds(selectedAulas);
                  setShowPresencaModal(true);
                }}
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de presença */}
      {showPresencaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full border border-gray-300">
            <h3 className="text-lg font-bold mb-4 text-blue-800">
              Aplicar Presença para {presencaAulaIds.length > 1 ? "Aulas Selecionadas" : "Aula"}
            </h3>
            {presencaAulaIds.map((idAula) => (
              <div key={idAula} className="mb-6">
                <div className="font-semibold mb-2 text-blue-700">
                  Aula #{idAula} - {aulas.find((a) => a.idAula === idAula)?.dataAula.slice(0, 10)}{" "}
                  {aulas.find((a) => a.idAula === idAula)?.horario}
                </div>
                <table className="min-w-full text-sm mb-2">
                  <thead>
                    <tr>
                      <th className="text-blue-900">Aluno</th>
                      <th className="text-blue-900">CPF</th>
                      <th className="text-blue-900">Presente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map((aluno, idx) => (
                      <tr
                        key={aluno.idAluno}
                        className={idx % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                      >
                        <td className="text-blue-900">
                          {aluno.nome} {aluno.sobrenome}
                        </td>
                        <td className="text-blue-900">{aluno.cpf}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!presencas[idAula]?.[aluno.idAluno]}
                            onChange={() => togglePresenca(idAula, aluno.idAluno)}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-400 focus:ring-blue-500 transition"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-900"
                onClick={() => setShowPresencaModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={salvarPresencas}
                disabled={loading}
              >
                Salvar Presenças
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Se uma aula está selecionada, mostra o conteúdo ministrado */}
      {aulaSelected && (
        <div className="mt-6">
          <ConteudoMinistradoForm
            idAula={aulaSelected.idAula}
            conteudoMinistrado={aulaSelected.conteudoMinistrado}
            onSave={handleSaveConteudoMinistrado}
          />
        </div>
      )}
    </div>
  );
}
