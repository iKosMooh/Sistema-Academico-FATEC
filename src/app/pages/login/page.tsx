"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidCPF, formatCPF } from "@/utils/cpf-rg";

export default function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cpfSomenteNumeros = cpf.replace(/\D/g, "");

    if (!isValidCPF(cpfSomenteNumeros)) {
      alert("CPF inválido. Por favor, verifique.");
      return;
    }

    const cpfFormatado = formatCPF(cpfSomenteNumeros);

    const result = await signIn("credentials", {
      redirect: false,
      cpf: cpfFormatado,
      senha,
    });

    if (result?.ok) {
      router.push("/pages/dashboard");
    } else {
      alert("Falha no login: " + result?.error);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, ""); // remove tudo que não for número
    const cpfFormatado = formatCPF(valor);
    setCpf(cpfFormatado);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={handleCpfChange}
          maxLength={14} // formato XXX.XXX.XXX-XX = 14 caracteres
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
