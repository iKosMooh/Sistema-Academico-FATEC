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
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Visualizar Notas da Turma</h2>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Matéria</label>
          <select
            className="w-full border rounded px-2 py-1"
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

        <div className="flex-1">
          <label className="block font-medium mb-1">Filtrar por</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as 'nome' | 'cpf')}
          >
            <option value="nome">Nome</option>
            <option value="cpf">CPF</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block font-medium mb-1">
            {tipoFiltro === 'nome' ? 'Nome do Aluno' : 'CPF do Aluno'}
          </label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder={tipoFiltro === 'nome' ? "Digite o nome..." : "Digite o CPF..."}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Nome do Aluno</th>
                <th className="text-left p-2">CPF</th>
                <th className="text-left p-2">Matéria</th>
                <th className="text-left p-2">Avaliação</th>
                <th className="text-right p-2">Nota</th>
                <th className="text-left p-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {notasFiltradas.map(nota => (
                <tr key={nota.idNota} className="border-b hover:bg-gray-50">
                  <td className="p-2">{`${nota.aluno.nome} ${nota.aluno.sobrenome}`}</td>
                  <td className="p-2">{nota.aluno.cpf}</td>
                  <td className="p-2">{nota.materia.nomeMateria}</td>
                  <td className="p-2">
                    <span className="font-medium">{nota.nome}</span>
                    <span className="text-gray-500 text-sm ml-1">({nota.tipoAvaliacao})</span>
                  </td>
                  <td className="p-2 text-right font-medium">{nota.valorNota.toFixed(1)}</td>
                  <td className="p-2 text-sm text-gray-600">
                    {new Date(nota.dataLancamento).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {notasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Nenhuma nota encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
