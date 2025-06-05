"use client";
import { AdminGuard } from "@/app/components/AdminGuard";
import { AppContextProvider } from "@/app/components/painel-aulas/AppContext";
import { SidebarTurmas } from "@/app/components/painel-aulas/SidebarTurmas";

export default function PainelAulasPage() {
  return (
    <AdminGuard>
      <AppContextProvider>
        <main className="bg-gray-100 min-h-screen">
          <SidebarTurmas />
        </main>
      </AppContextProvider>
    </AdminGuard>
  );
}
