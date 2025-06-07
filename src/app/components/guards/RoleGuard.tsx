"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { TipoUsuario, hasPermission } from "@/lib/schemas";

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: TipoUsuario;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  fallback,
  redirectTo = "/pages/login" 
}: RoleGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">Verificando permissões...</span>
      </div>
    );
  }

  if (!session) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar esta página.</p>
          <a 
            href={redirectTo}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 hover:text-white transition-colors inline-block"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  const userType = session.user.tipo as TipoUsuario;
  const hasAccess = hasPermission(userType, requiredRole);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636 5.636 18.364" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Permissão Insuficiente</h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta funcionalidade.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Seu nível:</strong> {userType}<br/>
              <strong>Nível necessário:</strong> {requiredRole} ou superior
            </p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
