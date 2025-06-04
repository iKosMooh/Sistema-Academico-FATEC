"use client";
import { HeaderAdmin } from "@/app/components/painel-aulas/HeaderAdmin";
import { SidebarTurmas } from "@/app/components/painel-aulas/SidebarTurmas";
import { TabsContainer } from "@/app/components/painel-aulas/TabsContainer";
import { AppProvider } from "@/app/components/painel-aulas/AppContext";
import { AdminGuard } from "@/app/components/AdminGuard";

export default function PainelAulasPage() {
  return (
    <AdminGuard>
      <AppProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <HeaderAdmin />
          <div className="flex flex-1">
            <SidebarTurmas />
            <main className="flex-1 p-4 overflow-x-auto">
              {/* 
                Reformulação para feriados/canceladas:
                - Feriados/dias não letivos devem ser tratados como eventos separados no calendário, 
                  não como aulas com status "cancelada".
                - O componente TabsContainer (ou o calendário) deve:
                  1. Buscar a lista de feriados/dias não letivos da tabela DiasNaoLetivos.
                  2. Renderizar esses dias como "Feriado" ou "Dia não letivo" (ex: cor cinza ou aviso especial).
                  3. Aulas com aulaConcluida === true são "concluídas".
                  4. Aulas com presencasAplicadas === false e não feriado são "pendentes".
                  5. Não use status "cancelada" para feriados, apenas para aulas realmente canceladas.
                - Ajuste o componente de calendário para considerar DiasNaoLetivos como overlay/decoração e não como status de aula.
              */}
              <TabsContainer />
            </main>
          </div>
        </div>
      </AppProvider>
    </AdminGuard>
  );
}
