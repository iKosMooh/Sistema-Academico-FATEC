"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "../painel-aulas/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface TurmaStats {
  totalAlunos: number;
  totalAulas: number;
  aulasRealizadas: number;
  frequenciaMedia: number;
  mediaGeralNotas: number;
  alunosRisco: number;
}

interface AulaProxima {
  idAula: number;
  dataAula: string;
  horario: string;
  materia: {
    nomeMateria: string;
  };
}

interface FrequenciaAluno {
  presencas: number;
  total: number;
}

interface NotaAPI {
  idNota: number;
  idAluno: number;
  valorNota: number;
  nota?: number; // Para compatibilidade
}

interface AulaAPI {
  idAula: number;
  dataAula: string;
  horario: string;
  aulaConcluida: boolean;
  idTurma: number;
  materia: {
    nomeMateria: string;
  };
}

interface PresencaAPI {
  idPresenca: number;
  idAluno: number;
  presente: boolean;
  aula: {
    idTurma: number;
  } | null;
}

interface TurmaAlunoAPI {
  idTurma: number;
  idAluno: number;
  statusMatricula: string;
}

interface TurmaDashboardData {
  turma: {
    idTurma: number;
    nomeTurma: string;
    anoLetivo: number;
    curso: {
      nomeCurso: string;
      cargaHorariaTotal: number;
    };
  };
  estatisticas: {
    totalAlunos: number;
    totalAulas: number;
    aulasMinistradas: number;
    mediaGeralTurma: number;
    frequenciaMedia: number;
  };
  graficos: {
    mediaNotas: Array<{
      materia: string; // Mudança: agora é matéria ao invés de aluno
      media: number;
      totalNotas: number;
    }>;
    frequenciaPorMateria: Array<{
      materia: string;
      frequencia: number;
    }>;
  };
}

