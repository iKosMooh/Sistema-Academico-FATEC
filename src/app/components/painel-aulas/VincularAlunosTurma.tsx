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
    // Envie os campos idTurma e idAluno no campo data para o backend tratar corretamente a chave composta
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
    <div className="max-w-4xl mx-auto bg-white rounded shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Vincular Aluno à Turma</h2>
      <div className="mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Filtrar por nome"
          className="border rounded px-2 py-1"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrar por CPF"
          className="border rounded px-2 py-1"
          value={filtroCpf}
          onChange={(e) => setFiltroCpf(e.target.value)}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filtroSemTurma}
            onChange={(e) => setFiltroSemTurma(e.target.checked)}
          />
          Mostrar apenas alunos sem turma
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2">Todos os Alunos</h3>
          <div className="overflow-auto max-h-96 border rounded">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">CPF</th>
                  <th className="p-2 text-left">Ação</th>
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados.map((a) => (
                  <tr key={a.idAluno} className="border-b">
                    <td className="p-2">{a.nome} {a.sobrenome}</td>
                    <td className="p-2">{a.cpf}</td>
                    <td className="p-2">
                      {vinculados.some((v) => v.idAluno === a.idAluno) ? (
                        <span className="text-green-600 font-semibold">Vinculado</span>
                      ) : (
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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
                    <td colSpan={3} className="text-gray-500 p-2">
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Alunos já vinculados à turma</h3>
          <div className="overflow-auto max-h-96 border rounded">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">CPF</th>
                  <th className="p-2 text-left">Ação</th>
                </tr>
              </thead>
              <tbody>
                {vinculados.map((a) => (
                  <tr key={a.idAluno} className="border-b">
                    <td className="p-2">{a.nome} {a.sobrenome}</td>
                    <td className="p-2">{a.cpf}</td>
                    <td className="p-2">
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        onClick={() => desvincularAluno(a.idAluno)}
                      >
                        Desvincular
                      </button>
                    </td>
                  </tr>
                ))}
                {vinculados.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-gray-500 p-2">
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
        <div className="text-center text-gray-500 mt-4">Carregando...</div>
      )}
    </div>
  );
}
