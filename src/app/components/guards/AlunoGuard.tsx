"use client";

import { ReactNode } from "react";
import { RoleGuard } from "./RoleGuard";

interface AlunoGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guard para nível Aluno ou superior (Todos os usuários logados)
 * Permite acesso a funcionalidades básicas do sistema
 */
export function AlunoGuard({ children, fallback }: AlunoGuardProps) {
  return (
    <RoleGuard requiredRole="Aluno" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
