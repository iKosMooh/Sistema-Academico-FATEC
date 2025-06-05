// src\app\pages\admin\professores-view\page.tsx
"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { EditModal } from "@/app/components/ui/EditModal";
import { AdminGuard } from "@/app/components/AdminGuard";

interface Professor {
  [key: string]: unknown;
  idProfessor: number;
  nome: string;
  sobrenome: string;
  cargo: string;
  disciplina: string;
  email: string;
  telefone: string;
}

export default function ProfessoresPage() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);

  const fetchProfessores = async () => {
    try {
      const response = await fetch("/api/professores/get-delete");
      if (!response.ok) throw new Error("Erro ao carregar professores.");
      const data: Professor[] = await response.json();
      setProfessores(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  const handleDelete = async (idProfessor: number) => {
    try {
      const response = await fetch("/api/professores/get-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idProfessor }),
      });
      if (!response.ok) throw new Error("Erro ao deletar.");
      await fetchProfessores();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const handleEdit = (professor: Professor) => {
    setSelectedProfessor(professor);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedProfessor: Professor) => {
    try {
      const response = await fetch("/api/professores/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfessor),
      });
      if (!response.ok) throw new Error("Erro ao atualizar.");
      await fetchProfessores();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProfessor(null);
  };

  return (
    <AdminGuard>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Lista de Professores</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 border">CPF</th>
              <th className="py-2 border">Nome</th>
              <th className="py-2 border">Sobrenome</th>
              <th className="py-2 border">Cargo</th>
              <th className="py-2 border">Disciplina</th>
              <th className="py-2 border">Email</th>
              <th className="py-2 border">Telefone</th>
              <th className="py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {professores.map((prof) => (
              <tr key={prof.idProfessor}>
                <td className="py-2 border text-center">
                  {prof.idProfessor}
                </td>
                <td className="py-2 border">{prof.nome}</td>
                <td className="py-2 border">{prof.sobrenome}</td>
                <td className="py-2 border">{prof.cargo}</td>
                <td className="py-2 border">{prof.disciplina}</td>
                <td className="py-2 border">{prof.email}</td>
                <td className="py-2 border">{prof.telefone}</td>
                <td className="py-2 border">
                  <ActionButton
                    onEdit={() => handleEdit(prof)}
                    onDelete={() => handleDelete(prof.idProfessor)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <EditModal<Professor>
          isOpen={isModalOpen}
          onClose={closeModal}
          data={selectedProfessor}
          onSave={handleSave}
          fields={[
            "idProfessor",
            "nome",
            "sobrenome",
            "rg",
            "dataNasc",
            "cargo",
            "descricao",
            "tel",
            "foto",
          ]}
        />

        <button><a href="/pages/admin/cadastrar-professor">Adicionar Professor</a></button>
      </div>
    </AdminGuard>
  );
}