export function TurmaDashboard() {
  const { turma } = useAppContext();
  const [stats, setStats] = useState<TurmaStats | null>(null);
  const [proximasAulas, setProximasAulas] = useState<AulaProxima[]>([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<TurmaDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarTodosDados = async () => {
      if (!turma?.id) {
        setStats(null);
        setProximasAulas([]);
        setDashboardData(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Carregar dados do dashboard primeiro (API específica)
        const dashboardResponse = await fetch('/api/dashboard/turma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idTurma: Number(turma.id) })
        });

        const dashboardResult = await dashboardResponse.json();
        
        if (!dashboardResult.success) {
          throw new Error(dashboardResult.error || 'Erro ao carregar dados do dashboard');
        }

        setDashboardData(dashboardResult.data);

        // Carregar dados complementares em paralelo
        const [aulasRes, alunosRes, notasRes, presencasRes] = await Promise.all([
          fetch("/api/crud", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation: "get",
              table: "aula",
              where: { idTurma: Number(turma.id) },
              relations: { materia: true }
            }),
          }),
          fetch("/api/crud", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation: "get",
              table: "turmaAluno",
              where: { idTurma: Number(turma.id) },
            }),
          }),
          fetch("/api/crud", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation: "get",
              table: "notas",
              where: { idTurma: Number(turma.id) },
            }),
          }),
          fetch("/api/crud", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation: "get",
              table: "presencas",
              relations: { aula: true },
            }),
          }),
        ]);

        const [aulasData, alunosData, notasData, presencasData] = await Promise.all([
          aulasRes.json(),
          alunosRes.json(),
          notasRes.json(),
          presencasRes.json(),
        ]);

        // Processar dados para estatísticas complementares
        if (aulasData.success && alunosData.success) {
          const aulas = (aulasData.data || []) as AulaAPI[];
          const alunos = (alunosData.data || []) as TurmaAlunoAPI[];
          const notas = notasData.success ? (notasData.data || []) as NotaAPI[] : [];
          const presencas = presencasData.success ? (presencasData.data || []) as PresencaAPI[] : [];

          // Filtrar presenças da turma atual
          const presencasTurma = presencas.filter((p: PresencaAPI) => 
            p.aula && Number(p.aula.idTurma) === Number(turma.id)
          );

          // Calcular estatísticas
          const totalAlunos = alunos.length;
          const totalAulas = aulas.length;
          const aulasRealizadas = aulas.filter((a: AulaAPI) => a.aulaConcluida).length;
          
          // Calcular frequência média
          const totalPresencas = presencasTurma.filter((p: PresencaAPI) => p.presente).length;
          const totalPossiveisPresencas = presencasTurma.length;
          const frequenciaMedia = totalPossiveisPresencas > 0 
            ? (totalPresencas / totalPossiveisPresencas) * 100 
            : 0;

          // Alunos com risco (frequência < 75% ou média < 6)
          const frequenciaPorAluno = new Map<number, FrequenciaAluno>();
          presencasTurma.forEach((p: PresencaAPI) => {
            if (!frequenciaPorAluno.has(p.idAluno)) {
              frequenciaPorAluno.set(p.idAluno, { presencas: 0, total: 0 });
            }
            const freq = frequenciaPorAluno.get(p.idAluno)!;
            freq.total++;
            if (p.presente) freq.presencas++;
          });

          // Calcular média geral das notas
          const mediaGeralNotas = notas.length > 0 
            ? notas.reduce((sum: number, nota: NotaAPI) => {
                const valorNota = nota.valorNota || nota.nota || 0;
                return sum + Number(valorNota);
              }, 0) / notas.length 
            : 0;

          // Calcular alunos em risco
          let alunosRisco = 0;
          frequenciaPorAluno.forEach((freq: FrequenciaAluno, idAluno: number) => {
            const frequenciaAluno = freq.total > 0 ? (freq.presencas / freq.total) * 100 : 0;
            const notasAluno = notas.filter((n: NotaAPI) => n.idAluno === idAluno);
            const mediaAluno = notasAluno.length > 0 
              ? notasAluno.reduce((sum: number, nota: NotaAPI) => {
                  const valorNota = nota.valorNota || nota.nota || 0;
                  return sum + Number(valorNota);
                }, 0) / notasAluno.length 
              : 0;
            
            if (frequenciaAluno < 75 || mediaAluno < 6) {
              alunosRisco++;
            }
          });

          setStats({
            totalAlunos,
            totalAulas,
            aulasRealizadas,
            frequenciaMedia,
            mediaGeralNotas,
            alunosRisco
          });

          // Próximas aulas
          const agora = new Date();
          const aulasProximas = aulas
            .filter((a: AulaAPI) => new Date(a.dataAula) > agora)
            .sort((a: AulaAPI, b: AulaAPI) => new Date(a.dataAula).getTime() - new Date(b.dataAula).getTime())
            .slice(0, 5);

          setProximasAulas(aulasProximas);
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError(error instanceof Error ? error.message : 'Erro ao conectar com o servidor');
        setDashboardData(null);
        setStats(null);
        setProximasAulas([]);
      } finally {
        setLoading(false);
      }
    };

    carregarTodosDados();
  }, [turma?.id]);

  if (!turma) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione uma turma</h3>
          <p className="text-gray-600">Escolha uma turma no menu lateral para ver o dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {/* Header Loading */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>

          {/* Cards Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="animate-pulse">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráficos Loading */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-4xl mr-4">❌</div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar dados</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData && !loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum dado encontrado</h3>
          <p className="text-gray-600">
            Não foram encontrados dados para esta turma. Verifique se há alunos matriculados e aulas cadastradas.
          </p>
        </div>
      </div>
    );
  }

  const graficos = dashboardData?.graficos || { mediaNotas: [], frequenciaPorMateria: [] };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard - {turma.nome}
        </h1>
        <p className="text-gray-600">Visão geral da turma e estatísticas principais</p>
      </div>

      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAlunos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aulas Realizadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.aulasRealizadas}/{stats.totalAulas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Frequência Média</p>
                <p className={`text-2xl font-bold ${stats.frequenciaMedia >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.frequenciaMedia.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Média Geral</p>
                <p className={`text-2xl font-bold ${stats.mediaGeralNotas >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.mediaGeralNotas.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alunos em Risco</p>
                <p className={`text-2xl font-bold ${stats.alunosRisco === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.alunosRisco}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progresso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAulas > 0 ? Math.round((stats.aulasRealizadas / stats.totalAulas) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Próximas Aulas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Próximas Aulas</h2>
        {proximasAulas.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-600">Nenhuma aula futura programada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proximasAulas.map((aula) => (
              <div key={aula.idAula} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{aula.materia.nomeMateria}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(aula.dataAula).toLocaleDateString('pt-BR')} às {aula.horario}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {Math.ceil((new Date(aula.dataAula).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Média de Notas por Matéria */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">📈 Média de Notas por Matéria</h3>
          {graficos.mediaNotas.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graficos.mediaNotas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="materia" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value: number) => [
                    `${value.toFixed(1)}`,
                    'Média da Matéria'
                  ]}
                  labelFormatter={(label) => `Matéria: ${label}`}
                />
                <Bar 
                  dataKey="media" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Nenhuma nota lançada ainda</p>
            </div>
          )}
        </div>

        {/* Gráfico de Frequência por Matéria */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Frequência por Matéria</h3>
          {graficos.frequenciaPorMateria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={graficos.frequenciaPorMateria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="materia" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Frequência']}
                />
                <Line 
                  type="monotone" 
                  dataKey="frequencia" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Nenhuma aula ministrada ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Matérias com Baixo Rendimento */}
      {graficos.mediaNotas.filter(materia => materia.media < 6).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Matérias com Baixo Rendimento (&lt; 6.0)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {graficos.mediaNotas
              .filter(materia => materia.media < 6)
              .map((materia, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800">{materia.materia}</h4>
                  <p className="text-red-600">Média: {materia.media.toFixed(1)}</p>
                  <p className="text-sm text-red-500">{materia.totalNotas} nota{materia.totalNotas !== 1 ? 's' : ''}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Alertas e Avisos */}
      {stats && (
        <div className="space-y-4">
          {stats.alunosRisco > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Atenção: Alunos com Baixa Frequência
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {stats.alunosRisco} aluno{stats.alunosRisco !== 1 ? 's' : ''} 
                      {stats.alunosRisco !== 1 ? ' estão' : ' está'} com frequência abaixo de 75%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stats.mediaGeralNotas < 6 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">📊</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Média da Turma Abaixo do Esperado
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      A média geral da turma ({stats.mediaGeralNotas.toFixed(1)}) está abaixo de 6.0. 
                      Considere ações pedagógicas para melhorar o desempenho.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stats.alunosRisco === 0 && stats.mediaGeralNotas >= 6 && stats.frequenciaMedia >= 75 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400 text-xl">✅</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Turma com Bom Desempenho
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Parabéns! A turma está com boa frequência, média adequada e nenhum aluno em situação de risco.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}