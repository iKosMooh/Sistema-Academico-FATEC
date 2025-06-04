"use client";
import { HeaderAdmin } from "@/app/components/painel-aulas/HeaderAdmin";
import { SidebarTurmas } from "@/app/components/painel-aulas/SidebarTurmas";
import { TabsContainer } from "@/app/components/painel-aulas/TabsContainer";
import { AppProvider } from "@/app/components/painel-aulas/AppContext";
import { GerenciarAulasRecorrentes } from "@/app/components/painel-aulas/GerenciarAulasRecorrentes";

export default function PainelAulasPage() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <HeaderAdmin />
        <div className="flex flex-1">
          <SidebarTurmas />
          <main className="flex-1 p-4 overflow-x-auto">
            <GerenciarAulasRecorrentes isOpen={false} onClose={() => {}} />
            <TabsContainer />
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
