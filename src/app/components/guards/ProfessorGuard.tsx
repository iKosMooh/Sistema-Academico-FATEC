"use client";

import { ReactNode } from "react";
import { RoleGuard } from "./RoleGuard";

interface ProfessorGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guard para nível Professor ou superior (Professor + Coordenador + Admin)
 * Permite acesso a funcionalidades de ensino e gestão de aulas
 */
export function ProfessorGuard({ children, fallback }: ProfessorGuardProps) {
  return (
    <RoleGuard requiredRole="Professor" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
