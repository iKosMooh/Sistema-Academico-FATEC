'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from './AppContext';

interface NotaAluno {
  idNota: number;
  nome: string;
  aluno: {
    idAluno: number;
    nome: string;
    sobrenome: string;
    cpf: string;
  };
  materia: {
    nomeMateria: string;
  };
  valorNota: number;
  tipoAvaliacao: string;
  observacoes?: string;
  dataLancamento: string;
}

export function VisualizarNotas() {
  const { turma } = useAppContext();
  const [notas, setNotas] = useState<NotaAluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'nome' | 'cpf'>('nome');
  const [materiaFiltro, setMateriaFiltro] = useState<string>('');

  useEffect(() => {
    if (!turma?.id) return;
    
    setLoading(true);
    fetch('/api/crud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'get',
        table: 'notas',
        relations: { 
          aluno: true,
          materia: true
        },
        where: { 
          idTurma: Number(turma.id)
        }
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        const notasFormatadas = result.data.map((nota: Omit<NotaAluno, 'valorNota'> & { valorNota: string }) => ({
          ...nota,
          valorNota: Number(nota.valorNota)
        }));
        setNotas(notasFormatadas);
      }
    })
    .finally(() => setLoading(false));
  }, [turma?.id]);

  const materias = Array.from(new Set(notas.map(nota => nota.materia.nomeMateria))).sort();

  const notasFiltradas = notas.filter(nota => {
    if (!filtro && !materiaFiltro) return true;
    
    const matchMateria = !materiaFiltro || nota.materia.nomeMateria === materiaFiltro;
    
    if (!filtro) return matchMateria;

    const matchFiltro = tipoFiltro === 'nome' 
      ? `${nota.aluno.nome} ${nota.aluno.sobrenome}`.toLowerCase().includes(filtro.toLowerCase())
      : nota.aluno.cpf.includes(filtro);

    return matchFiltro && matchMateria;
  });

  return (
    <div className="max-w-6xl mx-auto bg-blue-200 rounded shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Visualizar Notas da Turma</h2>
      
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-gray-200 rounded-xl p-6 shadow border border-gray-300">
        <div className="flex-1 min-w-[220px]">
          <label className="block font-medium mb-1 text-blue-700">Matéria</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={materiaFiltro}
            onChange={(e) => setMateriaFiltro(e.target.value)}
          >
            <option value="">Todas as matérias</option>
            {materias.map(materia => (
              <option key={materia} value={materia}>
                {materia}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block font-medium mb-1 text-blue-700">Filtrar por</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as 'nome' | 'cpf')}
          >
            <option value="nome">Nome</option>
            <option value="cpf">CPF</option>
          </select>
        </div>
        <div className="flex-1 min-w-[300px]">
          <label className="block font-medium mb-1 text-blue-700">
            {tipoFiltro === 'nome' ? 'Nome do Aluno' : 'CPF do Aluno'}
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder={tipoFiltro === 'nome' ? "Digite o nome..." : "Digite o CPF..."}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <div className="bg-gray-200 rounded-xl shadow-md border border-gray-300 overflow-hidden">
          <h3 className="font-semibold text-lg text-white bg-blue-500 py-3 px-4">
            Notas Lançadas
          </h3>
          <div className="overflow-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    Nome do Aluno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    Matéria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white-0 uppercase tracking-wider">
                    Nota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notasFiltradas.map(nota => (
                  <tr key={nota.idNota} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-200">
                      {`${nota.aluno.nome} ${nota.aluno.sobrenome}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 bg-gray-200">
                      {nota.aluno.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 bg-gray-200">
                      {nota.materia.nomeMateria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm bg-gray-200">
                      <span className="font-medium text-gray-800">{nota.nome}</span>
                      <span className="text-gray-500 text-sm ml-1">({nota.tipoAvaliacao})</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-blue-900 bg-gray-200">
                      {nota.valorNota.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 bg-gray-200">
                      {new Date(nota.dataLancamento).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {notasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-900 bg-gray-200">
                      Nenhuma nota encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
