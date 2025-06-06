"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidCPF, formatCPF } from "@/utils/cpf-rg";
import Image from "next/image";

export default function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
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
      });

      if (result && result.ok) {
        router.push("/pages/admin/painel-aulas");
      } else {
        setError("Credenciais inválidas. Tente novamente.");
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
          <p className="mt-2 font-bold text-gray-800">
            Acesso ao Sistema Acadêmico
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="cpf"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              CPF
            </label>
            <div className="relative">
              <input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength={14}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                autoComplete="username"
              />
              <svg
                className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-500 bg-red-50 py-2 px-4 rounded-lg text-sm flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
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
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all
              ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processando...
              </span>
            ) : (
              "Acessar Sistema"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Problemas com acesso?{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline"
            >
              Contate o suporte
            </a>
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Sistema Educacional - Todos os direitos
            reservados
          </p>
        </div>
      </div>
    </div>
  );
}
