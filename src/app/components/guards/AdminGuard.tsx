"use client";

import { ReactNode } from "react";
import { RoleGuard } from "./RoleGuard";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  return (
    <RoleGuard requiredRole="Admin" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
