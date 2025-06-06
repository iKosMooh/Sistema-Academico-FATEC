"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/app/components/AdminGuard";
import { EditModal } from "@/app/components/ui/EditModal";
import { ActionButton } from "@/app/components/ui/ActionButton";

interface Usuario {
  [key: string]: unknown;
  cpf: string;
  senhaHash: string;
  tipo: "Admin" | "Professor" | "Aluno";
  created_at?: string;
}

interface Aluno {
  [key: string]: unknown;
  idAluno: number;
  nome: string;
  sobrenome: string;
  cpf: string;
  rg: string;
  nomeMae: string;
  nomePai?: string;
  dataNasc: string;
  fotoPath?: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

interface Professor {
  [key: string]: unknown;
  idProfessor: string;
  nome: string;
  sobrenome: string;
  rg: string;
  dataNasc: string;
  cargo: string;
  fotoPath?: string;
  docsPath?: string;
  descricao?: string;
  tel?: string;
  created_at?: string;
  updated_at?: string;
}

type TableType = "usuarios" | "alunos" | "professores";

export function UsuariosDashboard() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<Usuario | Aluno | Professor | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFields, setEditFields] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<TableType>("usuarios");

  // Filtros
  const [usuarioFiltroCampo, setUsuarioFiltroCampo] = useState<"cpf" | "tipo">("cpf");
  const [usuarioFiltroValor, setUsuarioFiltroValor] = useState("");
  const [alunoFiltroCampo, setAlunoFiltroCampo] = useState<"nome" | "cpf" | "rg" | "nomeMae" | "nomePai">("nome");
  const [alunoFiltroValor, setAlunoFiltroValor] = useState("");
  const [profFiltroCampo, setProfFiltroCampo] = useState<"nome" | "idProfessor" | "cargo" | "rg">("nome");
  const [profFiltroValor, setProfFiltroValor] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "get", table: "usuarios" }),
      })
        .then((res) => res.json())
        .then((result) => result.success ? result.data : []),
      fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "get", table: "alunos" }),
      })
        .then((res) => res.json())
        .then((result) => result.success ? result.data : []),
      fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "get", table: "professores" }),
      })
        .then((res) => res.json())
        .then((result) => result.success ? result.data : []),
    ])
      .then(([usuariosData, alunosData, professoresData]) => {
        setUsuarios(usuariosData);
        setAlunos(alunosData);
        setProfessores(professoresData);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar dados dos usuários.");
        setLoading(false);
      });
  }, []);

  // Editar registro
  const handleEditSave = async (updated: Usuario | Aluno | Professor) => {
    const table: TableType = activeTable;
    let primaryKey: string;
    if (table === "usuarios") primaryKey = "cpf";
    else if (table === "alunos") primaryKey = "idAluno";
    else primaryKey = "idProfessor";
    try {
      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          table,
          primaryKey,
          data: updated,
        }),
      });
      const result = await res.json();
      if (result.success) {
        if (table === "usuarios") {
          setUsuarios((prev) => prev.map((u) => (u.cpf === (updated as Usuario).cpf ? { ...u, ...updated } : u)));
        } else if (table === "alunos") {
          setAlunos((prev) => prev.map((a) => (a.idAluno === (updated as Aluno).idAluno ? { ...a, ...updated } : a)));
        } else {
          setProfessores((prev) => prev.map((p) => (p.idProfessor === (updated as Professor).idProfessor ? { ...p, ...updated } : p)));
        }
      }
    } catch {
      alert("Erro ao editar registro.");
    }
  };

  // Deletar registro
  const handleDelete = async (id: string | number) => {
    const table: TableType = activeTable;
    let primaryKey: string;
    if (table === "usuarios") primaryKey = "cpf";
    else if (table === "alunos") primaryKey = "idAluno";
    else primaryKey = "idProfessor";
    if (!window.confirm("Tem certeza que deseja apagar este registro?")) return;
    try {
      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          table,
          primaryKey,
          data: { [primaryKey]: id },
        }),
      });
      const result = await res.json();
      if (result.success) {
        if (table === "usuarios") setUsuarios((prev) => prev.filter((u) => u.cpf !== id));
        else if (table === "alunos") setAlunos((prev) => prev.filter((a) => a.idAluno !== id));
        else setProfessores((prev) => prev.filter((p) => p.idProfessor !== id));
      } else {
        alert(result.error || "Erro ao apagar registro.");
      }
    } catch {
      alert("Erro ao apagar registro.");
    }
  };

  // Filtros aplicados
  const usuariosFiltrados = usuarios.filter((u) =>
    usuarioFiltroValor === "" ||
    String(u[usuarioFiltroCampo] ?? "")
      .toLowerCase()
      .includes(usuarioFiltroValor.toLowerCase())
  );

  const alunosFiltrados = alunos.filter((a) =>
    alunoFiltroValor === "" ||
    String(a[alunoFiltroCampo] ?? "")
      .toLowerCase()
      .includes(alunoFiltroValor.toLowerCase())
  );

  const professoresFiltrados = professores.filter((p) =>
    profFiltroValor === "" ||
    String(p[profFiltroCampo] ?? "")
      .toLowerCase()
      .includes(profFiltroValor.toLowerCase())
  );

  // Campos para edição
  const usuarioFields = ["cpf", "senhaHash", "tipo", "created_at"];
  const alunoFields = [
    "idAluno", "nome", "sobrenome", "cpf", "rg", "nomeMae", "nomePai", "dataNasc", "fotoPath", "descricao", "created_at", "updated_at"
  ];
  const professorFields = [
    "idProfessor", "nome", "sobrenome", "rg", "dataNasc", "cargo", "fotoPath", "docsPath", "descricao", "tel", "created_at", "updated_at"
  ];

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto bg-white rounded shadow p-8 mt-8 min-h-[60vh] flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-white shadow-none px-0 py-0 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/pages/admin/usuarios/aluno/create"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 hover:text-white whitespace-nowrap"
            >
              Novo Aluno
            </Link>
            <Link
              href="/pages/admin/usuarios/professor/create"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 hover:text-white whitespace-nowrap"
            >
              Novo Professor
            </Link>
            <Link
              href="/pages/admin/usuarios/create"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 hover:text-white whitespace-nowrap"
            >
              Novo Usuário
            </Link>
          </nav>
        </header>
        <main className="flex-1 p-0">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              className={`px-4 py-2 rounded whitespace-nowrap ${activeTable === "usuarios" ? "bg-blue-600 text-white" : "bg-gray-200 text-white"}`}
              onClick={() => setActiveTable("usuarios")}
              type="button"
            >
              Usuários
            </button>
            <button
              className={`px-4 py-2 rounded whitespace-nowrap ${activeTable === "alunos" ? "bg-blue-600 text-white" : "bg-gray-200 text-white"}`}
              onClick={() => setActiveTable("alunos")}
              type="button"
            >
              Alunos
            </button>
            <button
              className={`px-4 py-2 rounded whitespace-nowrap ${activeTable === "professores" ? "bg-blue-600 text-white" : "bg-gray-200 text-white"}`}
              onClick={() => setActiveTable("professores")}
              type="button"
            >
              Professores
            </button>
          </div>
          {error && (
            <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
          )}
          {loading ? (
            <div className="text-center text-gray-500">Carregando...</div>
          ) : (
            <>
              {/* Usuários */}
              {activeTable === "usuarios" && (
                <section className="rounded bg-white p-4 shadow mb-6">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900">Usuários do Sistema</h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <select
                      value={usuarioFiltroCampo}
                      onChange={e => setUsuarioFiltroCampo(e.target.value as "cpf" | "tipo")}
                      className="border rounded px-2 py-1 bg-white text-gray-900"
                    >
                      <option value="cpf">CPF</option>
                      <option value="tipo">Tipo</option>
                    </select>
                    <input
                      type="text"
                      placeholder={`Filtrar por ${usuarioFiltroCampo === "cpf" ? "CPF" : "Tipo"}`}
                      className="border rounded px-2 py-1 bg-white text-gray-900"
                      value={usuarioFiltroValor}
                      onChange={e => setUsuarioFiltroValor(e.target.value)}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr>
                          {usuarioFields.map((f) => (
                            <th key={f} className="py-1 px-2">{f}</th>
                          ))}
                          <th className="py-1 px-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuariosFiltrados.map((u) => (
                          <tr key={u.cpf}>
                            {usuarioFields.map((f) => (
                              <td key={f} className="py-4 px-2 text-gray-900 bg-gray-200">{String(u[f] ?? "")}</td>
                            ))}
                            <td className="py-5 px-5 bg-gray-200">
                              <ActionButton
                                onEdit={() => {
                                  setEditData(u);
                                  setEditFields(usuarioFields);
                                  setEditModalOpen(true);
                                }}
                                onDelete={() => handleDelete(u.cpf)}
                              />
                            </td>
                          </tr>
                        ))}
                        {usuariosFiltrados.length === 0 && (
                          <tr>
                            <td colSpan={usuarioFields.length + 1} className="text-gray-900 py-2 text-center bg-gray-200">Nenhum usuário cadastrado.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
              {/* Alunos */}
              {activeTable === "alunos" && (
                <section className="rounded bg-white p-4 shadow mb-6">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900">Alunos</h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <select
                      value={alunoFiltroCampo}
                      onChange={e => setAlunoFiltroCampo(e.target.value as typeof alunoFiltroCampo)}
                      className="border rounded px-2 py-1 bg-white text-gray-900"
                    >
                      <option value="nome">Nome</option>
                      <option value="cpf">CPF</option>
                      <option value="rg">RG</option>
                      <option value="nomeMae">Nome da Mãe</option>
                      <option value="nomePai">Nome do Pai</option>
                    </select>
                    <input
                      type="text"
                      placeholder={`Filtrar por ${alunoFiltroCampo}`}
                      className="border rounded px-2 py-1 bg-white text-gray-900"
                      value={alunoFiltroValor}
                      onChange={e => setAlunoFiltroValor(e.target.value)}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr>
                          {alunoFields.map((f) => (
                            <th key={f} className="py-1 px-2">{f}</th>
                          ))}
                          <th className="py-1 px-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunosFiltrados.map((a) => (
                          <tr key={a.idAluno}>
                            {alunoFields.map((f) => (
                              <td key={f} className="py-4 px-2 text-gray-900 bg-gray-200">{String(a[f] ?? "")}</td>
                            ))}
                            <td className="py-5 px-5 bg-gray-200">
                              <ActionButton
                                onEdit={() => {
                                  setEditData(a);
                                  setEditFields(alunoFields);
                                  setEditModalOpen(true);
                                }}
                                onDelete={() => handleDelete(a.idAluno)}
                              />
                            </td>
                          </tr>
                        ))}
                        {alunosFiltrados.length === 0 && (
                          <tr>
                            <td colSpan={alunoFields.length + 1} className="text-gray-900 py-2 text-center bg-gray-200">Nenhum aluno cadastrado.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
              {/* Professores */}
              {activeTable === "professores" && (
                <section className="rounded bg-white p-4 shadow mb-6">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900">Professores</h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <select
                      value={profFiltroCampo}
                      onChange={e => setProfFiltroCampo(e.target.value as typeof profFiltroCampo)}
                      className="border rounded px-2 py-1 bg-white text-gray-900"
                    >
                      <option value="nome">Nome</option>
                      <option value="idProfessor">CPF</option>
                      <option value="cargo">Cargo</option>
                      <option value="rg">RG</option>
                    </select>
                    <input
                      type="text"
                      placeholder={`Filtrar por ${profFiltroCampo}`}
                      className="border rounded px-2 py-1 bg-white text-gray-900"
                      value={profFiltroValor}
                      onChange={e => setProfFiltroValor(e.target.value)}
                    />
                  </div>
                  <div className="overflow-x-auto w-full">
                    <div className="min-w-[900px]">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr>
                            {professorFields.map((f) => (
                              <th key={f} className="py-1 px-2">{f}</th>
                            ))}
                            <th className="py-1 px-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {professoresFiltrados.map((p) => (
                            <tr key={p.idProfessor}>
                              {professorFields.map((f) => (
                                <td key={f} className="py-4 px-2 text-gray-900 bg-gray-200">{String(p[f] ?? "")}</td>
                              ))}
                              <td className="py-5 px-5 bg-gray-200">
                                <ActionButton
                                  onEdit={() => {
                                    setEditData(p);
                                    setEditFields(professorFields);
                                    setEditModalOpen(true);
                                  }}
                                  onDelete={() => handleDelete(p.idProfessor)}
                                />
                              </td>
                            </tr>
                          ))}
                          {professoresFiltrados.length === 0 && (
                            <tr>
                              <td colSpan={professorFields.length + 1} className="text-gray-900 py-2 text-center bg-gray-200">Nenhum professor cadastrado.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
              <EditModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                data={editData}
                onSave={handleEditSave}
                fields={editFields}
              />
            </>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}

// Se ainda quiser manter a página acessível diretamente, exporte uma page que apenas renderiza o componente:
export default function UsuariosDashboardPage() {
  return <UsuariosDashboard />;
}
