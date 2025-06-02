// src/app/pages/admin/alunos-view/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { EditModal } from "@/app/components/ui/EditModal";
import { AdminGuard } from "@/app/components/AdminGuard";

interface Contato {
  nomeTel1: string;
  tel1: string;
  nomeTel2: string | null;
  tel2: string | null;
}

interface Aluno {
  [key: string]: unknown;
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
  contato: Contato | null;
  // Campos “desmembrados” para uso no componente
  nomeTel1: string;
  tel1: string;
  nomeTel2: string | null;
  tel2: string | null;
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
      const rawData = await response.json();

      // Mapeia para incluir os campos de contato no nível superior
      const normalized: Aluno[] = (rawData as Aluno[]).map((a: Aluno) => ({
        ...a,
        nomeTel1: (a.contato && typeof a.contato === "object" && "nomeTel1" in a.contato) ? (a.contato as Contato).nomeTel1 : "",
        tel1: (a.contato && typeof a.contato === "object" && "tel1" in a.contato) ? (a.contato as Contato).tel1 : "",
        nomeTel2: (a.contato && typeof a.contato === "object" && "nomeTel2" in a.contato) ? (a.contato as Contato).nomeTel2 : null,
        tel2: (a.contato && typeof a.contato === "object" && "tel2" in a.contato) ? (a.contato as Contato).tel2 : null,
      }));
      setAlunos(normalized);
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

  const handleSave = async (updatedAluno: Aluno) => {
    try {
      const payload = {
        idAluno: updatedAluno.idAluno,
        nome: updatedAluno.nome,
        sobrenome: updatedAluno.sobrenome,
        cpf: updatedAluno.cpf,
        rg: updatedAluno.rg,
        nomeMae: updatedAluno.nomeMae,
        nomePai: updatedAluno.nomePai,
        dataNasc: updatedAluno.dataNasc,
        descricao: updatedAluno.descricao,
        nomeTel1: updatedAluno.nomeTel1,
        tel1: updatedAluno.tel1,
        nomeTel2: updatedAluno.nomeTel2,
        tel2: updatedAluno.tel2,
      };
      const response = await fetch("/api/alunos/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Erro ao atualizar.");
      await fetchAlunos();
      setError(null);
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
              <th className="py-2 border">NomeTel1</th>
              <th className="py-2 border">Tel1</th>
              <th className="py-2 border">NomeTel2</th>
              <th className="py-2 border">Tel2</th>
              <th className="py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.idAluno}>
                <td className="py-2 border text-center">{aluno.idAluno}</td>
                <td className="py-2 border">{aluno.nome}</td>
                <td className="py-2 border">{aluno.sobrenome}</td>
                <td className="py-2 border">{aluno.cpf}</td>
                <td className="py-2 border">{aluno.rg}</td>
                <td className="py-2 border">{aluno.nomeMae}</td>
                <td className="py-2 border">
                  {new Date(aluno.dataNasc).toLocaleDateString("pt-BR")}
                </td>
                <td className="py-2 border">{aluno.nomeTel1}</td>
                <td className="py-2 border">{aluno.tel1}</td>
                <td className="py-2 border">{aluno.nomeTel2 || "-"}</td>
                <td className="py-2 border">{aluno.tel2 || "-"}</td>
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
          <EditModal<Aluno>
            isOpen={isModalOpen}
            onClose={closeModal}
            data={selectedAluno}
            onSave={handleSave}
            fields={[
              "idAluno",
              "nome",
              "sobrenome",
              "cpf",
              "rg",
              "nomeMae",
              "nomePai",
              "dataNasc",
              "descricao",
              "nomeTel1",
              "tel1",
              "nomeTel2",
              "tel2",
            ]}
          />
        )}

        <button className="mt-4">
          <a href="/pages/admin/cadastrar-aluno">Adicionar Aluno</a>
        </button>
      </div>
    </AdminGuard>
  );
}
