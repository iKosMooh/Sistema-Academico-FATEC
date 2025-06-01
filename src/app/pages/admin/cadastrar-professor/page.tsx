// src/app/(caminho)/CadastrarProfessor.tsx

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  isValidCPF,
  isValidRG,
  formatCPF,
  formatRG,
} from "@/utils/cpf-rg/route";
import { AdminGuard } from "@/app/components/AdminGuard";

export default function CadastrarProfessor() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    idProfessor: "",
    nome: "",
    sobrenome: "",
    rg: "",
    dataNasc: "",
    cargo: "",
    descricao: "",
    tel: "",
    foto: null as File | null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    let val = value;
    if (name === "idProfessor") val = formatCPF(value);
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

    const missing = [];
    if (!formData.idProfessor) missing.push("CPF");
    if (!formData.nome) missing.push("Nome");
    if (!formData.sobrenome) missing.push("Sobrenome");
    if (!formData.rg) missing.push("RG");
    if (!formData.dataNasc) missing.push("Data de Nascimento");
    if (!formData.cargo) missing.push("Cargo");
    if (missing.length) {
      setError(`Você precisa preencher: ${missing.join(", ")}`);
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

    const fd = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === "foto" && val instanceof File) {
        fd.append("foto", val);
      } else if (typeof val === "string") {
        fd.append(key, val);
      }
    });

    const res = await fetch("/api/professores/insert", {
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
    setLoading(false);
    router.push("/admin/dashboard");
  }

  return (
    <AdminGuard>
      <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
        <h1>Cadastrar Professor</h1>
        {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            <span style={{ color: "red" }}>*</span> CPF
          </label>
          <input
            name="idProfessor"
            value={formData.idProfessor}
            onChange={handleChange}
            placeholder="123.456.789-09"
            required
          />

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
            <span style={{ color: "red" }}>*</span> Data de Nascimento
          </label>
          <input
            type="date"
            name="dataNasc"
            value={formData.dataNasc}
            onChange={handleChange}
            required
          />

          <label>
            <span style={{ color: "red" }}>*</span> Cargo
          </label>
          <input
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            placeholder="Prof./Coord./Diretor"
            required
          />

          <label>Foto (opcional)</label>
          <input
            type="file"
            name="foto"
            accept="image/*"
            onChange={handleFileChange}
          />

          <label>Descrição</label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição"
          />

          <label>Telefone</label>
          <input
            name="tel"
            value={formData.tel}
            onChange={handleChange}
            placeholder="Telefone"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
