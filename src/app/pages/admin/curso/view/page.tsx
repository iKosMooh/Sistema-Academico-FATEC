"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { EditModal } from "@/app/components/ui/EditModal";
import { AdminGuard } from "@/app/components/AdminGuard";

interface Curso {
  [key: string]: unknown;
  idCurso: number;
  nomeCurso: string;
  cargaHorariaTotal: number;
  descricao: string | null;
  docsPath: string | null;
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);

  const fetchCursos = async () => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "curso",
        }),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Erro ao carregar cursos.");

      setCursos(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const handleDelete = async (idCurso: number) => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          table: "curso",
          primaryKey: "idCurso",
          data: { idCurso },
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao deletar.");

      await fetchCursos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const handleEdit = (curso: Curso) => {
    setSelectedCurso(curso);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedCurso: Curso) => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          table: "curso",
          primaryKey: "idCurso",
          data: updatedCurso,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao atualizar.");

      await fetchCursos();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCurso(null);
  };

  return (
    <AdminGuard>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Lista de Cursos</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 border">ID</th>
              <th className="py-2 border">Nome do Curso</th>
              <th className="py-2 border">Carga Horária</th>
              <th className="py-2 border">Descrição</th>
              <th className="py-2 border">Docs Path</th>
              <th className="py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((curso) => (
              <tr key={curso.idCurso}>
                <td className="py-4 px-2 text-gray-900 bg-gray-200 text-center">{curso.idCurso}</td>
                <td className="py-4 px-2 text-gray-900 bg-gray-200">{curso.nomeCurso}</td>
                <td className="py-4 px-2 text-gray-900 bg-gray-200 text-center">{curso.cargaHorariaTotal}</td>
                <td className="py-4 px-2 text-gray-900 bg-gray-200">{curso.descricao || "-"}</td>
                <td className="py-4 px-2 text-gray-900 bg-gray-200">{curso.docsPath || "-"}</td>
                <td className="py-4 px-2 text-gray-900 bg-gray-200">
                  <ActionButton
                    onEdit={() => handleEdit(curso)}
                    onDelete={() => handleDelete(curso.idCurso)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && selectedCurso && (
          <EditModal<Curso>
            isOpen={isModalOpen}
            onClose={closeModal}
            data={selectedCurso}
            onSave={handleSave}
            fields={[
              "idCurso",
              "nomeCurso",
              "cargaHorariaTotal",
              "descricao",
              "docsPath",
            ]}
          />
        )}

        <button className="mt-4">
          <a href="/pages/admin/cursos/create">Adicionar Curso</a>
        </button>
      </div>
    </AdminGuard>
  );
}
