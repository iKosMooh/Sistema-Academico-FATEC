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
        router.push("/pages/admin/professores-view");
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
      <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
        <h1>Cadastrar Professor</h1>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label>
              <span style={{ color: "red" }}>*</span> CPF
            </label>
            <input
              type="text"
              name="idProfessor"
              value={formData.idProfessor}
              onChange={handleChange}
              onBlur={handleCpfBlur}
              required
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> Nome
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> Sobrenome
            </label>
            <input
              type="text"
              name="sobrenome"
              value={formData.sobrenome}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> RG
            </label>
            <input
              type="text"
              name="rg"
              value={formData.rg}
              onChange={handleChange}
              onBlur={handleRgBlur}
              required
            />
          </div>

          <div>
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
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> Cargo
            </label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Telefone</label>
            <input
              type="text"
              name="tel"
              value={formData.tel}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Foto</label>
            <input
              type="file"
              name="foto"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {error && (
            <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Salvar"}
          </button>

          {message && (
            <p
              style={{
                color: message.includes("sucesso") ? "green" : "red",
                marginTop: 10,
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </AdminGuard>
  );
}
