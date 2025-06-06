"use client";

import { useSession } from "next-auth/react";

// Tipos básicos para evitar dependência circular
type TipoUsuarioBasic = 'Admin' | 'Coordenador' | 'Professor' | 'Aluno';

// Hierarquia básica
const USER_HIERARCHY = {
  Admin: 4,
  Coordenador: 3,
  Professor: 2,
  Aluno: 1
} as const;

// Função básica de verificação de permissão
function hasBasicPermission(userType: TipoUsuarioBasic, requiredLevel: TipoUsuarioBasic): boolean {
  return USER_HIERARCHY[userType] >= USER_HIERARCHY[requiredLevel];
}

export function usePermissions() {
  const { data: session, status } = useSession();
  
  // Usar tipoLogin (como está acessando) ao invés do tipo real
  const userType = session?.user?.tipoLogin as TipoUsuarioBasic | undefined;
  const tipoReal = session?.user?.tipo as TipoUsuarioBasic | undefined;

  return {
    userType,
    tipoReal, // Tipo real do usuário no banco
    isLoggedIn: !!session,
    isLoading: status === 'loading',
    
    // Verificar se tem permissão para um nível específico
    hasPermission: (requiredRole: TipoUsuarioBasic): boolean => {
      if (!userType) return false;
      return hasBasicPermission(userType, requiredRole);
    },
    
    // Verificar se é exatamente um tipo específico
    isExactly: (role: TipoUsuarioBasic): boolean => {
      return userType === role;
    },
    
    // Obter todos os níveis acessíveis
    getAccessibleLevels: (): TipoUsuarioBasic[] => {
      if (!userType) return [];
      const userLevel = USER_HIERARCHY[userType];
      return Object.entries(USER_HIERARCHY)
        .filter(([, level]) => level <= userLevel)
        .map(([role]) => role as TipoUsuarioBasic);
    },
    
    // Verificações específicas para cada nível (baseado no tipo de login)
    isAdmin: userType === 'Admin',
    isCoordenador: userType === 'Coordenador' || userType === 'Admin',
    isProfessor: userType === 'Professor' || userType === 'Coordenador' || userType === 'Admin',
    isAluno: !!userType, // Qualquer usuário logado
    
    // Verificações hierárquicas
    canAccessAdmin: userType === 'Admin',
    canAccessCoordenador: userType ? hasBasicPermission(userType, 'Coordenador') : false,
    canAccessProfessor: userType ? hasBasicPermission(userType, 'Professor') : false,
    canAccessAluno: userType ? hasBasicPermission(userType, 'Aluno') : false,

    // Informações especiais
    isRealAdmin: tipoReal === 'Admin',
    isImpersonating: tipoReal !== userType, // Se está acessando como outro tipo

    // Informações da sessão
    session,
    status,
  };
}
