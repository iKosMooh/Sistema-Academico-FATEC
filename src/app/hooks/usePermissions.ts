"use client";

import { useSession } from "next-auth/react";
import { TipoUsuario, hasPermission, getAccessibleLevels } from "@/lib/schemas";

export function usePermissions() {
  const { data: session } = useSession();
  
  const userType = session?.user?.tipo as TipoUsuario | undefined;

  return {
    userType,
    isLoggedIn: !!session,
    
    // Verificar se tem permissão para um nível específico
    hasPermission: (requiredRole: TipoUsuario): boolean => {
      if (!userType) return false;
      return hasPermission(userType, requiredRole);
    },
    
    // Verificar se é exatamente um tipo específico
    isExactly: (role: TipoUsuario): boolean => {
      return userType === role;
    },
    
    // Obter todos os níveis acessíveis
    getAccessibleLevels: (): TipoUsuario[] => {
      if (!userType) return [];
      return getAccessibleLevels(userType);
    },
    
    // Verificações específicas para cada nível
    isAdmin: userType === 'Admin',
    isCoordenador: userType === 'Coordenador' || userType === 'Admin',
    isProfessor: userType === 'Professor' || userType === 'Coordenador' || userType === 'Admin',
    isAluno: !!userType, // Qualquer usuário logado
    
    // Verificações hierárquicas
    canAccessAdmin: userType === 'Admin',
    canAccessCoordenador: userType ? hasPermission(userType, 'Coordenador') : false,
    canAccessProfessor: userType ? hasPermission(userType, 'Professor') : false,
    canAccessAluno: userType ? hasPermission(userType, 'Aluno') : false,
  };
}
