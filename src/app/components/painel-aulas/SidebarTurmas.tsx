import { useEffect, useState } from "react";
import { useAppContext, Turma } from "./AppContext";

export function SidebarTurmas() {
  const { turma, setTurma, setDisciplina } = useAppContext();
  const [turmas, setTurmas] = useState<Turma[]>([]);

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

  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col gap-4 min-h-full">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">Turma</label>
        <select
          className="w-full border rounded px-2 py-1 text-gray-900"
          value={turma?.id || ""}
          onChange={e => {
            const t = turmas.find(t => t.id === e.target.value) || null;
            setTurma(t);
            setDisciplina(null);
          }}
        >
          <option value="">Selecione a turma</option>
          {turmas.map(t => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <button className="bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700">+ Novo Plano de Aula</button>
        <button className="bg-gray-200 rounded px-3 py-2 text-gray-900">Novo Template</button>
        <button className="bg-gray-200 rounded px-3 py-2 text-gray-900">Histórico de Modificações</button>
      </div>
      {/* Filtros rápidos */}
      <div className="mt-6">
        <div className="font-semibold mb-2 text-xs text-gray-700">Filtros rápidos</div>
        <button className="text-blue-800 text-xs block mb-1">Aulas Pendentes</button>
        <button className="text-blue-800 text-xs block mb-1">Por Data</button>
        <button className="text-blue-800 text-xs block">Por Disciplina</button>
      </div>
    </aside>
  );
}
