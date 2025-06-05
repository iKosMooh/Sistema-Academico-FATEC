"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidCPF, formatCPF } from "@/utils/cpf-rg";

export default function CreateUsuarioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cpf: "",
    senha: "",
    tipo: "Admin", // Apenas Admin permitido
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCpfBlur = () => {
    if (formData.cpf && !isValidCPF(formData.cpf)) {
      setError("CPF inválido");
    } else {
      setError("");
      setFormData((prev) => ({
        ...prev,
        cpf: formatCPF(prev.cpf),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!isValidCPF(formData.cpf)) {
      setError("CPF inválido");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "insert",
          table: "usuarios",
          data: {
            cpf: formData.cpf,
            senha: formData.senha, // Envia senha sem hash
            tipo: formData.tipo,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Erro ao criar o usuário.");

      setSuccess(true);
      router.push("/pages/admin/usuarios/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao criar o usuário.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Criar Usuário Admin</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">CPF</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            onBlur={handleCpfBlur}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Senha</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Tipo de Usuário</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            disabled
          >
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">Usuário criado com sucesso!</p>}
      </form>
    </div>
  );
}
