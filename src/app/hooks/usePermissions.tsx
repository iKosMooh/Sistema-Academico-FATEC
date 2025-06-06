"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

declare module "next-auth" {
  interface User {
    tipo: string;
    tipoLogin: string;
  }
  
  interface Session {
    user: User & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export function usePermissions() {
  const { data: session, status } = useSession();

  const permissions = useMemo(() => {
    if (status === "loading") {
      return {
        isLoading: true,
        isLoggedIn: false,
        userType: null,
        tipoLogin: null,
        canAccessAdmin: false,
        canAccessCoordenador: false,
        canAccessProfessor: false,
        canAccessAluno: false,
      };
    }

    if (!session?.user) {
      return {
        isLoading: false,
        isLoggedIn: false,
        userType: null,
        tipoLogin: null,
        canAccessAdmin: false,
        canAccessCoordenador: false,
        canAccessProfessor: false,
        canAccessAluno: false,
      };
    }

    const userType = session.user.tipo;
    const tipoLogin = session.user.tipoLogin;

    // Hierarquia de permissões
    const hierarchy = {
      Admin: 4,
      Coordenador: 3,
      Professor: 2,
      Aluno: 1
    };

    const userLevel = hierarchy[userType as keyof typeof hierarchy] || 0;

    return {
      isLoading: false,
      isLoggedIn: true,
      userType,
      tipoLogin,
      canAccessAdmin: userLevel >= hierarchy.Admin,
      canAccessCoordenador: userLevel >= hierarchy.Coordenador,
      canAccessProfessor: userLevel >= hierarchy.Professor,
      canAccessAluno: userLevel >= hierarchy.Aluno || tipoLogin === 'Aluno',
    };
  }, [session, status]);

  return permissions;
}
