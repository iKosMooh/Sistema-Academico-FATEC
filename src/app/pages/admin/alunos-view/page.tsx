"use client";

import { useEffect, useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { EditModal } from "@/app/components/ui/EditModal";
import { AdminGuard } from "@/app/components/AdminGuard";

interface AlunoFlat {
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
  // Campos de contato “flattened”:
  nomeTel1: string;
  tel1: string;
  nomeTel2: string | null;
  tel2: string | null;
}

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<AlunoFlat[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<AlunoFlat | null>(null);

  // 1. Busca alunos do backend (GET) e “flatten” dos campos de contato
  const fetchAlunos = async () => {
    try {
      const response = await fetch("/api/alunos/get-delete");
      if (!response.ok) throw new Error("Erro ao carregar alunos.");
      // O backend deve retornar um array de objetos com include: { contato: true }
      const data: Array<{
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
        contato: {
          nomeTel1: string;
          tel1: string;
          nomeTel2: string | null;
          tel2: string | null;
        } | null;
      }> = await response.json();

      // Converte cada objeto para a forma “flattened” (contato no mesmo nível)
      const flat: AlunoFlat[] = data.map((a) => ({
        idAluno: a.idAluno,
        nome: a.nome,
        sobrenome: a.sobrenome,
        cpf: a.cpf,
        rg: a.rg,
        nomeMae: a.nomeMae,
        nomePai: a.nomePai,
        dataNasc: a.dataNasc,
        descricao: a.descricao,
        fotoPath: a.fotoPath,
        nomeTel1: a.contato ? a.contato.nomeTel1 : "",
        tel1: a.contato ? a.contato.tel1 : "",
        nomeTel2: a.contato ? a.contato.nomeTel2 : null,
        tel2: a.contato ? a.contato.tel2 : null,
      }));

      setAlunos(flat);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  // 2. Exclui aluno (DELETE)
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

  // 3. Abre modal de edição, preenchendo campos “flattened”
  const handleEdit = (aluno: AlunoFlat) => {
    setSelectedAluno(aluno);
    setIsModalOpen(true);
  };

  // 4. Salva alterações (PUT) — atualiza tanto Aluno quanto ContatoAluno
  const handleSave = async (updatedAluno: AlunoFlat) => {
    try {
      // Prepara payload com todos os campos, incluindo telefone
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

        <table className="min-w-full bg-white border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 border text-center">ID</th>
              <th className="py-2 px-3 border">Nome</th>
              <th className="py-2 px-3 border">Sobrenome</th>
              <th className="py-2 px-3 border">CPF</th>
              <th className="py-2 px-3 border">RG</th>
              <th className="py-2 px-3 border">Mãe</th>
              <th className="py-2 px-3 border">Pai</th>
              <th className="py-2 px-3 border">Nascimento</th>
              <th className="py-2 px-3 border">Descrição</th>
              <th className="py-2 px-3 border">Foto</th>
              <th className="py-2 px-3 border">Tel. 1</th>
              <th className="py-2 px-3 border">Tel. 2</th>
              <th className="py-2 px-3 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr
                key={aluno.idAluno}
                className="hover:bg-gray-50"
              >
                <td className="py-2 px-3 border text-center">
                  {aluno.idAluno}
                </td>
                <td className="py-2 px-3 border">{aluno.nome}</td>
                <td className="py-2 px-3 border">{aluno.sobrenome}</td>
                <td className="py-2 px-3 border">{aluno.cpf}</td>
                <td className="py-2 px-3 border">{aluno.rg}</td>
                <td className="py-2 px-3 border">{aluno.nomeMae}</td>
                <td className="py-2 px-3 border">
                  {aluno.nomePai || "—"}
                </td>
                <td className="py-2 px-3 border">
                  {new Date(aluno.dataNasc).toLocaleDateString("pt-BR")}
                </td>
                <td className="py-2 px-3 border">
                  {aluno.descricao ? (
                    <span className="whitespace-pre-wrap">
                      {aluno.descricao}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2 px-3 border text-center">
                  {aluno.fotoPath ? (
                    <img
                      src={aluno.fotoPath}
                      alt={`Foto do(a) ${aluno.nome}`}
                      className="h-12 w-12 object-cover rounded-full mx-auto"
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-2 px-3 border">
                  {aluno.tel1}
                </td>
                <td className="py-2 px-3 border">
                  {aluno.tel2 || "—"}
                </td>
                <td className="py-2 px-3 border text-center">
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
            // Adicionamos agora os campos de contato na edição:
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

        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          <a href="/pages/admin/cadastrar-aluno">Adicionar Aluno</a>
        </button>
      </div>
    </AdminGuard>
  );
}
