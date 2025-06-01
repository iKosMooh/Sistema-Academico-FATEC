// src/app/lib/auth.ts

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Estende tipos do next-auth para incluir 'tipo' no usuário e sessão
declare module "next-auth" {
  interface Session {
    user: {
      cpf?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tipo?: string;
    };
  }
  interface User {
    tipo?: string;
  }
  interface JWT {
    tipo?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.senha) {
          throw new Error("CPF e senha são obrigatórios");
        }

        const user = await prisma.usuarios.findUnique({
          where: { cpf: credentials.cpf },
        });
        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const isValid = await bcrypt.compare(
          credentials.senha,
          user.senhaHash
        );
        if (!isValid) {
          throw new Error("Senha incorreta");
        }

        // Retornamos um objeto que satisfaça a interface `User` estendida
        return {
          id: user.cpf,
          tipo: user.tipo,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Quando o usuário acabou de fazer login, `user` estará definido
      if (user) {
        token.tipo = user.tipo;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.tipo = token.tipo as string;
      session.user.cpf = token.sub as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
