"use client";

import { useState } from "react";

interface FrequenciaItem {
  turma: {
    idTurma: number;
    nomeTurma: string;
  };
  materia: {
    nomeMateria: string;
  };
  totalAulas: number;
  presencas: number;
  taxaPresenca: number;
}

interface FrequenciaAlunoProps {
  frequencia: FrequenciaItem[];
}

export function FrequenciaAluno({ frequencia }: FrequenciaAlunoProps) {
  const [filtroTurma, setFiltroTurma] = useState('');

  // Obter lista única de turmas
  const turmas = Array.from(new Set(frequencia.map(f => f.turma.nomeTurma))).sort();

  // Filtrar frequência
  const frequenciaFiltrada = frequencia.filter(item => {
    return !filtroTurma || item.turma.nomeTurma === filtroTurma;
  });

  // Calcular estatísticas
  const frequenciaGeral = frequenciaFiltrada.length > 0
    ? frequenciaFiltrada.reduce((acc, item) => acc + item.taxaPresenca, 0) / frequenciaFiltrada.length
    : 0;

  const materiasComRisco = frequenciaFiltrada.filter(item => item.taxaPresenca < 75).length;
  const totalAulas = frequenciaFiltrada.reduce((acc, item) => acc + item.totalAulas, 0);
  const totalPresencas = frequenciaFiltrada.reduce((acc, item) => acc + item.presencas, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📅 Minha Frequência</h2>
        <p className="text-gray-600">{frequenciaFiltrada.length} matéria{frequenciaFiltrada.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className={`text-2xl font-bold ${frequenciaGeral >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {frequenciaGeral.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Frequência Geral</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalPresencas}</p>
            <p className="text-sm text-gray-600">Total de Presenças</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{totalAulas}</p>
            <p className="text-sm text-gray-600">Total de Aulas</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className={`text-2xl font-bold ${materiasComRisco === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {materiasComRisco}
            </p>
            <p className="text-sm text-gray-600">Matérias em Risco</p>
          </div>
        </div>
      </div>

      {/* Alerta de frequência baixa */}
      {materiasComRisco > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Atenção: Frequência Baixa
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Você tem {materiasComRisco} matéria{materiasComRisco !== 1 ? 's' : ''} com frequência abaixo de 75%. 
                  A frequência mínima exigida é de 75% para aprovação.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtro */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Turma
          </label>
          <select
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas as turmas</option>
            {turmas.map((turma) => (
              <option key={turma} value={turma}>{turma}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Frequência */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {frequenciaFiltrada.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum dado de frequência</h3>
            <p className="text-gray-600">
              {frequencia.length === 0 
                ? 'Ainda não há dados de frequência registrados.'
                : 'Nenhum dado encontrado com os filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {frequenciaFiltrada.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.materia.nomeMateria}</h3>
                    <p className="text-sm text-gray-600">{item.turma.nomeTurma}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.taxaPresenca >= 75 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.taxaPresenca.toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Presenças:</span>
                    <span className="font-medium">{item.presencas}/{item.totalAulas}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.taxaPresenca >= 75 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, item.taxaPresenca)}%` }}
                    ></div>
                  </div>

                  {item.taxaPresenca < 75 && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Frequência abaixo do mínimo exigido (75%)
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
