// src/app/pages/admin/cadastrar-aluno/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidCPF, isValidRG, formatCPF, formatRG } from "@/utils/cpf-rg";
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

  const handleCpfBlur = () => {
    if (formData.cpf && !isValidCPF(formData.cpf)) {
      setError("CPF inválido");
    } else if (formData.cpf) {
      setError("");
      setFormData((prev) => ({ ...prev, cpf: formatCPF(prev.cpf) }));
    }
  };

  const handleRgBlur = () => {
    if (formData.rg && !isValidRG(formData.rg)) {
      setError("RG inválido");
    } else if (formData.rg) {
      setError("");
      setFormData((prev) => ({ ...prev, rg: formatRG(prev.rg) }));
    }
  };

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

      router.push("/pages/admin/usuarios/dashboard");
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
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label>
              <span style={{ color: "red" }}>*</span> Nome
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Digite o nome"
              required
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> Sobrenome
            </label>
            <input
              type="text"
              value={formData.sobrenome}
              onChange={(e) =>
                setFormData({ ...formData, sobrenome: e.target.value })
              }
              placeholder="Digite o sobrenome"
              required
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> CPF
            </label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              onBlur={handleCpfBlur}
              placeholder="Digite o CPF"
              pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
              required
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> RG
            </label>
            <input
              type="text"
              value={formData.rg}
              onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              onBlur={handleRgBlur}
              placeholder="Digite o RG"
              required
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> Nome da Mãe
            </label>
            <input
              type="text"
              value={formData.nomeMae}
              onChange={(e) =>
                setFormData({ ...formData, nomeMae: e.target.value })
              }
              placeholder="Digite o nome da mãe"
              required
            />
          </div>

          <div>
            <label>Nome do Pai</label>
            <input
              type="text"
              value={formData.nomePai}
              placeholder="Digite o nome do pai"
              onChange={(e) => setFormData({ ...formData, nomePai: e.target.value })}
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> Data de Nascimento
            </label>
            <input
              type="date"
              value={formData.dataNasc}
              onChange={(e) =>
                setFormData({ ...formData, dataNasc: e.target.value })
              }
              placeholder="Selecione a data de nascimento"
              required
            />
          </div>

          <div>
            <label>Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Digite uma descrição"
            />
          </div>

          <div>
            <label>Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  foto: e.target.files ? e.target.files[0] : null,
                })
              }
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> Nome do Telefone 1
            </label>
            <input
              type="text"
              value={formData.nomeTel1}
              onChange={(e) =>
                setFormData({ ...formData, nomeTel1: e.target.value })
              }
              placeholder="Digite o nome do telefone 1"
              required
            />
          </div>

          <div>
            <label>
              <span style={{ color: "red" }}>*</span> Telefone 1
            </label>
            <input
              type="text"
              value={formData.tel1}
              onChange={(e) => setFormData({ ...formData, tel1: e.target.value })}
              placeholder="Digite o telefone 1"
              required
            />
          </div>

          <div>
            <label>Nome do Telefone 2</label>
            <input
              type="text"
              value={formData.nomeTel2}
              onChange={(e) =>
                setFormData({ ...formData, nomeTel2: e.target.value })
              }
              placeholder="Digite o nome do telefone 2"
            />
          </div>

          <div>
            <label>Telefone 2</label>
            <input
              type="text"
              value={formData.tel2}
              onChange={(e) => setFormData({ ...formData, tel2: e.target.value })}
              placeholder="Digite o telefone 2"
            />
          </div>

          {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
