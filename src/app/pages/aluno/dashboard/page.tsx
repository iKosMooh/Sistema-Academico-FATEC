"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarioAulas } from "@/app/components/aluno/CalendarioAulas";
import { TurmasAluno } from "@/app/components/aluno/TurmasAluno";
import { NotasAluno } from "@/app/components/aluno/NotasAluno";
import { FrequenciaAluno } from "@/app/components/aluno/FrequenciaAluno";
import { EnvioAtestado } from "@/app/components/aluno/EnvioAtestado";
import { AlunoGuard } from "@/app/components/guards/AlunoGuard";

interface DashboardData {
  aluno: {
    idAluno: number;
    nome: string;
    sobrenome: string;
    cpf: string;
  };
  turmas: Array<{
    idTurma: number;
    nomeTurma: string;
    anoLetivo: number;
    curso: {
      nomeCurso: string;
      cargaHorariaTotal: number;
    };
    statusMatricula: string;
  }>;
  notas: Array<{
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
  }>;
  frequencia: Array<{
    turma: {
      idTurma: number;
      nomeTurma: string;
    };
    materia: {
      nomeMateria: string;
    };
    totalAulas: number;
    aulasMinistradas: number;
    presencas: number;
    ausencias: number;
    taxaPresenca: number;
  }>;
  aulas: Array<{
    idAula: number;
    dataAula: string;
    horario: string;
    materia: {
      nomeMateria: string;
    };
    turma: {
      nomeTurma: string;
    };
    aulaConcluida: boolean;
    conteudoMinistrado?: string;
    observacoesAula?: string;
  }>;
}

export default function AlunoDashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'turmas' | 'notas' | 'frequencia' | 'calendario' | 'atestados'>('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.cpf) return;

      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/aluno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf: session.user.cpf })
        });

        const result = await response.json();
        
        if (result.success) {
          setDashboardData(result.data);
        } else {
          setError(result.error || 'Erro ao carregar dados');
        }
      } catch (error) {
        setError('Erro ao conectar com o servidor');
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.cpf]);

  if (loading) {
    return (
      <AlunoGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando seu dashboard...</p>
          </div>
        </div>
      </AlunoGuard>
    );
  }

  if (error) {
    return (
      <AlunoGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Erro ao carregar dashboard</p>
            <p>{error}</p>
          </div>
        </div>
      </AlunoGuard>
    );
  }

  if (!dashboardData) {
    return (
      <AlunoGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Nenhum dado encontrado</p>
        </div>
      </AlunoGuard>
    );
  }

  const { aluno, turmas, notas, frequencia, aulas } = dashboardData;

  // Calcular estatísticas gerais
  const mediaGeral = notas.length > 0 
    ? notas.reduce((acc, nota) => acc + nota.valorNota, 0) / notas.length 
    : 0;

  const frequenciaGeral = frequencia.length > 0
    ? frequencia.reduce((acc, freq) => acc + freq.taxaPresenca, 0) / frequencia.length
    : 0;

  const turmasAtivas = turmas.filter(t => t.statusMatricula === 'Ativa').length;

  return (
    <AlunoGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Portal do Aluno
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Bem-vindo, {aluno.nome} {aluno.sobrenome}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">CPF: {aluno.cpf}</p>
                <p className="text-sm text-gray-500">
                  {turmasAtivas} turma{turmasAtivas !== 1 ? 's' : ''} ativa{turmasAtivas !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: '📊 Visão Geral', icon: '📊' },
                { key: 'turmas', label: '🎓 Minhas Turmas', icon: '🎓' },
                { key: 'notas', label: '📝 Notas', icon: '📝' },
                { key: 'frequencia', label: '📅 Frequência', icon: '📅' },
                { key: 'calendario', label: '🗓️ Calendário', icon: '🗓️' },
                { key: 'atestados', label: '🏥 Atestados', icon: '🏥' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Turmas Ativas</p>
                      <p className="text-2xl font-bold text-gray-900">{turmasAtivas}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Média Geral</p>
                      <p className={`text-2xl font-bold ${mediaGeral >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                        {mediaGeral.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Frequência</p>
                      <p className={`text-2xl font-bold ${frequenciaGeral >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                        {frequenciaGeral.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {frequencia.length > 0 && 
                          `${frequencia.reduce((acc, freq) => acc + freq.presencas, 0)} de ${
                            frequencia.reduce((acc, freq) => acc + freq.aulasMinistradas, 0)
                          } aulas ministradas`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total de Notas</p>
                      <p className="text-2xl font-bold text-gray-900">{notas.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo das Turmas */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Resumo das Turmas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {turmas.map((turma) => (
                    <div key={turma.idTurma} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-800">{turma.nomeTurma}</h3>
                      <p className="text-sm text-gray-600">{turma.curso.nomeCurso}</p>
                      <p className="text-xs text-gray-500">Ano: {turma.anoLetivo}</p>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          turma.statusMatricula === 'Ativa' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {turma.statusMatricula}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'turmas' && (
            <TurmasAluno turmas={turmas} />
          )}

          {activeTab === 'notas' && (
            <NotasAluno notas={notas} />
          )}

          {activeTab === 'frequencia' && (
            <FrequenciaAluno frequencia={frequencia} />
          )}

          {activeTab === 'calendario' && (
            <CalendarioAulas aulas={aulas} />
          )}

          {activeTab === 'atestados' && (
            <EnvioAtestado />
          )}
        </div>
      </div>
    </AlunoGuard>
  );
}
