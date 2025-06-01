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
  // Novos campos de contato:
  nomeTel1: string;
  tel1: string;
  nomeTel2: string;
  tel2: string;
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
    nomeTel1: "",
    tel1: "",
    nomeTel2: "",
    tel2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    let val = value;

    // Formatação de CPF/RG
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

    // 1. Validações de campos obrigatórios do Aluno
    const faltando: string[] = [];
    if (!formData.nome) faltando.push("Nome");
    if (!formData.sobrenome) faltando.push("Sobrenome");
    if (!formData.cpf) faltando.push("CPF");
    if (!formData.rg) faltando.push("RG");
    if (!formData.nomeMae) faltando.push("Nome da Mãe");
    if (!formData.dataNasc) faltando.push("Data de Nascimento");
    // 2. Validações de campos obrigatórios do ContatoAluno
    if (!formData.nomeTel1) faltando.push("Nome do Telefone 1");
    if (!formData.tel1) faltando.push("Telefone 1");

    if (faltando.length) {
      setError(`Você precisa preencher: ${faltando.join(", ")}`);
      setLoading(false);
      return;
    }

    // 3. Validação de CPF/RG
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

    // 4. Monta FormData para envio multipart/form-data
    const fd = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === "foto" && val instanceof File) {
        fd.append("foto", val);
      } else if (typeof val === "string") {
        fd.append(key, val);
      }
    });

    try {
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

      // Se der tudo certo, limpa formulário e redireciona
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
        nomeTel1: "",
        tel1: "",
        nomeTel2: "",
        tel2: "",
      });
      router.push("/pages/admin/alunos-view");
    } catch (err) {
      setError("Erro de rede ou do servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminGuard>
      <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
        <h1>Cadastrar Aluno</h1>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Campos básicos de Aluno */}
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

          <label>Descrição (opcional)</label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição"
          />

          <label>Foto (opcional)</label>
          <input
            type="file"
            name="foto"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* Novos campos de ContatoAluno */}
          <hr style={{ margin: "20px 0" }} />

          <h2>Informações de Contato</h2>
          <label>
            <span style={{ color: "red" }}>*</span> Nome do Telefone 1
          </label>
          <input
            name="nomeTel1"
            value={formData.nomeTel1}
            onChange={handleChange}
            placeholder="Ex.: Celular"
            required
          />

          <label>
            <span style={{ color: "red" }}>*</span> Telefone 1
          </label>
          <input
            name="tel1"
            value={formData.tel1}
            onChange={handleChange}
            placeholder="(00) 91234-5678"
            required
          />

          <label>Nome do Telefone 2 (opcional)</label>
          <input
            name="nomeTel2"
            value={formData.nomeTel2}
            onChange={handleChange}
            placeholder="Ex.: WhatsApp"
          />

          <label>Telefone 2 (opcional)</label>
          <input
            name="tel2"
            value={formData.tel2}
            onChange={handleChange}
            placeholder="(00) 98765-4321"
          />
          {error && (
            <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>

      </div>
    </AdminGuard>
  );
}
