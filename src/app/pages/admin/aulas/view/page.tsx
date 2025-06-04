"use client";
import { useEffect, useState } from "react";
import { ActionButton } from "@/app/components/ui/ActionButton";
import { EditModal } from "@/app/components/ui/EditModal";
import { AdminGuard } from "@/app/components/AdminGuard";

interface Aula {
  [key: string]: unknown;
  idAula: number;
  idTurma: number;
  idMateria: number;
  dataAula: string;
  descricao: string | null;
  observacoes: string | null;
  turma?: { nomeTurma: string };
  materia?: { nomeMateria: string };
}

interface Turma {
  idTurma: number;
  nomeTurma: string;
}

interface Materia {
  idMateria: number;
  nomeMateria: string;
}

export default function AulasPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);

  // Busca turmas e matérias para o select do modal
  useEffect(() => {
    async function fetchTurmas() {
      try {
        const res = await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "get",
            table: "turmas",
          }),
        });
        const result = await res.json();
        if (result.success) setTurmas(result.data);
      } catch {}
    }
    async function fetchMaterias() {
      try {
        const res = await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "get",
            table: "materias",
          }),
        });
        const result = await res.json();
        if (result.success) setMaterias(result.data);
      } catch {}
    }
    fetchTurmas();
    fetchMaterias();
  }, []);

  const fetchAulas = async () => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "aula",
          relations: { turma: true, materia: true },
        }),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Erro ao carregar aulas.");

      setAulas(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  useEffect(() => {
    fetchAulas();
  }, []);

  const handleDelete = async (idAula: number) => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          table: "aula",
          primaryKey: "idAula",
          data: { idAula },
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao deletar.");

      await fetchAulas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const handleEdit = (aula: Aula) => {
    setSelectedAula(aula);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedAula: Aula) => {
    try {
      const dataToSend = {
        idAula: updatedAula.idAula,
        idTurma: updatedAula.idTurma,
        idMateria: updatedAula.idMateria,
        dataAula: updatedAula.dataAula,
        descricao: updatedAula.descricao,
        observacoes: updatedAula.observacoes,
      };

      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          table: "aula",
          primaryKey: "idAula",
          data: dataToSend,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao atualizar.");

      await fetchAulas();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAula(null);
  };

  return (
    <AdminGuard>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Lista de Aulas</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 border">ID</th>
              <th className="py-2 border">Turma</th>
              <th className="py-2 border">Matéria</th>
              <th className="py-2 border">Data</th>
              <th className="py-2 border">Descrição</th>
              <th className="py-2 border">Observações</th>
              <th className="py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {aulas.map((aula) => (
              <tr key={aula.idAula}>
                <td className="py-2 border text-center">{aula.idAula}</td>
                <td className="py-2 border">{aula.turma?.nomeTurma || aula.idTurma}</td>
                <td className="py-2 border">{aula.materia?.nomeMateria || aula.idMateria}</td>
                <td className="py-2 border text-center">
                  {aula.dataAula ? new Date(aula.dataAula).toLocaleString("pt-BR") : "-"}
                </td>
                <td className="py-2 border">{aula.descricao || "-"}</td>
                <td className="py-2 border">{aula.observacoes || "-"}</td>
                <td className="py-2 border">
                  <ActionButton
                    onEdit={() => handleEdit(aula)}
                    onDelete={() => handleDelete(aula.idAula)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isModalOpen && selectedAula && (
          <EditModal<Aula>
            isOpen={isModalOpen}
            onClose={closeModal}
            data={selectedAula}
            onSave={handleSave}
            fields={[
              "idAula",
              "idTurma",
              "idMateria",
              "dataAula",
              "descricao",
              "observacoes",
            ]}
            renderField={(field, value, onChange) => {
              if (field === "idTurma") {
                return (
                  <div key={field}>
                    <label className="block mb-1">Turma</label>
                    <select
                      name="idTurma"
                      value={value}
                      onChange={onChange}
                      className="border px-2 py-1 w-full"
                      required
                    >
                      <option value="">Selecione a turma</option>
                      {turmas.map((turma) => (
                        <option key={turma.idTurma} value={turma.idTurma}>
                          {turma.nomeTurma}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              if (field === "idMateria") {
                return (
                  <div key={field}>
                    <label className="block mb-1">Matéria</label>
                    <select
                      name="idMateria"
                      value={value}
                      onChange={onChange}
                      className="border px-2 py-1 w-full"
                      required
                    >
                      <option value="">Selecione a matéria</option>
                      {materias.map((materia) => (
                        <option key={materia.idMateria} value={materia.idMateria}>
                          {materia.nomeMateria}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              if (field === "dataAula") {
                return (
                  <div key={field}>
                    <label className="block mb-1">Data da Aula</label>
                    <input
                      type="datetime-local"
                      name="dataAula"
                      value={value ? value.slice(0, 16) : ""}
                      onChange={onChange}
                      className="border px-2 py-1 w-full"
                      required
                    />
                  </div>
                );
              }
              return undefined;
            }}
          />
        )}

        <button className="mt-4">
          <a href="/pages/admin/aulas/create">Adicionar Aula</a>
        </button>
      </div>
    </AdminGuard>
  );
}
