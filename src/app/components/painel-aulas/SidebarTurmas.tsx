import { useEffect, useState } from "react";
import { useAppContext, Turma, Disciplina } from "./AppContext";

export function SidebarTurmas() {
  const { turma, setTurma, disciplina, setDisciplina } = useAppContext();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);

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

  useEffect(() => {
    // Busca disciplinas vinculadas à turma selecionada
    if (turma) {
      // Primeiro, busca a turma selecionada para obter o idCurso
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
            setDisciplinas([]);
            return;
          }
          // Agora busca as matérias vinculadas ao curso da turma
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
                const materias = result.data
                  .filter((cm: { idCurso: number | string }) => String(cm.idCurso) === String(idCurso))
                  .map((cm: { idMateria: number | string; materia?: { nomeMateria?: string } }) => ({
                    id: String(cm.idMateria),
                    nome: cm.materia?.nomeMateria || "",
                  }));
                setDisciplinas(materias);
              } else {
                setDisciplinas([]);
              }
            });
        });
    } else {
      setDisciplinas([]);
    }
  }, [turma]);

  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col gap-4 min-h-full">
      <div>
        <label className="block text-sm font-medium mb-1">Turma</label>
        <select
          className="w-full border rounded px-2 py-1"
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
      <div>
        <label className="block text-sm font-medium mb-1">Disciplina</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={disciplina?.id || ""}
          onChange={e => {
            const d = disciplinas.find(d => d.id === e.target.value) || null;
            setDisciplina(d);
          }}
          disabled={!turma}
        >
          <option value="">Selecione a disciplina</option>
          {disciplinas.map(d => (
            <option key={d.id} value={d.id}>{d.nome}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <button className="bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700">+ Novo Plano de Aula</button>
        <button className="bg-gray-200 rounded px-3 py-2">Novo Template</button>
        <button className="bg-gray-200 rounded px-3 py-2">Histórico de Modificações</button>
      </div>
      {/* Filtros rápidos */}
      <div className="mt-6">
        <div className="font-semibold mb-2 text-xs text-gray-500">Filtros rápidos</div>
        <button className="text-blue-700 text-xs block mb-1">Aulas Pendentes</button>
        <button className="text-blue-700 text-xs block mb-1">Por Data</button>
        <button className="text-blue-700 text-xs block">Por Disciplina</button>
      </div>
    </aside>
  );
}
