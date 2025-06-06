// src/app/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    cpf: string;
    tipo: string;
    tipoLogin: string;
    nome: string;
    sobrenome: string;
    fotoPath?: string | null;
  }

  interface Session {
    user: {
      id: string;
      cpf: string;
      tipo: string;
      tipoLogin: string;
      nome: string;
      sobrenome: string;
      email: string;
      fotoPath?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    cpf: string;
    tipo: string;
    tipoLogin: string;
    nome: string;
    sobrenome: string;
    fotoPath?: string | null;
  }
}

// Interface for user data from different tables
interface UserData {
  nome: string;
  sobrenome: string;
  email: string;
  fotoPath?: string | null;
}

// Hierarquia de permissões
const USER_HIERARCHY = {
  Admin: 4,
  Coordenador: 3,
  Professor: 2,
  Aluno: 1
} as const;

type TipoUsuario = keyof typeof USER_HIERARCHY;

// Função para verificar se um usuário pode acessar como outro tipo
function canAccessAs(userType: TipoUsuario, requestedType: TipoUsuario): boolean {
  return USER_HIERARCHY[userType] >= USER_HIERARCHY[requestedType];
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        senha: { label: "Senha", type: "password" },
        tipoLogin: { label: "Tipo de Login", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.senha || !credentials?.tipoLogin) {
          return null;
        }

        try {
          // Buscar usuário real no banco
          const usuario = await prisma.usuarios.findUnique({
            where: { cpf: credentials.cpf },
          });

          if (!usuario) return null;
          
          const senhaValida = await bcrypt.compare(
            credentials.senha,
            usuario.senhaHash
          );
          if (!senhaValida) return null;

          // Verificar se o usuário pode acessar como o tipo solicitado
          const tipoSolicitado = credentials.tipoLogin as TipoUsuario;
          if (!canAccessAs(usuario.tipo as TipoUsuario, tipoSolicitado)) {
            console.log(`Usuário ${usuario.tipo} tentou acessar como ${tipoSolicitado} - NEGADO`);
            return null;
          }

          // Buscar dados específicos baseado no tipo SOLICITADO (não o tipo real)
          let dadosUsuario: UserData | null = null;

          switch (tipoSolicitado) {
            case "Admin":
              // Dados para acesso como Admin
              if (usuario.tipo === 'Admin') {
                dadosUsuario = {
                  nome: "Administrador",
                  sobrenome: "Sistema",
                  email: `${credentials.cpf}@admin.softmare.edu`,
                  fotoPath: null,
                };
              } else {
                // Admin acessando como admin, mas usando dados reais
                const professorData = await prisma.professores.findUnique({
                  where: { idProfessor: credentials.cpf },
                });
                dadosUsuario = {
                  nome: professorData?.nome || "Administrador",
                  sobrenome: professorData?.sobrenome || "Sistema",
                  email: `${credentials.cpf}@admin.softmare.edu`,
                  fotoPath: professorData?.fotoPath || null,
                };
              }
              break;

            case "Coordenador":
              // Buscar dados de professor (coordenador é um professor)
              const coordenador = await prisma.professores.findUnique({
                where: { idProfessor: credentials.cpf },
              });
              dadosUsuario = {
                nome: coordenador?.nome || "Coordenador",
                sobrenome: coordenador?.sobrenome || "Sistema",
                email: `${credentials.cpf}@coordenador.softmare.edu`,
                fotoPath: coordenador?.fotoPath || null,
              };
              break;

            case "Professor":
              const professor = await prisma.professores.findUnique({
                where: { idProfessor: credentials.cpf },
              });
              dadosUsuario = {
                nome: professor?.nome || "Professor",
                sobrenome: professor?.sobrenome || "Sistema",
                email: `${credentials.cpf}@professor.softmare.edu`,
                fotoPath: professor?.fotoPath || null,
              };
              break;

            case "Aluno":
              const aluno = await prisma.alunos.findFirst({
                where: { cpf: credentials.cpf },
              });
              dadosUsuario = {
                nome: aluno?.nome || "Aluno",
                sobrenome: aluno?.sobrenome || "Sistema",
                email: `${credentials.cpf}@aluno.softmare.edu`,
                fotoPath: aluno?.fotoPath || null,
              };
              break;
          }

          if (!dadosUsuario) {
            console.log(`Dados não encontrados para ${tipoSolicitado} com CPF ${credentials.cpf}`);
            return null;
          }

          console.log(`Login autorizado: ${usuario.tipo} acessando como ${tipoSolicitado}`);

          return {
            id: credentials.cpf,
            cpf: credentials.cpf,
            tipo: usuario.tipo, // Tipo real do usuário
            tipoLogin: tipoSolicitado, // Tipo que ele está acessando
            nome: dadosUsuario.nome,
            sobrenome: dadosUsuario.sobrenome,
            email: dadosUsuario.email,
            fotoPath: dadosUsuario.fotoPath,
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.cpf = user.cpf;
        token.tipo = user.tipo;
        token.tipoLogin = user.tipoLogin;
        token.nome = user.nome;
        token.sobrenome = user.sobrenome;
        token.fotoPath = user.fotoPath;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        cpf: token.cpf as string,
        tipo: token.tipo as string,
        tipoLogin: token.tipoLogin as string,
        nome: token.nome as string,
        sobrenome: token.sobrenome as string,
        fotoPath: token.fotoPath as string,
      };
      return session;
    },
  },

  pages: {
    signIn: "/pages/login",
    error: "/pages/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
