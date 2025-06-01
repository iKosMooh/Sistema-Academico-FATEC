"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { EditModal } from "@/app/components/ui/EditModal";
import { AdminGuard } from "@/app/components/AdminGuard";

interface Aluno {
  idAluno: number;
  nome: string;
  sobrenome: string;
  cpf: string;
  rg: string;
  nomeMae: string;
  nomePai: string | null;
  dataNasc: string;
  descricao: string | null;
  fotoPath: string | null;
}

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  const fetchAlunos = async () => {
    try {
      const response = await fetch("/api/alunos/get-delete");
      if (!response.ok) throw new Error("Erro ao carregar alunos.");
      const data: Aluno[] = await response.json();
      setAlunos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleDelete = async (idAluno: number) => {
    try {
      const response = await fetch("/api/alunos/get-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idAluno }),
      });
      if (!response.ok) throw new Error("Erro ao deletar.");
      await fetchAlunos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedAluno: any) => {
    try {
      const payload = {
        idAluno: updatedAluno.idAluno,
        nome: updatedAluno.nome,
        sobrenome: updatedAluno.sobrenome,
        nomeMae: updatedAluno.nomeMae,
        nomePai: updatedAluno.nomePai,
        dataNasc: updatedAluno.dataNasc,
        descricao: updatedAluno.descricao,
      };
      const response = await fetch("/api/alunos/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Erro ao atualizar.");
      await fetchAlunos();
      setError(null);
      setIsModalOpen(false);
      setSelectedAluno(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
  };

  return (
    <AdminGuard>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Lista de Alunos</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 border">ID</th>
              <th className="py-2 border">Nome</th>
              <th className="py-2 border">Sobrenome</th>
              <th className="py-2 border">CPF</th>
              <th className="py-2 border">RG</th>
              <th className="py-2 border">Mãe</th>
              <th className="py-2 border">Nascimento</th>
              <th className="py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.idAluno}>
                <td className="py-2 border text-center">
                  {aluno.idAluno}
                </td>
                <td className="py-2 border">{aluno.nome}</td>
                <td className="py-2 border">{aluno.sobrenome}</td>
                <td className="py-2 border">{aluno.cpf}</td>
                <td className="py-2 border">{aluno.rg}</td>
                <td className="py-2 border">{aluno.nomeMae}</td>
                <td className="py-2 border">
                  {new Date(aluno.dataNasc).toLocaleDateString("pt-BR")}
                </td>
                <td className="py-2 border">
                  <ActionButton
                    onEdit={() => handleEdit(aluno)}
                    onDelete={() => handleDelete(aluno.idAluno)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && selectedAluno && (
          <EditModal
            isOpen={isModalOpen}
            onClose={closeModal}
            data={selectedAluno}
            onSave={handleSave}
            fields={[
              "idAluno",
              "nome",
              "sobrenome",
              "nomeMae",
              "nomePai",
              "dataNasc",
              "descricao",
            ]}
          />
        )}

        <button className="mt-4">
          <a href="/admin/cadastrar-aluno">Adicionar Aluno</a>
        </button>
      </div>
    </AdminGuard>
  );
}
