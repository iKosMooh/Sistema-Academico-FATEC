"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";

export default function CreateAdminUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cpf: "",
    senha: "",
    confirmarSenha: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!formData.cpf || !formData.senha || !formData.confirmarSenha) {
      setMsg("Preencha todos os campos.");
      return;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setMsg("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      // Gera hash da senha antes de enviar
      const senhaHash = await bcrypt.hash(formData.senha, 10);

      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "insert",
          table: "usuarios",
          data: {
            cpf: formData.cpf,
            senhaHash,
            tipo: "Admin",
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMsg("Usuário admin criado com sucesso!");
        setTimeout(() => router.push("/admin/painel-aulas"), 1500);
      } else {
        setMsg(result.error || "Erro ao criar usuário.");
      }
    } catch {
      setMsg("Erro ao criar usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded shadow p-6">
      <h1 className="text-xl font-bold mb-4">Criar Usuário Admin</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">CPF</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Senha</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Confirmar Senha</label>
          <input
            type="password"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Criar Admin"}
        </button>
        {msg && <div className="mt-2 text-sm text-center text-blue-700">{msg}</div>}
      </form>
    </div>
  );
}
