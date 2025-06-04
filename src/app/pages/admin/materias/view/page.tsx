"use client";
import { useEffect, useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { EditModal } from "@/app/components/ui/EditModal";
import { AdminGuard } from "@/app/components/AdminGuard";

interface Materia {
  [key: string]: unknown;
  idMateria: number;
  nomeMateria: string;
}

export default function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);

  const fetchMaterias = async () => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "materias",
        }),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Erro ao carregar matérias.");

      setMaterias(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const handleDelete = async (idMateria: number) => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          table: "materias",
          primaryKey: "idMateria",
          data: { idMateria },
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao deletar.");

      await fetchMaterias();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const handleEdit = (materia: Materia) => {
    setSelectedMateria(materia);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedMateria: Materia) => {
    try {
      const dataToSend = {
        idMateria: updatedMateria.idMateria,
        nomeMateria: updatedMateria.nomeMateria,
      };

      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          table: "materias",
          primaryKey: "idMateria",
          data: dataToSend,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao atualizar.");

      await fetchMaterias();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMateria(null);
  };

  return (
    <AdminGuard>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Lista de Matérias</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 border">ID</th>
              <th className="py-2 border">Nome da Matéria</th>
              <th className="py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((materia) => (
              <tr key={materia.idMateria}>
                <td className="py-2 border text-center">{materia.idMateria}</td>
                <td className="py-2 border">{materia.nomeMateria}</td>
                <td className="py-2 border">
                  <ActionButton
                    onEdit={() => handleEdit(materia)}
                    onDelete={() => handleDelete(materia.idMateria)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && selectedMateria && (
          <EditModal<Materia>
            isOpen={isModalOpen}
            onClose={closeModal}
            data={selectedMateria}
            onSave={handleSave}
            fields={[
              "idMateria",
              "nomeMateria",
            ]}
          />
        )}

        <button className="mt-4">
          <a href="/pages/admin/materias/create">Adicionar Matéria</a>
        </button>
      </div>
    </AdminGuard>
  );
}
