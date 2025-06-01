// src/app/components/AdminGuard.tsx
import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  if (!session || (session.user as any).tipo !== "Admin") {
    return <div><p>Acesso negado. Apenas administradores podem acessar.</p><a href="/pages/login">Fazer Login</a></div>;
  }

  return <>{children}</>;
}
