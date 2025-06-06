"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidCPF, formatCPF } from "@/utils/cpf-rg";
import Image from "next/image";

type TipoLogin = "Admin" | "Coordenador" | "Professor" | "Aluno";

interface TipoUsuarioOption {
  value: TipoLogin;
  label: string;
  icon: string;
  description: string;
  emailSuffix: string;
  color: string;
}

const tiposUsuario: TipoUsuarioOption[] = [
  {
    value: "Admin",
    label: "Admin",
    icon: "👑",
    description: "Acesso completo ao sistema",
    emailSuffix: "@admin.softmare.edu",
    color: "bg-purple-500",
  },
  {
    value: "Coordenador",
    label: "Coordenador",
    icon: "🎓",
    description: "Gestão acadêmica e coordenação",
    emailSuffix: "@coordenador.softmare.edu",
    color: "bg-blue-500",
  },
  {
    value: "Professor",
    label: "Professor",
    icon: "👨‍🏫",
    description: "Ensino e gestão de aulas",
    emailSuffix: "@professor.softmare.edu",
    color: "bg-green-500",
  },
  {
    value: "Aluno",
    label: "Aluno",
    icon: "👨‍🎓",
    description: "Portal do estudante",
    emailSuffix: "@aluno.softmare.edu",
    color: "bg-orange-500",
  },
];

export default function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoLogin>("Aluno");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cpfSomenteNumeros = cpf.replace(/\D/g, "");

      if (!isValidCPF(cpfSomenteNumeros)) {
        setError("CPF inválido. Por favor, verifique.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        cpf: formatCPF(cpfSomenteNumeros),
        senha,
        tipoLogin: tipoSelecionado,
      });

      if (result && result.ok) {
        // Redirect baseado no tipo de login selecionado
        switch (tipoSelecionado) {
          case "Admin":
            router.push("/pages/admin/painel-aulas");
            break;
          case "Coordenador":
            router.push("/pages/admin/painel-aulas");
            break;
          case "Professor":
            router.push("/pages/admin/painel-aulas");
            break;
          case "Aluno":
            router.push("/");
            break;
          default:
            router.push("/");
        }
      } else {
        if (result?.error === "CredentialsSignin") {
          setError(
            "Credenciais inválidas ou você não tem permissão para acessar como este tipo de usuário."
          );
        } else {
          setError("Erro ao fazer login. Tente novamente.");
        }
      }
    } catch {
      setError("Erro inesperado. Tente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, "");
    if (valor.length <= 11) {
      setCpf(formatCPF(valor));
    }
  };

  const tipoSelecionadoData = tiposUsuario.find(
    (t) => t.value === tipoSelecionado
  )!;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-fixed bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1500&q=80')",
      }}
    >
      <div className="rounded-2xl shadow-2xl p-8 w-full max-w-md bg-white/30 backdrop-blur">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo Softmare"
            width={80}
            height={80}
            className="w-20 h-20 object-contain mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-white mb-2">SOFTMARE</h1>
          <p className="text-center font-medium text-gray-100">
            Sistema Integrado de Gestão Educacional
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo CPF com Select Integrado */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              CPF e Tipo de Acesso
            </label>
            <div className="flex bg-white/90 backdrop-blur rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              {/* Input CPF */}
              <div className="flex-1 relative">
                <input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  required
                  className="w-full px-4 py-3 rounded-l-lg border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-800"
                  autoComplete="username"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              {/* Divisor Visual */}
              <div className="w-px bg-gray-300"></div>

              {/* Select Tipo de Usuário */}
              <div className="relative">
                <select
                  value={tipoSelecionado}
                  onChange={(e) =>
                    setTipoSelecionado(e.target.value as TipoLogin)
                  }
                  className="appearance-none bg-transparent border-0 py-3 pl-3 pr-8 text-gray-800 focus:outline-none focus:ring-0 rounded-r-lg cursor-pointer font-medium min-w-[140px]"
                >
                  {tiposUsuario.map((tipo) => (
                    <option
                      key={tipo.value}
                      value={tipo.value}
                      className="bg-white text-gray-800"
                    >
                      {tipo.icon} {tipo.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Preview do Email */}
            <div className="mt-2 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/30">
                <span className="text-lg">{tipoSelecionadoData.icon}</span>
                <span className="text-white text-sm font-mono">
                  {cpf.replace(/\D/g, "") || "seucpf"}
                  {tipoSelecionadoData.emailSuffix}
                </span>
              </div>
            </div>

            {/* Descrição do Tipo Selecionado */}
            <div className="mt-2 text-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${tipoSelecionadoData.color}`}
              >
                {tipoSelecionadoData.description}
              </span>
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-white mb-1"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 bg-white/90 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800"
                autoComplete="current-password"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {error && (
            <div className="text-red-600 bg-red-50/90 backdrop-blur py-3 px-4 rounded-lg text-sm flex items-center border border-red-200">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all transform flex items-center justify-center gap-2
              ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02]"}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>{tipoSelecionadoData.icon}</span>
                <span>Entrar como {tipoSelecionadoData.label}</span>
              </>
            )}
          </button>
        </form>

        {/* Informações sobre hierarquia */}
        <div className="mt-6 text-center text-sm text-white/80">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 mb-4">
            <p className="font-medium mb-2">💡 Sistema Hierárquico</p>
            <p className="text-xs leading-relaxed">
              Administradores podem acessar como qualquer tipo de usuário. Outros
              usuários só podem acessar seu próprio nível.
            </p>
          </div>

          <p>
            Problemas com acesso?{" "}
            <a
              href="#"
              className="text-blue-200 hover:text-white hover:underline transition-colors"
            >
              Contate o suporte
            </a>
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} SOFTMARE - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
