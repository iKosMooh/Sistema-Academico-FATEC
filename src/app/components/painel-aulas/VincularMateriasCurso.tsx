"use client";
import { useEffect, useState } from "react";

/**
 * Guia para vincular múltiplas matérias a um curso selecionado.
 * Exibe uma lista de cursos, ao clicar em um curso mostra as matérias para vincular.
 * Agora com filtro local para cursos e matérias.
 */
export function VincularMateriasCurso() {
  const [cursos, setCursos] = useState<{ idCurso: number; nomeCurso: string }[]>([]);
  const [materias, setMaterias] = useState<{ idMateria: number; nomeMateria: string }[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<number | null>(null);
  const [materiasSelecionadas, setMateriasSelecionadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cursoFiltro, setCursoFiltro] = useState("");
  const [materiaFiltro, setMateriaFiltro] = useState("");

  // Carrega cursos e matérias ao montar
  useEffect(() => {
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "get", table: "curso" }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setCursos(result.data);
      });

    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "get", table: "materias" }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setMaterias(result.data);
      });
  }, []);

  // Define type for cursoMaterias item
  type CursoMateria = {
    idCurso: number;
    idMateria: number;
  };

  // Carrega matérias já vinculadas ao curso selecionado
  useEffect(() => {
    if (!cursoSelecionado) {
      setMateriasSelecionadas([]);
      return;
    }
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "cursoMaterias",
        relations: { materia: true },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const vinculadas = (result.data as CursoMateria[])
            .filter((cm) => cm.idCurso === cursoSelecionado)
            .map((cm) => cm.idMateria);
          setMateriasSelecionadas(vinculadas);
        }
      });
  }, [cursoSelecionado]);

  const handleMateriaToggle = (idMateria: number) => {
    setMateriasSelecionadas((prev) =>
      prev.includes(idMateria)
        ? prev.filter((id) => id !== idMateria)
        : [...prev, idMateria]
    );
  };

  const handleVincular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoSelecionado) {
      setError("Selecione um curso.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Remove todos os vínculos antigos do curso
      await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          table: "cursoMaterias",
          primaryKey: "idCurso",
          data: { idCurso: cursoSelecionado },
        }),
      });
      // Insere os vínculos selecionados
      for (const idMateria of materiasSelecionadas) {
        await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "insert",
            table: "cursoMaterias",
            data: {
              idCurso: cursoSelecionado,
              idMateria: idMateria,
              cargaHoraria: 60, // valor padrão, ajuste conforme necessário
            },
          }),
        });
      }
      setSuccess("Matérias vinculadas com sucesso!");
    } catch {
      setError("Erro ao vincular matérias.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Vincular Matérias ao Curso</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Lista de cursos */}
        <div className="w-full md:w-1/3">
          <h3 className="font-semibold mb-2 text-gray-800">Cursos</h3>
          <input
            type="text"
            placeholder="Filtrar cursos..."
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
            value={cursoFiltro}
            onChange={(e) => setCursoFiltro(e.target.value)}
          />
          <ul className="divide-y mt-4">
            {cursos
              .filter((c) =>
                c.nomeCurso.toLowerCase().includes(cursoFiltro.toLowerCase())
              )
              .map((c) => (
                <li
                  key={c.idCurso}
                  className={`p-3 cursor-pointer transition text-center
                    ${
                      cursoSelecionado === null || cursoSelecionado === c.idCurso
                        ? "font-bold"
                        : "hover:bg-blue-50"
                    }`}
                  style={
                    cursoSelecionado === null || cursoSelecionado === c.idCurso
                      ? { padding: 0 }
                      : undefined
                  }
                  onClick={() => {
                    setCursoSelecionado(c.idCurso);
                    setSuccess(null);
                    setError(null);
                  }}
                  tabIndex={0}
                  aria-label={`Selecionar curso ${c.nomeCurso}`}
                >
                  {cursoSelecionado === null || cursoSelecionado === c.idCurso ? (
                    <button
                      type="button"
                      className="w-full font-bold"
                      style={{ border: "none", outline: "none", boxShadow: "none" }}
                    >
                      {c.nomeCurso}
                    </button>
                  ) : (
                    c.nomeCurso
                  )}
                </li>
              ))}
          </ul>
        </div>
        {/* Vinculação de matérias */}
        <div className="flex-1">
          {cursoSelecionado ? (
            <form
              onSubmit={handleVincular}
              className="bg-gray-200 rounded-xl p-6 shadow border border-gray-300 mb-6"
            >
              <div className="mb-4">
                <label className="block mb-1 font-medium ">Matérias do Curso</label>
                <input
                  type="text"
                  placeholder="Filtrar matérias..."
                  className="mb-2 w-full border border-gray-300 rounded px-2 py-1 bg-white"
                  value={materiaFiltro}
                  onChange={(e) => setMateriaFiltro(e.target.value)}
                />
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-gray-200 rounded-2xl bg-white bg-opacity-60 shadow-sm">
                    <thead>
                      <tr>
                        <th className="text-gray-900">Selecionar</th>
                        <th className="text-gray-900">Matéria</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materias
                        .filter((m) =>
                          m.nomeMateria.toLowerCase().includes(materiaFiltro.toLowerCase())
                        )
                        .map((m, idx) => (
                          <tr key={m.idMateria}>
                            <td className={idx % 2 === 0 ? "bg-gray-200 py-2 text-center align-middle" : "bg-gray-50 py-2 text-center align-middle"}>
                              <input
                                type="checkbox"
                                checked={materiasSelecionadas.includes(m.idMateria)}
                                onChange={() => handleMateriaToggle(m.idMateria)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-400 focus:ring-blue-500 transition"
                                disabled={loading}
                                style={{ verticalAlign: "middle" }}
                              />
                            </td>
                            <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900 px-6 py-2" : "bg-gray-50 text-blue-900 px-6 py-2"}>
                              {m.nomeMateria}
                            </td>
                          </tr>
                        ))}
                      {materias.filter((m) =>
                        m.nomeMateria.toLowerCase().includes(materiaFiltro.toLowerCase())
                      ).length === 0 && (
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                            Nenhuma matéria encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Vincular Matérias"}
              </button>
              {error && <p className="text-red-600 mt-2">{error}</p>}
              {success && <p className="text-green-600 mt-2">{success}</p>}
            </form>
          ) : (
            <div className="text-gray-500 mt-8">Selecione um curso para vincular matérias.</div>
          )}
        </div>
      </div>
    </div>
  );
}
