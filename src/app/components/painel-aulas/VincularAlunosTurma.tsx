import { useEffect, useState } from "react";
import { useAppContext } from "./AppContext";

interface Aluno {
  idAluno: number;
  nome: string;
  sobrenome: string;
  cpf: string;
}

export function VincularAlunosTurma() {
  const { turma } = useAppContext();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [vinculados, setVinculados] = useState<Aluno[]>([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCpf, setFiltroCpf] = useState("");
  const [filtroSemTurma, setFiltroSemTurma] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!turma?.id) {
      setAlunos([]);
      setVinculados([]);
      return;
    }
    setLoading(true);

    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "alunos",
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setAlunos(
            result.data.map((a: Aluno) => ({
              idAluno: a.idAluno,
              nome: a.nome,
              sobrenome: a.sobrenome,
              cpf: a.cpf,
            }))
          );
        }
      });

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
          setVinculados(
            result.data.map((ta: { idAluno: number; aluno?: Aluno }) => ({
              idAluno: ta.idAluno,
              nome: ta.aluno?.nome ?? "",
              sobrenome: ta.aluno?.sobrenome ?? "",
              cpf: ta.aluno?.cpf ?? "",
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, [turma]);

  const alunosFiltrados = alunos
    .filter(
      (a) =>
        (!filtroNome ||
          `${a.nome} ${a.sobrenome}`.toLowerCase().includes(filtroNome.toLowerCase())) &&
        (!filtroCpf || a.cpf.replace(/\D/g, "").includes(filtroCpf.replace(/\D/g, "")))
    )
    .filter((a) =>
      filtroSemTurma ? !vinculados.some((v) => v.idAluno === a.idAluno) : true
    );

  const vincularAluno = async (idAluno: number) => {
    if (!turma?.id) return;
    const res = await fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "insert",
        table: "turmaAluno",
        data: {
          idTurma: Number(turma.id),
          idAluno,
          statusMatricula: "Ativa",
        },
      }),
    });
    const result = await res.json();
    if (result.success || (result.error && typeof result.error === "string" && result.error.includes("Unique constraint failed"))) {
      setVinculados((prev) =>
        prev.some((a) => a.idAluno === idAluno)
          ? prev
          : [...prev, alunos.find((a) => a.idAluno === idAluno)!]
      );
    } else {
      alert(result.error || "Erro ao vincular aluno.");
    }
  };

  const desvincularAluno = async (idAluno: number) => {
    if (!turma?.id) return;
    const res = await fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "delete",
        table: "turmaAluno",
        data: {
          idTurma: Number(turma.id),
          idAluno: Number(idAluno),
        },
      }),
    });
    const result = await res.json();
    if (result.success) {
      setVinculados((prev) => prev.filter((a) => a.idAluno !== idAluno));
    } else {
      alert(result.error || "Erro ao desvincular aluno.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-8 mb-8 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-blue-600 to-blue-500 py-3 px-6 rounded-lg shadow">
        Vincular Alunos à Turma
      </h2>
      
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Filtrar por nome"
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full md:w-auto"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        
        <input
          type="text"
          placeholder="Filtrar por CPF"
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full md:w-auto"
          value={filtroCpf}
          onChange={(e) => setFiltroCpf(e.target.value)}
        />
        
        <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filtroSemTurma}
            onChange={(e) => setFiltroSemTurma(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="font-medium">Mostrar apenas alunos sem turma</span>
        </label>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de todos os alunos */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <h3 className="font-semibold text-lg text-white bg-blue-500 py-3 px-4">
            Todos os Alunos
          </h3>
          <div className="overflow-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alunosFiltrados.map((a) => (
                  <tr key={a.idAluno} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white-900">
                      {a.nome} {a.sobrenome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white-500">
                      {a.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {vinculados.some((v) => v.idAluno === a.idAluno) ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Vinculado
                        </span>
                      ) : (
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                          onClick={() => vincularAluno(a.idAluno)}
                        >
                          Vincular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {alunosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-white-500">
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Lista de alunos vinculados */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <h3 className="font-semibold text-lg text-white bg-blue-500 py-3 px-4">
            Alunos Vinculados
          </h3>
          <div className="overflow-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vinculados.map((a) => (
                  <tr key={a.idAluno} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white-500">
                      {a.nome} {a.sobrenome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white-500">
                      {a.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                        onClick={() => desvincularAluno(a.idAluno)}
                      >
                        Desvincular
                      </button>
                    </td>
                  </tr>
                ))}
                {vinculados.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum aluno vinculado à turma.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando...
          </div>
        </div>
      )}
    </div>
  );
}