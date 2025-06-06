"use client";

import { ProfessorGuard } from '@/app/components/guards';
import { usePermissions } from '@/app/hooks/usePermissions';

export default function ProfessorAulas() {
  const { userType, canAccessCoordenador } = usePermissions();

  return (
    <ProfessorGuard>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Painel do Professor</h1>
          <p className="text-blue-100">
            Gerencie suas aulas, frequência e avaliações
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card para Minhas Aulas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Minhas Aulas</h3>
            <p className="text-gray-600 mb-4">
              Visualize e gerencie suas aulas programadas
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Ver Aulas
            </button>
          </div>

          {/* Card para Registro de Presença */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Presença</h3>
            <p className="text-gray-600 mb-4">
              Registre a presença dos alunos
            </p>
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Registrar Presença
            </button>
          </div>

          {/* Card para Lançamento de Notas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notas</h3>
            <p className="text-gray-600 mb-4">
              Lance e gerencie as notas dos alunos
            </p>
            <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
              Lançar Notas
            </button>
          </div>

          {/* Funcionalidades extras para Coordenador */}
          {canAccessCoordenador && (
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Coordenação
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded ml-2">
                  Privilégio
                </span>
              </h3>
              <p className="text-gray-600 mb-4">
                Acesso a funcionalidades de coordenação
              </p>
              <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                Painel de Coordenação
              </button>
            </div>
          )}
        </div>

        {/* Status do usuário */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Status: {userType}</h4>
          <p className="text-green-700">
            Você tem acesso a todas as funcionalidades de ensino e gestão de aulas.
          </p>
        </div>
      </div>
    </ProfessorGuard>
  );
}
