"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface AtestadoDetalhado {
  idAtestado: number;
  dataInicio: string;
  dataFim: string;
  motivo: string;
  arquivoPath: string;
  dataEnvio: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Analisando';
  observacoes?: string;
  avaliadoPor?: string;
  dataAvaliacao?: string;
  justificativaRejeicao?: string;
  aluno: {
    nome: string;
    sobrenome: string;
    cpf: string;
  };
  aulasJustificadas: Array<{
    aula: {
      dataAula: string;
      horario: string;
      materia: { nomeMateria: string };
      turma: { nomeTurma: string };
    };
    aplicado: boolean;
  }>;
}

export function AtestadosProfessor() {
  const { data: session } = useSession();
  const [atestados, setAtestados] = useState<AtestadoDetalhado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [atestadoSelecionado, setAtestadoSelecionado] = useState<AtestadoDetalhado | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregarAtestados = useCallback(async () => {
    if (!session?.user?.cpf) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/atestados/professor?cpf=${session.user.cpf}`);
      const result = await response.json();

      if (result.success) {
        setAtestados(result.data);
      } else {
        console.error('Erro ao carregar atestados:', result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.cpf]);

  const filtrarAtestados = () => {
    if (!filtroStatus) return atestados;
    return atestados.filter(a => a.status === filtroStatus);
  };

  useEffect(() => {
    carregarAtestados();
  }, [carregarAtestados]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Rejeitado': return 'bg-red-100 text-red-800';
      case 'Analisando': return 'bg-yellow-100 text-yellow-800';
      case 'Pendente': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const avaliarAtestado = async (idAtestado: number, novoStatus: 'Aprovado' | 'Rejeitado', justificativa?: string) => {
    try {
      const response = await fetch('/api/atestados/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idAtestado,
          status: novoStatus,
          avaliadoPor: session?.user?.cpf,
          justificativaRejeicao: justificativa
        })
      });

      const result = await response.json();
      if (result.success) {
        await carregarAtestados();
        setModalAberto(false);
        setAtestadoSelecionado(null);
      } else {
        alert('Erro ao avaliar atestado: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao avaliar atestado');
    }
  };

  const atestadosFiltrados = filtrarAtestados();
  const estatisticas = {
    total: atestados.length,
    pendentes: atestados.filter(a => a.status === 'Pendente').length,
    aprovados: atestados.filter(a => a.status === 'Aprovado').length,
    rejeitados: atestados.filter(a => a.status === 'Rejeitado').length,
    analisando: atestados.filter(a => a.status === 'Analisando').length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🏥 Atestados Médicos</h2>
        <button
          onClick={carregarAtestados}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-blue-600">{estatisticas.pendentes}</p>
          <p className="text-sm text-gray-600">Pendentes</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-yellow-600">{estatisticas.analisando}</p>
          <p className="text-sm text-gray-600">Analisando</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-green-600">{estatisticas.aprovados}</p>
          <p className="text-sm text-gray-600">Aprovados</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-red-600">{estatisticas.rejeitados}</p>
          <p className="text-sm text-gray-600">Rejeitados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroStatus('')}
            className={`px-3 py-1 rounded-full text-sm ${
              filtroStatus === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Todos
          </button>
          {['Pendente', 'Analisando', 'Aprovado', 'Rejeitado'].map(status => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                filtroStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Atestados */}
      <div className="bg-white rounded-lg shadow-md">
        {atestadosFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filtroStatus ? `Nenhum atestado ${filtroStatus.toLowerCase()}` : 'Nenhum atestado encontrado'}
            </h3>
            <p className="text-gray-600">
              {filtroStatus ? 'Tente alterar o filtro.' : 'Não há atestados para revisar no momento.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {atestadosFiltrados.map((atestado) => (
              <div key={atestado.idAtestado} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {atestado.aluno.nome} {atestado.aluno.sobrenome}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(atestado.status)}`}>
                        {atestado.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Motivo:</strong> {atestado.motivo}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Período:</strong> {new Date(atestado.dataInicio).toLocaleDateString('pt-BR')} a{' '}
                      {new Date(atestado.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Enviado em:</strong> {new Date(atestado.dataEnvio).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Aulas afetadas:</strong> {atestado.aulasJustificadas.length} aula{atestado.aulasJustificadas.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setAtestadoSelecionado(atestado);
                        setModalAberto(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Ver Detalhes
                    </button>
                    {atestado.arquivoPath && (
                      <a
                        href={`/api/uploads?path=${encodeURIComponent(atestado.arquivoPath.replace('/uploads/', ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm text-center"
                      >
                        Ver Arquivo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {modalAberto && atestadoSelecionado && (
        <ModalDetalhesAtestado
          atestado={atestadoSelecionado}
          onClose={() => {
            setModalAberto(false);
            setAtestadoSelecionado(null);
          }}
          onAvaliar={avaliarAtestado}
        />
      )}
    </div>
  );
}

interface ModalDetalhesAtestadoProps {
  atestado: AtestadoDetalhado;
  onClose: () => void;
  onAvaliar: (idAtestado: number, status: 'Aprovado' | 'Rejeitado', justificativa?: string) => void;
}

function ModalDetalhesAtestado({ atestado, onClose, onAvaliar }: ModalDetalhesAtestadoProps) {
  const [justificativa, setJustificativa] = useState('');
  const [acaoSelecionada, setAcaoSelecionada] = useState<'Aprovado' | 'Rejeitado' | null>(null);

  const handleAvaliar = () => {
    if (!acaoSelecionada) return;
    
    if (acaoSelecionada === 'Rejeitado' && !justificativa.trim()) {
      alert('Justificativa é obrigatória para rejeitar um atestado.');
      return;
    }

    onAvaliar(atestado.idAtestado, acaoSelecionada, justificativa.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Detalhes do Atestado</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-3">Informações do Aluno</h4>
              <p><strong>Nome:</strong> {atestado.aluno.nome} {atestado.aluno.sobrenome}</p>
              <p><strong>CPF:</strong> {atestado.aluno.cpf}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Informações do Atestado</h4>
              <p><strong>Status:</strong> {atestado.status}</p>
              <p><strong>Motivo:</strong> {atestado.motivo}</p>
              <p><strong>Período:</strong> {new Date(atestado.dataInicio).toLocaleDateString('pt-BR')} a {new Date(atestado.dataFim).toLocaleDateString('pt-BR')}</p>
              <p><strong>Enviado em:</strong> {new Date(atestado.dataEnvio).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {atestado.observacoes && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Observações do Aluno</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{atestado.observacoes}</p>
            </div>
          )}

          <div className="mb-6">
            <h4 className="font-semibold mb-3">Aulas Afetadas ({atestado.aulasJustificadas.length})</h4>
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Data</th>
                    <th className="px-4 py-2 text-left">Horário</th>
                    <th className="px-4 py-2 text-left">Matéria</th>
                    <th className="px-4 py-2 text-left">Turma</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {atestado.aulasJustificadas.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{new Date(item.aula.dataAula).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-2">{item.aula.horario}</td>
                      <td className="px-4 py-2">{item.aula.materia.nomeMateria}</td>
                      <td className="px-4 py-2">{item.aula.turma.nomeTurma}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.aplicado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.aplicado ? 'Aplicado' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {atestado.status === 'Pendente' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-3">Avaliar Atestado</h4>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setAcaoSelecionada('Aprovado')}
                  className={`px-4 py-2 rounded-lg ${
                    acaoSelecionada === 'Aprovado'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✅ Aprovar
                </button>
                <button
                  onClick={() => setAcaoSelecionada('Rejeitado')}
                  className={`px-4 py-2 rounded-lg ${
                    acaoSelecionada === 'Rejeitado'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ❌ Rejeitar
                </button>
              </div>

              {acaoSelecionada === 'Rejeitado' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justificativa da Rejeição *
                  </label>
                  <textarea
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Explique o motivo da rejeição..."
                    required
                  />
                </div>
              )}

              <button
                onClick={handleAvaliar}
                disabled={!acaoSelecionada || (acaoSelecionada === 'Rejeitado' && !justificativa.trim())}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Confirmar Avaliação
              </button>
            </div>
          )}

          {atestado.status === 'Rejeitado' && atestado.justificativaRejeicao && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-red-800">Justificativa da Rejeição</h4>
              <p className="text-red-700">{atestado.justificativaRejeicao}</p>
              {atestado.dataAvaliacao && (
                <p className="text-sm text-red-600 mt-2">
                  Avaliado em: {new Date(atestado.dataAvaliacao).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            {atestado.arquivoPath && (
              <a
                href={`/api/uploads?path=${encodeURIComponent(atestado.arquivoPath.replace('/uploads/', ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📄 Ver Arquivo
              </a>
            )}
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
