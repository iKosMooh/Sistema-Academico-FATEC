import { useEffect, useState } from "react";
import { useAppContext } from "./AppContext";
import { useSession } from "next-auth/react";

interface Aula {
  idAula: number;
  dataAula: string;
  horario: string;
  materia?: { nomeMateria?: string };
  presencasAplicadas: boolean;
  aulaConcluida: boolean;
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

  // Carrega aulas da turma
  useEffect(() => {
    if (!turma?.id) {
      setAulas([]);
      return;
    }
    setLoading(true);
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "aula",
        relations: { materia: true },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
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
      })
      .finally(() => setLoading(false));
  }, [turma]);

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
      alert("Não foi possível identificar o usuário logado (idProfessor). Faça login novamente.");
      setLoading(false);
      return;
    }
    for (const idAula of presencaAulaIds) {
      for (const aluno of alunos) {
        const presente = presencas[idAula]?.[aluno.idAluno] || false;
        const payload = {
          operation: "upsert",
          table: "presencas",
          data: {
            idAula,
            idAluno: aluno.idAluno,
            idProfessor,
            presente,
          },
        };
        // Loga o payload para depuração
        console.log("Enviando para CRUD:", JSON.stringify(payload));
        await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      // Marca aula como presencasAplicadas
      await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          table: "aula",
          primaryKey: "idAula",
          data: {
            idAula,
            presencasAplicadas: true,
            aulaConcluida: true,
          },
        }),
      });
    }
    setShowPresencaModal(false);
    setSelectedAulas([]);
    setLoading(false);
    // Recarrega aulas e presenças manualmente
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "aula",
        relations: { materia: true },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
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
              .filter((a: AulaAPI) => String(a.idTurma) === String(turma?.id))
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
      });
    setPresencas({});
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

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Registro de Aulas / Frequência</h2>
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
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th></th>
            <th>Data</th>
            <th>Horário</th>
            <th>Matéria</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {aulas.map((aula) => (
            <tr key={aula.idAula} className={aula.presencasAplicadas ? "bg-green-100" : ""}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedAulas.includes(aula.idAula)}
                  onChange={() => toggleAula(aula.idAula)}
                  // Agora permite selecionar aulas já aplicadas para edição
                />
              </td>
              <td>{aula.dataAula.slice(0, 10)}</td>
              <td>{aula.horario}</td>
              <td>{aula.materia?.nomeMateria || "-"}</td>
              <td>
                {aula.presencasAplicadas ? (
                  <span className="text-green-700 font-semibold">Presença Aplicada</span>
                ) : (
                  <span className="text-gray-700">Pendente</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
          <div className="bg-white rounded shadow-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
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
                      <th>Aluno</th>
                      <th>CPF</th>
                      <th>Presente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map((aluno) => (
                      <tr key={aluno.idAluno}>
                        <td>
                          {aluno.nome} {aluno.sobrenome}
                        </td>
                        <td>{aluno.cpf}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!presencas[idAula]?.[aluno.idAluno]}
                            onChange={() => togglePresenca(idAula, aluno.idAluno)}
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
    </div>
  );
}
