'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '../painel-aulas/AppContext';
import { KPICard } from './components/KPICard';
import { PresencaChart } from './components/PresencaChart';
import { NotasDistribuicao } from './components/NotasDistribuicao';
import { NotasLancadas } from './components/NotasLancadas';

interface DashboardData {
  alunos: {
    total: number;
    ativos: number;
    porFaltas: { nome: string; faltas: number }[];
  };
  notas: {
    mediaGeral: number;
    distribuicao: { faixa: string; quantidade: number }[];
    aprovados: number;
  };
  frequencia: {
    taxaPresenca: number;
    totalAulas: number;
    aulasRealizadas: number;
  };
  notasLancadas: Array<{
    idNota: number;
    nome: string;
    aluno: { nome: string; sobrenome: string };
    valorNota: number;
    dataLancamento: string;
    tipoAvaliacao: string;
  }>;
}

export function TurmaDashboard() {
  const { turma } = useAppContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!turma?.id) return;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/turma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idTurma: turma?.id })
        });

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [turma?.id]);

  if (!turma) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          Selecione uma turma para visualizar o dashboard.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <span className="ml-3">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 space-y-6 ">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard da Turma {turma.nome}</h2>
        <p className="text-gray-800">Análise de desempenho e frequência</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total de Alunos"
          value={data.alunos.total}
          description={`${data.alunos.ativos} alunos ativos`}
        />
        <KPICard
          title="Média Geral"
          value={data.notas.mediaGeral.toFixed(1)}
          description={`${data.notas.aprovados} aprovados`}
        />
        <KPICard
          title="Taxa de Presença"
          value={`${(data.frequencia.taxaPresenca * 100).toFixed(1)}%`}
          description={`${data.frequencia.aulasRealizadas}/${data.frequencia.totalAulas} aulas`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NotasDistribuicao data={data.notas.distribuicao} />
        <PresencaChart frequencia={data.frequencia} />
      </div>

      <NotasLancadas notas={data.notasLancadas} />
    </div>
  );
}