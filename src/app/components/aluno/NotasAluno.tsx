"use client";

import { useState } from "react";

interface Nota {
  idNota: number;
  nome: string;
  valorNota: number;
  tipoAvaliacao: string;
  dataLancamento: string;
  materia: {
    nomeMateria: string;
  };
  turma: {
    nomeTurma: string;
  };
}

interface NotasAlunoProps {
  notas: Nota[];
}

export function NotasAluno({ notas }: NotasAlunoProps) {
  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');

  // Obter listas únicas para filtros
  const materias = Array.from(new Set(notas.map(nota => nota.materia.nomeMateria))).sort();
  const turmas = Array.from(new Set(notas.map(nota => nota.turma.nomeTurma))).sort();

  // Filtrar notas
  const notasFiltradas = notas.filter(nota => {
    const matchMateria = !filtroMateria || nota.materia.nomeMateria === filtroMateria;
    const matchTurma = !filtroTurma || nota.turma.nomeTurma === filtroTurma;
    return matchMateria && matchTurma;
  });

  // Calcular estatísticas
  const mediaGeral = notasFiltradas.length > 0 
    ? notasFiltradas.reduce((acc, nota) => acc + nota.valorNota, 0) / notasFiltradas.length 
    : 0;

  const notasAprovacao = notasFiltradas.filter(nota => nota.valorNota >= 6).length;
  const notasReprovacao = notasFiltradas.filter(nota => nota.valorNota < 6).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📝 Minhas Notas</h2>
        <p className="text-gray-600">{notasFiltradas.length} nota{notasFiltradas.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{mediaGeral.toFixed(1)}</p>
            <p className="text-sm text-gray-600">Média Geral</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{notasAprovacao}</p>
            <p className="text-sm text-gray-600">Notas ≥ 6.0</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{notasReprovacao}</p>
            <p className="text-sm text-gray-600">Notas &lt; 6.0</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{notasFiltradas.length}</p>
            <p className="text-sm text-gray-600">Total de Notas</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Matéria
            </label>
            <select
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as matérias</option>
              {materias.map((materia) => (
                <option key={materia} value={materia}>{materia}</option>
              ))}
            </select>
          </div>
          <div>
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
      </div>

      {/* Lista de Notas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {notasFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma nota encontrada</h3>
            <p className="text-gray-600">
              {notas.length === 0 
                ? 'Ainda não há notas lançadas para você.'
                : 'Nenhuma nota encontrada com os filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matéria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notasFiltradas
                  .sort((a, b) => new Date(b.dataLancamento).getTime() - new Date(a.dataLancamento).getTime())
                  .map((nota) => (
                  <tr key={nota.idNota} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{nota.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{nota.materia.nomeMateria}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{nota.turma.nomeTurma}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        nota.valorNota >= 6 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {nota.valorNota.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{nota.tipoAvaliacao}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(nota.dataLancamento).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
