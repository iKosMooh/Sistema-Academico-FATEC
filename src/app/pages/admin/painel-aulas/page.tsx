"use client";
import { HeaderAdmin } from "@/app/components/painel-aulas/HeaderAdmin";
import { SidebarTurmas } from "@/app/components/painel-aulas/SidebarTurmas";
import { AppProvider } from "@/app/components/painel-aulas/AppContext";
import { AdminGuard } from "@/app/components/AdminGuard";

export default function PainelAulasPage() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderAdmin />
        <div className="flex flex-1">
          <SidebarTurmas />
          <main className="flex-1 p-4 overflow-x-auto">
            <GerenciarAulasRecorrentes isOpen={false} onClose={() => {}} />
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
