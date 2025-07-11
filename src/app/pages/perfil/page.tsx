'use client';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import Image from "next/image";

// Schemas Zod
const SenhaSchema = z.object({
  senhaAtual: z.string().min(4, "Senha atual obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string()
}).refine(data => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"]
});

const EnderecoSchema = z.object({
  cep: z.string().min(8, "CEP obrigatório"),
  rua: z.string().min(3, "Rua obrigatória"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 letras"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional()
});

const DadosSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  sobrenome: z.string().min(2, "Sobrenome obrigatório"),
  email: z.string().email("Email inválido")
});

export default function PerfilPage() {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState<"dados" | "senha" | "endereco" | "foto">("dados");
  type FormType = {
    // Dados pessoais
    nome?: string;
    sobrenome?: string;
    email?: string;
    // Senha
    senhaAtual?: string;
    novaSenha?: string;
    confirmarSenha?: string;
    // Endereço
    cep?: string;
    rua?: string;
    cidade?: string;
    uf?: string;
    numero?: string;
    complemento?: string;
  };
  const [form, setForm] = useState<FormType>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [isAluno, setIsAluno] = useState<boolean>(true);

  // Carregar dados iniciais
  useEffect(() => {
    if (session?.user) {
      setForm({
        nome: session.user.nome,
        sobrenome: session.user.sobrenome,
        email: session.user.email,
        // Endereço pode ser buscado via API se necessário
      });
      setFotoPreview(session.user.fotoPath || null);

      // Verifica se o usuário é aluno
      if (session.user.tipo === "Aluno") {
        setIsAluno(true);
      } else {
        setIsAluno(false);
      }
    }
  }, [session]);

  // Troca de senha
  async function handleSenha(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null);
    const parsed = SenhaSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    try {
      // Verifica senha atual
      const res = await fetch("/api/usuarios/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: session?.user?.cpf, senha: form.senhaAtual })
      });
      const check = await res.json();
      if (!check.success) {
        setError("Senha atual incorreta");
        return;
      }
      // Atualiza senha (bcrypt no backend)
      const res2 = await fetch("/api/usuarios/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: session?.user?.cpf, novaSenha: form.novaSenha })
      });
      const result = await res2.json();
      if (!result.success) {
        setError(result.error || "Erro ao atualizar senha");
        return;
      }
      setSuccess("Senha alterada com sucesso!");
      setForm({ ...form, senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    } catch {
      setError("Erro ao atualizar senha");
    }
  }

  // Atualizar dados pessoais
  async function handleDados(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null);
    const parsed = DadosSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    try {
      const res = await fetch("/api/usuarios/update-dados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: session?.user?.cpf, ...form })
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || "Erro ao atualizar dados");
        return;
      }
      setSuccess("Dados atualizados!");
      // Atualiza sessão
      await update({ nome: form.nome, sobrenome: form.sobrenome, email: form.email });
    } catch {
      setError("Erro ao atualizar dados");
    }
  }

  // Atualizar endereço
  async function handleEndereco(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null);
    const parsed = EnderecoSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    try {
      const res = await fetch("/api/usuarios/update-endereco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: session?.user?.cpf, ...form })
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || "Erro ao atualizar endereço");
        return;
      }
      setSuccess("Endereço atualizado!");
    } catch {
      setError("Erro ao atualizar endereço");
    }
  }

  // Atualizar foto de perfil
  async function handleFoto(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!fotoFile) {
      setError("Selecione uma foto");
      return;
    }
    const fd = new FormData();
    fd.append("cpf", session?.user?.cpf || "");
    fd.append("foto", fotoFile);
    try {
      const res = await fetch("/api/usuarios/update-foto", {
        method: "POST",
        body: fd
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || "Erro ao atualizar foto");
        return;
      }
      setSuccess("Foto atualizada!");
      setFotoPreview(result.fotoPath);
      // Atualiza sessão para refletir nova foto
      await update({ fotoPath: result.fotoPath });
    } catch {
      setError("Erro ao atualizar foto");
    }
  }

  // Preview da foto
  function onFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFotoFile(e.target.files[0]);
      setFotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-8 mt-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-900">Meu Perfil</h1>
        <div className="flex gap-4 mb-8">
          <button className={`px-4 py-2 rounded ${tab === "dados" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("dados")}>Dados Pessoais</button>
          <button className={`px-4 py-2 rounded ${tab === "senha" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("senha")}>Senha</button>
          {isAluno && (
            <button className={`px-4 py-2 rounded ${tab === "endereco" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("endereco")}>Endereço</button>
          )}
          <button className={`px-4 py-2 rounded ${tab === "foto" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("foto")}>Foto</button>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}

        {tab === "dados" && (
          <form className="bg-gray-200" onSubmit={handleDados}>
            <label>Nome</label>
            <input className="bg-white text-gray-900" type="text" value={form.nome || ""} onChange={e => setForm({ ...form, nome: e.target.value })} />
            <label>Sobrenome</label>
            <input className="bg-white text-gray-900" type="text" value={form.sobrenome || ""} onChange={e => setForm({ ...form, sobrenome: e.target.value })} />
            <label>Email</label>
            <input disabled className="bg-white text-gray-900" type="email" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
            <button type="submit">Salvar</button>
          </form>
        )}

        {tab === "senha" && (
          <form className="bg-gray-200" onSubmit={handleSenha}>
            <label>Senha Atual</label>
            <input className="bg-white text-gray-900" type="password" value={form.senhaAtual || ""} onChange={e => setForm({ ...form, senhaAtual: e.target.value })} />
            <label>Nova Senha</label>
            <input className="bg-white text-gray-900" type="password" value={form.novaSenha || ""} onChange={e => setForm({ ...form, novaSenha: e.target.value })} />
            <label>Confirmar Nova Senha</label>
            <input className="bg-white text-gray-900" type="password" value={form.confirmarSenha || ""} onChange={e => setForm({ ...form, confirmarSenha: e.target.value })} />
            <button type="submit">Alterar Senha</button>
          </form>
        )}

        {isAluno && tab === "endereco" && (
          <form className="bg-gray-200" onSubmit={handleEndereco}>
            <label>CEP</label>
            <input
              className="bg-white text-gray-900"
              type="text"
              value={form.cep || ""}
              onChange={e => setForm({ ...form, cep: e.target.value })}
              onBlur={async (e) => {
                const cep = e.target.value.replace(/\D/g, '');
                if (cep.length === 8) {
                  try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                      setForm(prev => ({
                        ...prev,
                        rua: data.logradouro || prev.rua,
                        cidade: data.localidade || prev.cidade,
                        uf: data.uf || prev.uf,
                      }));
                    }
                  } catch {
                    // Silencie erro de consulta de CEP
                  }
                }
              }}
            />
            <label>Rua</label>
            <input className="bg-white text-gray-900" type="text" value={form.rua || ""} onChange={e => setForm({ ...form, rua: e.target.value })} />
            <label>Cidade</label>
            <input className="bg-white text-gray-900" type="text" value={form.cidade || ""} onChange={e => setForm({ ...form, cidade: e.target.value })} />
            <label>UF</label>
            <input className="bg-white text-gray-900" type="text" value={form.uf || ""} onChange={e => setForm({ ...form, uf: e.target.value })} />
            <label>Número</label>
            <input className="bg-white text-gray-900" type="text" value={form.numero || ""} onChange={e => setForm({ ...form, numero: e.target.value })} />
            {/* Mensagem de erro customizada para campo obrigatório */}
            {!form.numero || form.numero.trim() === "" ? (
              <span className="text-red-600 text-sm mt-1 block">Digitar o número é necessário</span>
            ) : null}
            <label>Complemento</label>
            <input className="bg-white text-gray-900" type="text" value={form.complemento || ""} onChange={e => setForm({ ...form, complemento: e.target.value })} />
            {/* Mensagem de erro do formulário (acima do botão) */}
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <button type="submit">Salvar Endereço</button>
          </form>
        )}

        {tab === "foto" && (
          <form className="bg-gray-200" onSubmit={handleFoto}>
            <div className="mb-4">
              {fotoPreview ? (
                <span
                  className="cursor-pointer"
                  onClick={() => setTab("dados")}
                  title="Ir para perfil"
                >
                  <Image src={fotoPreview} alt="Foto de perfil" width={120} height={120} className="rounded-full object-cover" />
                </span>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">Sem foto</div>
              )}
            </div>
            <input className="bg-white text-gray-900" type="file" accept="image/*" onChange={onFotoChange} />
            <button type="submit">Atualizar Foto</button>
          </form>
        )}
      </div>
    </main>
  );
}
