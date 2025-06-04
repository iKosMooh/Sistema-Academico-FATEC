"use client";
import { useEffect, useState } from "react";
import { useAppContext } from "../painel-aulas/AppContext";

/**
 * Componente administrativo para agendar, cancelar e remover aulas recorrentes,
 * além de gerenciar feriados/dias não letivos.
 * Agora tudo fica em um modal acionado por botão, junto dos outros submenus.
 */
export function GerenciarAulasRecorrentes({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // States para agendamento
  const [nomeMateria, setNomeMateria] = useState("");
  const [diaSemana, setDiaSemana] = useState<number>(5);
  const [horaInicio, setHoraInicio] = useState("19:00");
  const [duracaoMinutos, setDuracaoMinutos] = useState(45);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [listaExcecoes, setListaExcecoes] = useState<string[]>([]);
  const [excecaoInput, setExcecaoInput] = useState("");
  const [agendamentoMsg, setAgendamentoMsg] = useState<string | null>(null);
  const [agendamentoLoading, setAgendamentoLoading] = useState(false);

  // States para exclusão em massa
  const [nomeMateriaExcluir, setNomeMateriaExcluir] = useState("");
  const [dataInicialExcluir, setDataInicialExcluir] = useState("");
  const [dataFinalExcluir, setDataFinalExcluir] = useState("");
  const [removerMsg, setRemoverMsg] = useState<string | null>(null);
  const [removerLoading, setRemoverLoading] = useState(false);

  // States para feriados
  const [feriadoData, setFeriadoData] = useState("");
  const [feriadoDescricao, setFeriadoDescricao] = useState("");
  const [feriadoMsg, setFeriadoMsg] = useState<string | null>(null);
  const [feriadoLoading, setFeriadoLoading] = useState(false);
  const [feriados, setFeriados] = useState<{ id: number; data: string; descricao?: string }[]>([]);

  const { turma } = useAppContext();
  const [materiasTurma, setMateriasTurma] = useState<{ idMateria: number; nomeMateria: string }[]>([]);

  // Carrega matérias vinculadas à turma selecionada
  useEffect(() => {
    if (turma) {
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
            // Busca o idCurso da turma selecionada
            fetch("/api/crud", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                operation: "get",
                table: "turmas",
              }),
            })
              .then((res) => res.json())
              .then((turmasRes) => {
                const turmaObj = turmasRes.data.find(
                  (t: { idTurma: number | string }) => String(t.idTurma) === turma.id
                );
                const idCurso = turmaObj?.idCurso;
                if (!idCurso) {
                  setMateriasTurma([]);
                  return;
                }
                const materias = result.data
                  .filter((cm: { idCurso: number | string }) => String(cm.idCurso) === String(idCurso))
                  .map((cm: { idMateria: number; materia?: { nomeMateria?: string } }) => ({
                    idMateria: cm.idMateria,
                    nomeMateria: cm.materia?.nomeMateria || "",
                  }));
                setMateriasTurma(materias);
              });
          } else {
            setMateriasTurma([]);
          }
        });
    } else {
      setMateriasTurma([]);
    }
  }, [turma, turma?.id]);

  // Carrega feriados cadastrados
  useEffect(() => {
    fetch("/api/dias-nao-letivos", { method: "GET" })
      .then((res) => {
        if (res.ok) return res.text();
        // Se não for GET permitido, retorna array vazio
        return "[]";
      })
      .then((text) => {
        try {
          const result = JSON.parse(text);
          if (Array.isArray(result)) setFeriados(result);
          else setFeriados([]);
        } catch {
          setFeriados([]);
        }
      });
  }, [feriadoMsg]);

  // Helpers
  const diasSemana = [
    { label: "Domingo", value: 0 },
    { label: "Segunda-feira", value: 1 },
    { label: "Terça-feira", value: 2 },
    { label: "Quarta-feira", value: 3 },
    { label: "Quinta-feira", value: 4 },
    { label: "Sexta-feira", value: 5 },
    { label: "Sábado", value: 6 },
  ];

  // Agendar aulas recorrentes
  async function handleAgendar(e: React.FormEvent) {
    e.preventDefault();
    setAgendamentoMsg(null);
    setAgendamentoLoading(true);
    try {
      // Ajuste: envie idMateria (como number) e idTurma (como number) para o backend
      if (!nomeMateria || !turma?.id) {
        setAgendamentoMsg("Selecione a matéria e a turma.");
        setAgendamentoLoading(false);
        return;
      }
      const res = await fetch("/api/aulas/recorrentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idMateria: Number(nomeMateria),
          idTurma: Number(turma.id),
          diaSemana,
          horaInicio,
          duracaoMinutos,
          dataInicial,
          dataFinal,
          listaExcecoes,
        }),
      });
      let result: Record<string, unknown> = {};
      try {
        result = await res.json();
      } catch (err) {
        console.error("Erro ao fazer parse do JSON da resposta:", err);
        setAgendamentoMsg("Erro ao processar resposta do servidor.");
        setAgendamentoLoading(false);
        return;
      }
      if (res.status === 201) {
        setAgendamentoMsg(
          `Aulas criadas: ${Array.isArray(result.criadas) ? result.criadas.length : 0}. Puladas: ${Array.isArray(result.puladas) ? result.puladas.length : 0}.`
        );
      } else {
        console.error("Erro ao agendar aulas:", result);
        setAgendamentoMsg(typeof result.error === "string" ? result.error : "Erro ao agendar.");
      }
    } catch (err) {
      console.error("Erro inesperado ao agendar aulas:", err);
      setAgendamentoMsg("Erro ao agendar.");
    } finally {
      setAgendamentoLoading(false);
    }
  }

  // Remover aulas em massa
  async function handleRemover(e: React.FormEvent) {
    e.preventDefault();
    setRemoverMsg(null);
    setRemoverLoading(true);
    try {
      const res = await fetch("/api/aulas/multiremove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeMateriaExcluir,
          dataInicialExcluir,
          dataFinalExcluir,
        }),
      });
      const result = await res.json();
      if (res.status === 200) {
        setRemoverMsg(`Aulas removidas: ${result.removidas}`);
      } else {
        setRemoverMsg(result.error || "Erro ao remover.");
      }
    } catch {
      setRemoverMsg("Erro ao remover.");
    } finally {
      setRemoverLoading(false);
    }
  }

  // Adicionar feriado
  async function handleAddFeriado(e: React.FormEvent) {
    e.preventDefault();
    setFeriadoMsg(null);
    setFeriadoLoading(true);
    try {
      const res = await fetch("/api/dias-nao-letivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: feriadoData,
          descricao: feriadoDescricao,
        }),
      });
      const result = await res.json();
      if (res.ok && !result.error) {
        setFeriadoMsg("Feriado cadastrado e aulas canceladas.");
        setFeriadoData("");
        setFeriadoDescricao("");
      } else {
        setFeriadoMsg(result.error || "Erro ao cadastrar feriado.");
      }
    } catch {
      setFeriadoMsg("Erro ao cadastrar feriado.");
    } finally {
      setFeriadoLoading(false);
    }
  }

  // Remover feriado
  async function handleRemoveFeriado(id: number) {
    setFeriadoMsg(null);
    setFeriadoLoading(true);
    try {
      const res = await fetch(`/api/dias-nao-letivos/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok && result.removida) {
        setFeriadoMsg("Feriado removido.");
      } else {
        setFeriadoMsg(result.error || "Erro ao remover feriado.");
      }
    } catch {
      setFeriadoMsg("Erro ao remover feriado.");
    } finally {
      setFeriadoLoading(false);
    }
  }

  // Adiciona data à lista de exceções
  function handleAddExcecao() {
    if (excecaoInput && !listaExcecoes.includes(excecaoInput)) {
      setListaExcecoes((prev) => [...prev, excecaoInput]);
      setExcecaoInput("");
    }
  }
  function handleRemoveExcecao(date: string) {
    setListaExcecoes((prev) => prev.filter((d) => d !== date));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative max-w-2xl w-full max-h-[90vh] bg-white rounded-lg shadow-lg overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gerenciar Aulas Recorrentes e Feriados</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        {/* Agendamento de aulas recorrentes */}
        <form onSubmit={handleAgendar} className="mb-8 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium">Matéria</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={nomeMateria}
                onChange={(e) => setNomeMateria(e.target.value)}
                required
                disabled={!turma}
              >
                <option value="">Selecione a matéria</option>
                {materiasTurma.map((m) => (
                  <option key={m.idMateria} value={m.idMateria}>
                    {m.nomeMateria}
                  </option>
                ))}
              </select>
              {!turma && (
                <span className="text-xs text-gray-500">Selecione uma turma no menu lateral</span>
              )}
            </div>
            <div>
              <label className="block font-medium">Dia da Semana</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={diaSemana}
                onChange={(e) => setDiaSemana(Number(e.target.value))}
                required
              >
                {diasSemana.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Horário de Início</label>
              <input
                type="time"
                className="w-full border rounded px-2 py-1"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Duração (minutos)</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={duracaoMinutos}
                min={1}
                onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Data Inicial</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Data Final</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                required
              />
            </div>
          </div>
          {/* Exceções */}
          <div>
            <label className="block font-medium">Datas de Exceção (feriados, etc.)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={excecaoInput}
                onChange={(e) => setExcecaoInput(e.target.value)}
              />
              <button
                type="button"
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={handleAddExcecao}
                disabled={!excecaoInput}
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {listaExcecoes.map((d) => (
                <span key={d} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                  {d}
                  <button
                    type="button"
                    className="text-red-600 ml-1"
                    onClick={() => handleRemoveExcecao(d)}
                    aria-label="Remover data"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={agendamentoLoading}
            >
              {agendamentoLoading ? "Agendando..." : "Agendar Aulas Recorrentes"}
            </button>
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => {
                setNomeMateria("");
                setDiaSemana(5);
                setHoraInicio("19:00");
                setDuracaoMinutos(45);
                setDataInicial("");
                setDataFinal("");
                setListaExcecoes([]);
                setAgendamentoMsg(null);
              }}
            >
              Limpar Campos
            </button>
          </div>
          {agendamentoMsg && (
            <div className="mt-2 text-sm text-blue-700">{agendamentoMsg}</div>
          )}
        </form>

        {/* Exclusão em massa */}
        <form onSubmit={handleRemover} className="mb-8 space-y-3">
          <h3 className="font-semibold mb-2">Remover Aulas em Massa</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium">Matéria</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={nomeMateriaExcluir}
                onChange={(e) => setNomeMateriaExcluir(e.target.value)}
                required
                disabled={!turma}
              >
                <option value="">Selecione a matéria</option>
                {materiasTurma.map((m) => (
                  <option key={m.idMateria} value={m.idMateria}>
                    {m.nomeMateria}
                  </option>
                ))}
              </select>
              {!turma && (
                <span className="text-xs text-gray-500">Selecione uma turma no menu lateral</span>
              )}
            </div>
            <div>
              <label className="block font-medium">Data Inicial</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1"
                value={dataInicialExcluir}
                onChange={(e) => setDataInicialExcluir(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium">Data Final</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1"
                value={dataFinalExcluir}
                onChange={(e) => setDataFinalExcluir(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              disabled={removerLoading}
            >
              {removerLoading ? "Removendo..." : "Remover Aulas"}
            </button>
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => {
                setNomeMateriaExcluir("");
                setDataInicialExcluir("");
                setDataFinalExcluir("");
                setRemoverMsg(null);
              }}
            >
              Limpar Campos
            </button>
          </div>
          {removerMsg && (
            <div className="mt-2 text-sm text-red-700">{removerMsg}</div>
          )}
        </form>

        {/* Gerenciar feriados */}
        <form onSubmit={handleAddFeriado} className="mb-8 space-y-3">
          <h3 className="font-semibold mb-2">Cadastrar Feriado/Dia Não Letivo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium">Data</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1"
                value={feriadoData}
                onChange={(e) => setFeriadoData(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium">Descrição</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={feriadoDescricao}
                onChange={(e) => setFeriadoDescricao(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
              disabled={feriadoLoading}
            >
              {feriadoLoading ? "Salvando..." : "Cadastrar Feriado"}
            </button>
          </div>
          {feriadoMsg && (
            <div className="mt-2 text-sm text-gray-700">{feriadoMsg}</div>
          )}
        </form>

        {/* Lista de feriados cadastrados */}
        <div>
          <h3 className="font-semibold mb-2">Feriados/Dias Não Letivos Cadastrados</h3>
          <ul className="divide-y border rounded">
            {feriados.map((f) => (
              <li key={f.id} className="flex items-center justify-between p-2">
                <span>
                  {f.data.slice(0, 10)} {f.descricao && `- ${f.descricao}`}
                </span>
                <button
                  className="text-red-600 px-2 py-1 rounded hover:bg-red-100"
                  onClick={() => handleRemoveFeriado(f.id)}
                  disabled={feriadoLoading}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
