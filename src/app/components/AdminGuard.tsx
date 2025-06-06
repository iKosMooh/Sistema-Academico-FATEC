// src/app/components/AdminGuard.tsx
"use client";

import { ReactNode } from "react";
import { AdminGuard as NewAdminGuard } from "./guards/AdminGuard";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * @deprecated Use AdminGuard from './guards/AdminGuard' instead
 * Mantido para compatibilidade com código existente
 */
export function AdminGuard({ children }: AdminGuardProps) {
  return <NewAdminGuard>{children}</NewAdminGuard>;
}
