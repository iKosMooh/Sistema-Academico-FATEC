// src/app/pages/admin/cadastrar-aluno/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  isValidCPF,
  isValidRG
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const faltando: string[] = [];
    if (!formData.nome) faltando.push("Nome");
    if (!formData.sobrenome) faltando.push("Sobrenome");
    if (!formData.cpf) faltando.push("CPF");
    if (!formData.rg) faltando.push("RG");
    if (!formData.nomeMae) faltando.push("Nome da Mãe");
    if (!formData.dataNasc) faltando.push("Data de Nascimento");
    if (!formData.nomeTel1) faltando.push("Nome do Telefone 1");
    if (!formData.tel1) faltando.push("Telefone 1");

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
      router.push("/admin/alunos-view");
    } catch {
      setError("Erro de rede ou do servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminGuard>
      <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
        <h1>Cadastrar Aluno</h1>
        {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* ...demais campos continuam iguais */}
          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
