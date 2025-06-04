"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMateriaPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nomeMateria: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          table: "materias",
          data: {
            nomeMateria: formData.nomeMateria,
          },
        }),
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.error || "Erro ao criar matéria");

      setSuccess(true);
      router.push("/pages/admin/materias/view");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao criar matéria.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Criar Nova Matéria</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nome da Matéria</label>
          <input
            type="text"
            name="nomeMateria"
            value={formData.nomeMateria}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
            placeholder="Ex: Matemática"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Criar Matéria"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Matéria criada com sucesso!</p>}
      </form>
    </div>
  );
}
