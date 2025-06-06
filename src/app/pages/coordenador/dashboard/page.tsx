"use client";

import { CoordenadorGuard } from '@/app/components/guards';
import { usePermissions } from '@/app/hooks/usePermissions';

export default function CoordenadorDashboard() {
  const { userType, isAdmin } = usePermissions();

  return (
    <CoordenadorGuard>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard de Coordenação</h1>
          <p className="text-blue-100">
            Bem-vindo(a), {userType}! Aqui você pode gerenciar a coordenação acadêmica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card para Gestão de Turmas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestão de Turmas</h3>
            <p className="text-gray-600 mb-4">
              Gerencie turmas, matrículas e cronogramas acadêmicos
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Acessar Turmas
            </button>
          </div>

          {/* Card para Relatórios Acadêmicos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Relatórios</h3>
            <p className="text-gray-600 mb-4">
              Visualize relatórios de desempenho e frequência
            </p>
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Ver Relatórios
            </button>
          </div>

          {/* Card para Gestão de Professores (apenas para Admin) */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestão de Professores</h3>
              <p className="text-gray-600 mb-4">
                Cadastre e gerencie professores (Admin apenas)
              </p>
              <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                Gerenciar Professores
              </button>
            </div>
          )}
        </div>

        {/* Informações de Permissão */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Suas Permissões:</h4>
          <ul className="text-blue-700 space-y-1">
            <li>✓ Acesso ao dashboard de coordenação</li>
            <li>✓ Gestão de turmas e matrículas</li>
            <li>✓ Visualização de relatórios acadêmicos</li>
            {isAdmin && <li>✓ Gestão completa do sistema (Admin)</li>}
          </ul>
        </div>
      </div>
    </CoordenadorGuard>
  );
}
