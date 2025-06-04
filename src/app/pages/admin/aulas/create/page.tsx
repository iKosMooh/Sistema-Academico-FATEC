"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Turma {
  idTurma: number;
  nomeTurma: string;
}

interface Materia {
  idMateria: number;
  nomeMateria: string;
}

export default function CreateAulaPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    idTurma: "",
    idMateria: "",
    dataAula: "",
    descricao: "",
    observacoes: "",
  });

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      } catch {
        setError("Erro ao carregar turmas");
      }
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
      } catch {
        setError("Erro ao carregar matérias");
      }
    }
    fetchTurmas();
    fetchMaterias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "insert",
          table: "aula",
          data: {
            idTurma: parseInt(formData.idTurma, 10),
            idMateria: parseInt(formData.idMateria, 10),
            dataAula: new Date(formData.dataAula),
            descricao: formData.descricao || null,
            observacoes: formData.observacoes || null,
          },
        }),
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.error || "Erro ao criar aula");

      setSuccess(true);
      router.push("/pages/admin/aulas/view");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao criar aula.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Criar Nova Aula</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Turma</label>
          <select
            name="idTurma"
            value={formData.idTurma}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
          >
            <option value="">Selecione a turma</option>
            {turmas.map((turma) => (
              <option key={turma.idTurma} value={turma.idTurma}>
                {turma.nomeTurma}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Matéria</label>
          <select
            name="idMateria"
            value={formData.idMateria}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
          >
            <option value="">Selecione a matéria</option>
            {materias.map((materia) => (
              <option key={materia.idMateria} value={materia.idMateria}>
                {materia.nomeMateria}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Data da Aula</label>
          <input
            type="datetime-local"
            name="dataAula"
            value={formData.dataAula}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Descrição</label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Observações</label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Criar Aula"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Aula criada com sucesso!</p>}
      </form>
    </div>
  );
}
