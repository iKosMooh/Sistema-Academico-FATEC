"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from './AppContext';

interface AlunoTurma {
  aluno: {
    idAluno: number;
    nome: string;
    sobrenome: string;
  };
}

interface Aluno {
  idAluno: number;
  nome: string;
  sobrenome: string;
}

interface Disciplina {
  idMateria: number;
  nomeMateria: string;
}

interface Nota {
  idNota?: number;
  valorNota: number;
  tipoAvaliacao: string;
  observacoes?: string;
}

interface Turma {
  id: string;
}

export function LancamentoNotas() {
  const { turma, disciplinas } = useAppContext() as { turma: Turma | null, disciplinas: Disciplina[] };
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<number | null>(null);
  const [notas, setNotas] = useState<Record<number, Nota>>({});
  const [tipoAvaliacao, setTipoAvaliacao] = useState('Prova');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [nomeAvaliacao, setNomeAvaliacao] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notasEmBranco, setNotasEmBranco] = useState<number[]>([]);

  // Buscar alunos da turma
  useEffect(() => {
    if (!turma?.id) return;

    // Segunda chamada: buscar alunos da turma
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "turmaAluno",
        relations: { aluno: true },
        data: { idTurma: Number(turma.id) }
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.success && result.data) {
        setAlunos(result.data
          .filter((ta: AlunoTurma) => ta.aluno) // Garante que existe aluno
          .map((ta: AlunoTurma) => ({
            idAluno: ta.aluno.idAluno,
            nome: ta.aluno.nome,
            sobrenome: ta.aluno.sobrenome
          }))
        );
      }
    })
    .catch(error => {
      console.error('Erro ao carregar alunos:', error);
      setMessage('Erro ao carregar alunos');
    });

  }, [turma?.id]); // Remove disciplinaSelecionada das dependências

  const handleNotaChange = (idAluno: number, valor: string) => {
    setNotas(prev => ({
      ...prev,
      [idAluno]: {
        ...prev[idAluno],
        valorNota: Number(valor)
      }
    }));
  };

  const handleObservacoesChange = (idAluno: number, obs: string) => {
    setNotas(prev => ({
      ...prev,
      [idAluno]: {
        ...prev[idAluno],
        observacoes: obs
      }
    }));
  };

  const handleSubmit = async () => {
    if (!turma?.id || !disciplinaSelecionada) {
      setMessage('Selecione uma disciplina');
      return;
    }

    if (!nomeAvaliacao) {
      setMessage('Digite um nome para a avaliação');
      return;
    }

    // Verificar notas em branco
    const alunosNotasBranco = alunos
      .filter(aluno => !notas[aluno.idAluno]?.valorNota)
      .map(aluno => aluno.idAluno);

    if (alunosNotasBranco.length > 0) {
      setNotasEmBranco(alunosNotasBranco);
      setShowConfirmation(true);
      return;
    }

    await salvarNotas();
  };

  const salvarNotas = async () => {
    try {
      setLoading(true);
      const promises = Object.entries(notas).map(([idAluno, nota]) => 
        fetch("/api/notas/lancar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idAluno: Number(idAluno),
            idTurma: Number(turma!.id),
            idMateria: disciplinaSelecionada,
            nome: nomeAvaliacao,
            valorNota: nota.valorNota || 0,
            tipoAvaliacao,
            observacoes: nota.observacoes
          })
        }).then(async res => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Erro ao salvar nota');
          }
          return data;
        })
      );

      await Promise.all(promises);
      setMessage('Notas lançadas com sucesso!');
      setNotas({});
      setNomeAvaliacao('');
    } catch (error: Error | unknown) {
      console.error('Erro ao lançar notas:', error);
      setMessage(`Erro ao lançar notas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-blue-200 rounded shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Lançamento de Notas</h2>
      
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-gray-200 rounded-xl p-6 shadow border border-gray-300">
        <div className="flex-1 min-w-[220px]">
          <label className="block font-medium mb-1 text-blue-700">Disciplina</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={disciplinaSelecionada || ''}
            onChange={(e) => setDisciplinaSelecionada(Number(e.target.value))}
          >
            <option value="">Selecione uma disciplina</option>
            {disciplinas.map(disc => (
              <option key={disc.idMateria} value={disc.idMateria}>
                {disc.nomeMateria}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block font-medium mb-1 text-blue-700">Tipo de Avaliação</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={tipoAvaliacao}
            onChange={(e) => setTipoAvaliacao(e.target.value)}
          >
            <option value="Prova">Prova</option>
            <option value="Trabalho">Trabalho</option>
            <option value="Seminário">Seminário</option>
            <option value="Participação">Participação</option>
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block font-medium mb-1 text-blue-700">Nome da Avaliação</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            value={nomeAvaliacao}
            onChange={(e) => setNomeAvaliacao(e.target.value)}
            placeholder="Ex: Prova 1, Trabalho Final..."
            required
          />
        </div>
      </div>

      {disciplinaSelecionada ? (
        <>
          <div className="bg-gray-200 rounded-xl shadow-md border border-gray-300 overflow-hidden">
            <h3 className="font-semibold text-lg text-white bg-blue-500 py-3 px-4">
              Alunos da Turma
            </h3>
            <div className="overflow-auto max-h-[500px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                      Nota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white-0 uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alunos.map(aluno => (
                    <tr key={aluno.idAluno} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-200">
                        {`${aluno.nome} ${aluno.sobrenome}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm bg-gray-200">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          className="border border-gray-300 rounded-lg px-3 py-2 w-24 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          value={notas[aluno.idAluno]?.valorNota || ''}
                          onChange={(e) => handleNotaChange(aluno.idAluno, e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm bg-gray-200">
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          value={notas[aluno.idAluno]?.observacoes || ''}
                          onChange={(e) => handleObservacoesChange(aluno.idAluno, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                  {alunos.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-900 bg-gray-200">
                        Nenhum aluno encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {message && (
            <div className={`p-2 mb-4 rounded ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all font-semibold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Notas'}
            </button>
          </div>

          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white text-gray-800 p-6 rounded-lg max-w-md">
                <h3 className="text-lg text-gray-800 font-bold mb-4">Atenção</h3>
                <p>Existem {notasEmBranco.length} alunos sem nota atribuída:</p>
                <ul className="mt-2 mb-4 text-sm text-gray-600">
                  {notasEmBranco.map(alunoId => (
                    <li key={alunoId}>{alunos.find(a => a.idAluno === alunoId)?.nome}</li>
                  ))}
                </ul>
                <p>Deseja continuar e atribuir nota 0?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => {
                      setShowConfirmation(false);
                      salvarNotas();
                    }}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          Selecione uma disciplina para lançar notas.
        </div>
      )}
    </div>
  );
}
