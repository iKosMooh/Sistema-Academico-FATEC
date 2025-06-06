"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "../painel-aulas/AppContext";

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

export function TurmaDashboard() {
  const { turma } = useAppContext();
  const [stats, setStats] = useState<TurmaStats | null>(null);
  const [proximasAulas, setProximasAulas] = useState<AulaProxima[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      if (!turma?.id) {
        setStats(null);
        setProximasAulas([]);
        return;
      }

      setLoading(true);
      try {
        // Buscar estatísticas da turma
        const [aulasRes, alunosRes, notasRes, presencasRes] = await Promise.all([
          // Aulas da turma
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
          // Alunos da turma
          fetch("/api/crud", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation: "get",
              table: "turmaAluno",
              where: { idTurma: Number(turma.id) },
            }),
          }),
          // Notas da turma
          fetch("/api/crud", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation: "get",
              table: "notas",
              where: { idTurma: Number(turma.id) },
            }),
          }),
          // Presenças da turma
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

          // Calcular alunos em risco (frequência < 75% ou média < 6)
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

          // Definir estatísticas da turma
          setStats({
            totalAlunos,
            totalAulas,
            aulasRealizadas,
            frequenciaMedia,
            mediaGeralNotas,
            alunosRisco
          });

          // Próximas aulas (futuras)
          const agora = new Date();
          const aulasProximas = aulas
            .filter((a: AulaAPI) => new Date(a.dataAula) > agora)
            .sort((a: AulaAPI, b: AulaAPI) => new Date(a.dataAula).getTime() - new Date(b.dataAula).getTime())
            .slice(0, 5);

          setProximasAulas(aulasProximas);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da turma:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <span className="ml-3">Carregando dados da turma...</span>
        </div>
      </div>
    );
  }

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