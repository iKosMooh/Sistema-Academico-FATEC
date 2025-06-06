"use client";
import { ProfessorGuard } from "@/app/components/guards/ProfessorGuard";
import { AppContextProvider } from "@/app/components/painel-aulas/AppContext";
import { SidebarTurmas } from "@/app/components/painel-aulas/SidebarTurmas";

export default function PainelAulasPage() {
  return (
    <ProfessorGuard>
      <AppContextProvider>
        <main className="bg-gray-100 min-h-screen">
          <SidebarTurmas />
        </main>
      </AppContextProvider>
    </ProfessorGuard>
  );
}
