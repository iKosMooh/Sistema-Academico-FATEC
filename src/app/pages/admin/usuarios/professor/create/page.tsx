// src/app/pages/admin/cadastrar-professor/page.tsx
"use client";

import { useState } from "react";
import {
  isValidCPF,
  isValidRG,
  formatCPF,
  formatRG,
} from "@/utils/cpf-rg";
import { AdminGuard } from "@/app/components/AdminGuard";
import { useRouter } from "next/navigation";

interface FormDataProfessor {
  idProfessor: string;
  nome: string;
  sobrenome: string;
  rg: string;
  dataNasc: string;
  cargo: string;
  descricao: string;
  tel: string;
  foto: File | null;
}

export default function CadastrarProfessorPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormDataProfessor>({
    idProfessor: "",
    nome: "",
    sobrenome: "",
    rg: "",
    dataNasc: "",
    cargo: "",
    descricao: "",
    tel: "",
    foto: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, foto: e.target.files![0] }));
    }
  };

  const handleCpfBlur = () => {
    if (formData.idProfessor && !isValidCPF(formData.idProfessor)) {
      setError("CPF inválido");
    } else {
      setError("");
      setFormData((prev) => ({
        ...prev,
        idProfessor: formatCPF(prev.idProfessor),
      }));
    }
  };

  const handleRgBlur = () => {
    if (formData.rg && !isValidRG(formData.rg)) {
      setError("RG inválido");
    } else {
      setError("");
      setFormData((prev) => ({
        ...prev,
        rg: formatRG(prev.rg),
      }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const faltando: string[] = [];
    if (!formData.idProfessor) faltando.push("CPF");
    if (!formData.nome) faltando.push("Nome");
    if (!formData.sobrenome) faltando.push("Sobrenome");
    if (!formData.rg) faltando.push("RG");
    if (!formData.dataNasc) faltando.push("Data de Nascimento");
    if (!formData.cargo) faltando.push("Cargo");

    if (faltando.length) {
      setError(`Você precisa preencher: ${faltando.join(", ")}`);
      setLoading(false);
      return;
    }

    if (!isValidCPF(formData.idProfessor)) {
      setError("CPF inválido");
      setLoading(false);
      return;
    }
    if (!isValidRG(formData.rg)) {
      setError("RG inválido");
      setLoading(false);
      return;
    }

    // Verifica se já existe usuário com o CPF informado
    let usuarioExiste = false;
    try {
      const resUsuario = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "usuarios",
          data: { cpf: formData.idProfessor },
        }),
      });
      const resultUsuario = await resUsuario.json();
      usuarioExiste = Array.isArray(resultUsuario.data) && resultUsuario.data.length > 0;
    } catch {
      // Se der erro, ignora e tenta criar normalmente
    }

    // Verifica se já existe professor com o CPF informado
    let professorExiste = false;
    try {
      const resProf = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "professores",
          data: { idProfessor: formData.idProfessor },
        }),
      });
      const resultProf = await resProf.json();
      professorExiste = Array.isArray(resultProf.data) && resultProf.data.length > 0;
    } catch {
      // Se der erro, ignora e tenta criar normalmente
    }

    // Se já existe usuário e professor, erro
    if (usuarioExiste && professorExiste) {
      setError("Já existe um professor cadastrado com este CPF.");
      setLoading(false);
      return;
    }

    // Se já existe usuário mas não professor, cria apenas na tabela professores
    // Se não existe usuário, backend pode criar em ambas se necessário
    // Monta FormData para envio
    const fd = new FormData();
    fd.append("idProfessor", formData.idProfessor);
    fd.append("nome", formData.nome);
    fd.append("sobrenome", formData.sobrenome);
    fd.append("rg", formData.rg);
    fd.append("dataNasc", formData.dataNasc);
    fd.append("cargo", formData.cargo);
    fd.append("descricao", formData.descricao);
    fd.append("tel", formData.tel);
    if (formData.foto) {
      fd.append("foto", formData.foto);
    }

    try {
      // Se já existe usuário, cria apenas na tabela professores
      // Se não existe usuário, backend pode criar em ambas se necessário
      const res = await fetch("/api/professores/insert", {
        method: "POST",
        body: fd,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("Professor cadastrado com sucesso!");
        setFormData({
          idProfessor: "",
          nome: "",
          sobrenome: "",
          rg: "",
          dataNasc: "",
          cargo: "",
          descricao: "",
          tel: "",
          foto: null,
        });
        router.push("/pages/admin/usuarios/dashboard");
      } else {
        setMessage(result.error || "Erro ao cadastrar professor.");
      }
    } catch {
      setMessage("Erro de rede ou servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminGuard>
      <div className="max-w-xl mx-auto bg-white rounded shadow p-4 mt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Cadastrar Professor</h1>
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="bg-gray-100 p-6 rounded-xl shadow space-y-0 text-base"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-blue-700 mb-1 text-base">
                <span className="text-red-600">*</span> CPF
              </label>
              <input
                type="text"
                name="idProfessor"
                value={formData.idProfessor}
                onChange={handleChange}
                onBlur={handleCpfBlur}
                required
                placeholder="CPF"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              />
            </div>
            <div>
              <label className="block font-semibold text-blue-700 mb-1 text-base">
                <span className="text-red-600">*</span> Nome
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Nome"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              />
            </div>
            <div>
              <label className="block font-semibold text-blue-700 mb-1 text-base">
                <span className="text-red-600">*</span> Sobrenome
              </label>
              <input
                type="text"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                required
                placeholder="Sobrenome"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              />
            </div>
            <div>
              <label className="block font-semibold text-blue-700 mb-1 text-base">
                <span className="text-red-600">*</span> RG
              </label>
              <input
                type="text"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                onBlur={handleRgBlur}
                required
                placeholder="RG"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              />
            </div>
            <div>
              <label className="block font-semibold text-blue-700 mb-1 text-base">
                <span className="text-red-600">*</span> Data de Nascimento
              </label>
              <input
                type="date"
                name="dataNasc"
                value={formData.dataNasc}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              />
            </div>
            <div>
              <label className="block font-semibold text-blue-700 mb-1 text-base">
                <span className="text-red-600">*</span> Cargo
              </label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
                placeholder="Cargo"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-blue-700 mb-1 text-base">Descrição</label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descrição"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
                rows={2}
              />
            </div>
            <div>
              <label className="block font-semibold text-blue-700 mb-1 text-base">Telefone</label>
              <input
                type="text"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                placeholder="Telefone"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              />
            </div>
            <div>
              <label className="block font-semibold text-blue-700 mb-1 text-base">Foto</label>
              <input
                type="file"
                name="foto"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              />
            </div>
          </div>
          {error && (
            <div className="text-red-600 my-2 text-base">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 font-semibold shadow text-lg"
          >
            {loading ? "Cadastrando..." : "Salvar"}
          </button>
          {message && (
            <p
              className={`mt-2 text-base ${message.includes("sucesso") ? "text-green-700" : "text-red-700"}`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </AdminGuard>
  );
}
