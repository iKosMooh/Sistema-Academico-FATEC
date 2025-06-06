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
    { key: "cursos" as const, label: "Gerenciar Cursos", icon: "📚" },
    { key: "materias" as const, label: "Gerenciar Matérias", icon: "📖" },
    { key: "turmas" as const, label: "Gerenciar Turmas", icon: "👥" }
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestão Acadêmica
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gerenciamento de cursos, matérias e turmas do sistema
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeSection === item.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow">
            {activeSection === "cursos" && <CursosDashboard />}
            {activeSection === "materias" && <MateriasDashboard />}
            {activeSection === "turmas" && <TurmasDashboard />}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
