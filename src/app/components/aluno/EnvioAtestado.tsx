"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Aula {
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
}

interface Turma {
  idTurma: number;
  nomeTurma: string;
  curso: {
    nomeCurso: string;
  };
}

interface AtestadoEnviado {
  idAtestado: number;
  dataInicio: string;
  dataFim: string;
  motivo: string;
  status: string;
  dataEnvio: string;
  aulasJustificadas: Array<{
    aula: {
      dataAula: string;
      materia: { nomeMateria: string };
    };
  }>;
}

export function EnvioAtestado() {
  const { data: session } = useSession();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelectedId, setTurmaSelectedId] = useState<number | null>(null);
  const [atestados, setAtestados] = useState<AtestadoEnviado[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estados do formulário
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [aulasAfetadas, setAulasAfetadas] = useState<number[]>([]);
  const [erro, setErro] = useState('');

  // Carregar aulas do aluno primeiro
  useEffect(() => {
    const carregarAulas = async () => {
      if (!session?.user?.cpf) return;

      try {
        const response = await fetch('/api/dashboard/aluno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf: session.user.cpf })
        });

        const result = await response.json();
        if (result.success && result.data.aulas) {
          setAulas(result.data.aulas);
        }
      } catch (error) {
        console.error('Erro ao carregar aulas:', error);
      }
    };

    carregarAulas();
  }, [session?.user?.cpf]);

  // Carregar turmas depois que as aulas estiverem carregadas
  useEffect(() => {
    const carregarTurmas = async () => {
      if (!session?.user?.cpf || aulas.length === 0) return;

      try {
        // Extrair turmas únicas das aulas já carregadas
        const turmasUnicas = new Map<number, Turma>();
        
        // Usar as aulas para obter as turmas diretamente
        for (const aula of aulas) {
          // Buscar detalhes da turma se ainda não temos
          if (!Array.from(turmasUnicas.keys()).some(id => 
            turmasUnicas.get(id)?.nomeTurma === aula.turma.nomeTurma
          )) {
            try {
              // Buscar turma pelo nome
              const turmaResponse = await fetch('/api/crud', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  operation: 'get',
                  table: 'turmas',
                  where: { nomeTurma: aula.turma.nomeTurma }
                })
              });

              const turmaResult = await turmaResponse.json();
              if (turmaResult.success && turmaResult.data.length > 0) {
                const turmaData = turmaResult.data[0];
                
                // Buscar curso
                const cursoResponse = await fetch('/api/crud', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    operation: 'get',
                    table: 'curso',
                    where: { idCurso: turmaData.idCurso }
                  })
                });

                const cursoResult = await cursoResponse.json();
                const nomeCurso = cursoResult.success && cursoResult.data.length > 0 
                  ? cursoResult.data[0].nomeCurso 
                  : 'Curso não encontrado';

                turmasUnicas.set(turmaData.idTurma, {
                  idTurma: turmaData.idTurma,
                  nomeTurma: turmaData.nomeTurma,
                  curso: { nomeCurso }
                });
              }
            } catch (error) {
              console.error('Erro ao buscar turma:', error);
            }
          }
        }
        
        setTurmas(Array.from(turmasUnicas.values()));
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      }
    };

    carregarTurmas();
  }, [session?.user?.cpf, aulas]);

  // Carregar atestados enviados
  useEffect(() => {
    const carregarAtestados = async () => {
      if (!session?.user?.cpf) return;

      try {
        // Buscar ID do aluno
        const alunoResponse = await fetch('/api/crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'get',
            table: 'alunos',
            where: { cpf: session.user.cpf }
          })
        });

        const alunoResult = await alunoResponse.json();
        if (alunoResult.success && alunoResult.data.length > 0) {
          const idAluno = alunoResult.data[0].idAluno;

          const response = await fetch(`/api/atestados?idAluno=${idAluno}`);
          const result = await response.json();
          
          if (result.success) {
            setAtestados(result.data);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar atestados:', error);
      }
    };

    carregarAtestados();
  }, [session?.user?.cpf]);

  // Filtrar aulas por período e turma selecionada
  const filtrarAulasPorPeriodo = () => {
    if (!dataInicio || !dataFim) return [];

    const inicio = new Date(dataInicio + 'T00:00:00');
    const fim = new Date(dataFim + 'T23:59:59');

    let aulasFiltradas = aulas.filter(aula => {
      const dataAula = new Date(aula.dataAula);
      return dataAula >= inicio && dataAula <= fim;
    });

    // Se uma turma específica foi selecionada, filtrar apenas aulas dessa turma
    if (turmaSelectedId) {
      const turmaSelecionada = turmas.find(t => t.idTurma === turmaSelectedId);
      if (turmaSelecionada) {
        aulasFiltradas = aulasFiltradas.filter(aula => 
          aula.turma.nomeTurma === turmaSelecionada.nomeTurma
        );
      }
    }

    return aulasFiltradas;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!arquivo) {
      setErro('Selecione um arquivo de atestado');
      return;
    }

    if (motivo.trim().length < 3) {
      setErro('Motivo deve ter pelo menos 3 caracteres');
      return;
    }

    if (aulasAfetadas.length === 0) {
      setErro('Selecione pelo menos uma aula');
      return;
    }

    if (!turmaSelectedId) {
      setErro('Selecione uma turma');
      return;
    }

    setLoading(true);

    try {
      // Buscar ID do aluno
      const alunoResponse = await fetch('/api/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'get',
          table: 'alunos',
          where: { cpf: session?.user?.cpf }
        })
      });

      const alunoResult = await alunoResponse.json();
      if (!alunoResult.success || alunoResult.data.length === 0) {
        throw new Error('Aluno não encontrado');
      }

      const idAluno = alunoResult.data[0].idAluno;

      // Verificar se o aluno está na turma selecionada
      const verificarTurmaResponse = await fetch('/api/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'get',
          table: 'turmaAluno',
          where: { 
            idAluno: idAluno,
            idTurma: turmaSelectedId 
          }
        })
      });

      const verificarTurmaResult = await verificarTurmaResponse.json();
      if (!verificarTurmaResult.success || verificarTurmaResult.data.length === 0) {
        setErro('Você não pertence à turma selecionada');
        setLoading(false);
        return;
      }

      // Verificar se todas as aulas selecionadas pertencem à turma
      const aulasParaVerificar = aulasAfetadas.map(async (idAula) => {
        const aulaResponse = await fetch('/api/crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'get',
            table: 'aula',
            where: { 
              idAula: idAula,
              idTurma: turmaSelectedId 
            }
          })
        });
        
        const aulaResult = await aulaResponse.json();
        return aulaResult.success && aulaResult.data.length > 0;
      });

      const verificacoesAulas = await Promise.all(aulasParaVerificar);
      if (verificacoesAulas.some(valido => !valido)) {
        setErro('Algumas aulas selecionadas não pertencem à turma escolhida');
        setLoading(false);
        return;
      }

      // Preparar FormData
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      formData.append('dados', JSON.stringify({
        idAluno,
        dataInicio,
        dataFim,
        motivo,
        aulasAfetadas,
        observacoes,
        idTurma: turmaSelectedId
      }));

      const response = await fetch('/api/atestados', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert('Atestado enviado com sucesso!');
        // Limpar formulário
        setDataInicio('');
        setDataFim('');
        setMotivo('');
        setObservacoes('');
        setArquivo(null);
        setAulasAfetadas([]);
        setTurmaSelectedId(null);
        setModalAberto(false);
        
        // Recarregar atestados
        window.location.reload();
      } else {
        setErro(result.error || 'Erro ao enviar atestado');
      }
    } catch (error) {
      console.error('Erro ao enviar atestado:', error);
      setErro('Erro ao enviar atestado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const tiposPermitidos = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!tiposPermitidos.includes(file.type)) {
        setErro('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErro('Arquivo muito grande. Máximo 5MB.');
        return;
      }

      setArquivo(file);
      setErro('');
    }
  };

  const toggleAula = (idAula: number) => {
    setAulasAfetadas(prev => 
      prev.includes(idAula) 
        ? prev.filter(id => id !== idAula)
        : [...prev, idAula]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Rejeitado': return 'bg-red-100 text-red-800';
      case 'Analisando': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const aulasDisponiveis = filtrarAulasPorPeriodo();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🏥 Atestados Médicos</h2>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Enviar Atestado
        </button>
      </div>

      {/* Lista de atestados enviados */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Atestados Enviados</h3>
        </div>
        
        {atestados.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum atestado enviado</h3>
            <p className="text-gray-600">Você ainda não enviou nenhum atestado médico.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {atestados.map((atestado) => (
              <div key={atestado.idAtestado} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{atestado.motivo}</h4>
                    <p className="text-sm text-gray-600">
                      Período: {new Date(atestado.dataInicio).toLocaleDateString('pt-BR')} a{' '}
                      {new Date(atestado.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Enviado em: {new Date(atestado.dataEnvio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(atestado.status)}`}>
                    {atestado.status}
                  </span>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Aulas afetadas: {atestado.aulasJustificadas.length}
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    {atestado.aulasJustificadas.slice(0, 3).map((aulaJustificada, index) => (
                      <span key={`atestado-${atestado.idAtestado}-aula-${index}-${aulaJustificada.aula.dataAula}`}>
                        {aulaJustificada.aula.materia.nomeMateria} ({new Date(aulaJustificada.aula.dataAula).toLocaleDateString('pt-BR')})
                        {index < Math.min(2, atestado.aulasJustificadas.length - 1) && ', '}
                      </span>
                    ))}
                    {atestado.aulasJustificadas.length > 3 && ` e mais ${atestado.aulasJustificadas.length - 3} aulas`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de envio de atestado */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Enviar Atestado Médico</h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {erro}
                </div>
              )}

              {/* Seletor de Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turma *
                </label>
                <select
                  value={turmaSelectedId || ''}
                  onChange={(e) => {
                    setTurmaSelectedId(e.target.value ? Number(e.target.value) : null);
                    setAulasAfetadas([]); // Limpar aulas selecionadas ao trocar turma
                  }}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma turma</option>
                  {turmas.map((turma) => (
                    <option key={`turma-select-${turma.idTurma}`} value={turma.idTurma}>
                      {turma.nomeTurma} - {turma.curso.nomeCurso}
                    </option>
                  ))}
                </select>
                {turmas.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Carregando turmas...
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => {
                      setDataInicio(e.target.value);
                      setAulasAfetadas([]); // Limpar aulas selecionadas ao trocar período
                    }}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => {
                      setDataFim(e.target.value);
                      setAulasAfetadas([]); // Limpar aulas selecionadas ao trocar período
                    }}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo do Atestado
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Consulta médica, gripe, cirurgia..."
                  required
                  minLength={1} // Validação HTML5
                  maxLength={255} // Validação HTML5
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                {motivo.length > 0 && motivo.length < 3 && (
                  <p className="text-xs text-red-500 mt-1">
                    Motivo deve ter pelo menos 3 caracteres
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo do Atestado (JPG, PNG ou PDF - máx. 5MB)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleArquivoChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Informações adicionais..."
                />
              </div>

              {dataInicio && dataFim && turmaSelectedId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aulas Afetadas no Período ({aulasDisponiveis.length} encontradas)
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {aulasDisponiveis.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        Nenhuma aula encontrada no período e turma selecionados
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {aulasDisponiveis.map((aula, aulaIndex) => (
                          <label key={`aula-form-${aula.idAula}-${aulaIndex}`} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={aulasAfetadas.includes(aula.idAula)}
                              onChange={() => toggleAula(aula.idAula)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium">{aula.materia.nomeMateria}</span>
                              <br />
                              <span className="text-xs text-gray-500">
                                {new Date(aula.dataAula).toLocaleDateString('pt-BR')} - {aula.horario} | {aula.turma.nomeTurma}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Atestado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
