"use client";

import { ReactNode } from "react";
import { RoleGuard } from "./RoleGuard";

interface CoordenadorGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Guard para nível Coordenador ou superior (Coordenador + Admin)
 * Permite acesso a funcionalidades de coordenação acadêmica
 */
export function CoordenadorGuard({ children, fallback }: CoordenadorGuardProps) {
  return (
    <RoleGuard requiredRole="Coordenador" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
