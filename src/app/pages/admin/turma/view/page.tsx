"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { EditModal } from "@/app/components/ui/EditModal";
import { AdminGuard } from "@/app/components/AdminGuard";

interface Curso {
  idCurso: number;
  nomeCurso: string;
}

interface Turma {
  [key: string]: unknown;
  idTurma: number;
  idCurso: number;
  nomeTurma: string;
  anoLetivo: number;
  curso?: { nomeCurso: string };
}

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

  // Buscar cursos para o select do modal
  useEffect(() => {
    async function fetchCursos() {
      try {
        const res = await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "get",
            table: "curso",
          }),
        });
        const result = await res.json();
        if (result.success) setCursos(result.data);
      } catch {}
    }
    fetchCursos();
  }, []);

  const fetchTurmas = async () => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "turmas",
          relations: { curso: true },
        }),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Erro ao carregar turmas.");

      setTurmas(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  const handleDelete = async (idTurma: number) => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          table: "turmas",
          primaryKey: "idTurma",
          data: { idTurma },
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao deletar.");

      await fetchTurmas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const handleEdit = (turma: Turma) => {
    setSelectedTurma(turma);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedTurma: Turma) => {
    try {
      // Envie apenas os campos editáveis e o idCurso (não envie o objeto curso)
      const dataToSend = {
        idTurma: updatedTurma.idTurma,
        nomeTurma: updatedTurma.nomeTurma,
        idCurso: updatedTurma.idCurso,
        anoLetivo: updatedTurma.anoLetivo,
      };

      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          table: "turmas",
          primaryKey: "idTurma",
          data: dataToSend,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao atualizar.");

      await fetchTurmas();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTurma(null);
  };

  return (
    <AdminGuard>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Lista de Turmas</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 border">ID</th>
              <th className="py-2 border">Nome da Turma</th>
              <th className="py-2 border">Curso</th>
              <th className="py-2 border">Ano Letivo</th>
              <th className="py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {turmas.map((turma) => (
              <tr key={turma.idTurma}>
                <td className="py-2 border text-center">{turma.idTurma}</td>
                <td className="py-2 border">{turma.nomeTurma}</td>
                <td className="py-2 border text-center">
                  {turma.curso?.nomeCurso || turma.idCurso}
                </td>
                <td className="py-2 border text-center">{turma.anoLetivo}</td>
                <td className="py-2 border">
                  <ActionButton
                    onEdit={() => handleEdit(turma)}
                    onDelete={() => handleDelete(turma.idTurma)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && selectedTurma && (
          <EditModal<Turma>
            isOpen={isModalOpen}
            onClose={closeModal}
            data={selectedTurma}
            onSave={handleSave}
            fields={[
              "idTurma",
              "nomeTurma",
              "idCurso",
              "anoLetivo",
            ]}
            renderField={(field, value, onChange) => {
              if (field === "idCurso") {
                return (
                  <div key={field}>
                    <label className="block mb-1">Curso</label>
                    <select
                      name="idCurso"
                      value={value}
                      onChange={onChange}
                      className="border px-2 py-1 w-full"
                      required
                    >
                      <option value="">Selecione o curso</option>
                      {cursos.map((curso) => (
                        <option key={curso.idCurso} value={curso.idCurso}>
                          {curso.idCurso} - {curso.nomeCurso}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return undefined;
            }}
          />
        )}

        <button className="mt-4">
          <a href="/pages/admin/turma/create">Adicionar Turma</a>
        </button>
      </div>
    </AdminGuard>
  );
}