"use client";
import { useState } from "react";
import { AdminGuard } from "@/app/components/AdminGuard";
import { CursosDashboard } from "@/app/components/academico/CursosDashboard";
import { MateriasDashboard } from "@/app/components/academico/MateriasDashboard";
import { TurmasDashboard } from "@/app/components/academico/TurmasDashboard";

type ActiveSection = "cursos" | "materias" | "turmas";

export default function AcademicoDashboardPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("cursos");

  const menuItems = [
    { key: "cursos" as const, label: "Cursos", icon: "📚" },
    { key: "materias" as const, label: "Matérias", icon: "📖" },
    { key: "turmas" as const, label: "Turmas", icon: "👥" }
  ];

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto bg-white rounded shadow p-8 mt-8 min-h-[60vh] flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-white shadow-none px-0 py-0 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão Acadêmica</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerenciamento de cursos, matérias e turmas do sistema
            </p>
          </div>
        </header>
        <main className="flex-1 p-0">
          <div className="flex flex-wrap gap-2 mb-6">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  activeSection === item.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-white"
                }`}
                onClick={() => setActiveSection(item.key)}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow">
            {activeSection === "cursos" && <CursosDashboard />}
            {activeSection === "materias" && <MateriasDashboard />}
            {activeSection === "turmas" && <TurmasDashboard />}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
