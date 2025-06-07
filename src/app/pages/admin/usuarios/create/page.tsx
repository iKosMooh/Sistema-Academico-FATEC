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
    <div className="max-w-xl mx-auto bg-white rounded shadow p-4 mt-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Criar Usuário Admin</h1>
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-xl shadow space-y-0 text-base">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block font-semibold text-blue-700 mb-1 text-base">
              <span className="text-red-600">*</span> CPF
            </label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              onBlur={handleCpfBlur}
              required
              placeholder="CPF"
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold text-blue-700 mb-1 text-base">
              <span className="text-red-600">*</span> Senha
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              placeholder="Senha"
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold text-blue-700 mb-1 text-base">
              Tipo de Usuário
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              disabled
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
            >
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
        {error && <div className="text-red-600 my-2 text-base">{error}</div>}
        {success && <div className="text-green-600 my-2 text-base">Usuário criado com sucesso!</div>}
        <button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 font-semibold shadow text-lg"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
