"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  isValidCPF,
  isValidRG,
  formatCPF,
  formatRG,
} from "@/utils/cpf-rg/route";
import { AdminGuard } from "@/app/components/AdminGuard";

interface FormDataAluno {
  nome: string;
  sobrenome: string;
  cpf: string;
  rg: string;
  nomeMae: string;
  nomePai: string;
  dataNasc: string;
  descricao: string;
  foto: File | null;
}

export default function CadastrarAluno() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataAluno>({
    nome: "",
    sobrenome: "",
    cpf: "",
    rg: "",
    nomeMae: "",
    nomePai: "",
    dataNasc: "",
    descricao: "",
    foto: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    let val = value;
    if (name === "cpf") val = formatCPF(value);
    if (name === "rg") val = formatRG(value);
    setFormData((prev) => ({ ...prev, [name]: val }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, foto: file }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validações de campos obrigatórios
    const faltando: string[] = [];
    if (!formData.nome) faltando.push("Nome");
    if (!formData.sobrenome) faltando.push("Sobrenome");
    if (!formData.cpf) faltando.push("CPF");
    if (!formData.rg) faltando.push("RG");
    if (!formData.nomeMae) faltando.push("Nome da Mãe");
    if (!formData.dataNasc) faltando.push("Data de Nascimento");

    if (faltando.length) {
      setError(`Você precisa preencher: ${faltando.join(", ")}`);
      setLoading(false);
      return;
    }

    if (!isValidCPF(formData.cpf)) {
      setError("CPF inválido");
      setLoading(false);
      return;
    }
    if (!isValidRG(formData.rg)) {
      setError("RG inválido");
      setLoading(false);
      return;
    }

    // Monta FormData para envio multipart/form-data
    const fd = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === "foto" && val instanceof File) {
        fd.append("foto", val);
      } else if (typeof val === "string") {
        fd.append(key, val);
      }
    });

    const res = await fetch("/api/alunos/insert", {
      method: "POST",
      body: fd,
    });

    const body = await res.json();
    if (!res.ok) {
      setError(body.error || "Erro desconhecido");
      setLoading(false);
      return;
    }

    // Limpa formulário e redireciona
    setFormData({
      nome: "",
      sobrenome: "",
      cpf: "",
      rg: "",
      nomeMae: "",
      nomePai: "",
      dataNasc: "",
      descricao: "",
      foto: null,
    });
    setLoading(false);
    router.push("/pages/admin/alunos-view");
  }

  return (
    <AdminGuard>
      <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
        <h1>Cadastrar Aluno</h1>
        {error && (
          <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
        )}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label>
            <span style={{ color: "red" }}>*</span> Nome
          </label>
          <input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome"
            required
          />

          <label>
            <span style={{ color: "red" }}>*</span> Sobrenome
          </label>
          <input
            name="sobrenome"
            value={formData.sobrenome}
            onChange={handleChange}
            placeholder="Sobrenome"
            required
          />

          <label>
            <span style={{ color: "red" }}>*</span> CPF
          </label>
          <input
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="123.456.789-09"
            required
          />

          <label>
            <span style={{ color: "red" }}>*</span> RG
          </label>
          <input
            name="rg"
            value={formData.rg}
            onChange={handleChange}
            placeholder="12.345.678-9"
            required
          />

          <label>
            <span style={{ color: "red" }}>*</span> Nome da Mãe
          </label>
          <input
            name="nomeMae"
            value={formData.nomeMae}
            onChange={handleChange}
            placeholder="Nome da Mãe"
            required
          />

          <label>Nome do Pai (opcional)</label>
          <input
            name="nomePai"
            value={formData.nomePai}
            onChange={handleChange}
            placeholder="Nome do Pai"
          />

          <label>
            <span style={{ color: "red" }}>*</span> Data de Nascimento
          </label>
          <input
            type="date"
            name="dataNasc"
            value={formData.dataNasc}
            onChange={handleChange}
            required
          />

          <label>Foto (opcional)</label>
          <input
            type="file"
            name="foto"
            accept="image/*"
            onChange={handleFileChange}
          />

          <label>Descrição (opcional)</label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
