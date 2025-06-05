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
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Lançamento de Notas</h2>
      
      <div className="mb-4">
        <label className="block font-medium mb-1">Disciplina</label>
        <select
          className="w-full border rounded px-2 py-1"
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

      {disciplinaSelecionada ? (
        <>
          <div className="mb-4">
            <label className="block font-medium mb-1">Tipo de Avaliação</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={tipoAvaliacao}
              onChange={(e) => setTipoAvaliacao(e.target.value)}
            >
              <option value="Prova">Prova</option>
              <option value="Trabalho">Trabalho</option>
              <option value="Seminário">Seminário</option>
              <option value="Participação">Participação</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Nome da Avaliação</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={nomeAvaliacao}
              onChange={(e) => setNomeAvaliacao(e.target.value)}
              placeholder="Ex: Prova 1, Trabalho Final..."
              required
            />
          </div>

          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="text-left p-2">Aluno</th>
                <th className="text-left p-2">Nota</th>
                <th className="text-left p-2">Observações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map(aluno => (
                <tr key={aluno.idAluno} className="border-b">
                  <td className="p-2">{`${aluno.nome} ${aluno.sobrenome}`}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="border rounded px-2 py-1 w-20"
                      value={notas[aluno.idAluno]?.valorNota || ''}
                      onChange={(e) => handleNotaChange(aluno.idAluno, e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-full"
                      value={notas[aluno.idAluno]?.observacoes || ''}
                      onChange={(e) => handleObservacoesChange(aluno.idAluno, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {message && (
            <div className={`p-2 mb-4 rounded ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Notas'}
          </button>

          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-md">
                <h3 className="text-lg font-bold mb-4">Atenção</h3>
                <p>Existem {notasEmBranco.length} alunos sem nota atribuída:</p>
                <ul className="mt-2 mb-4 text-sm text-gray-600">
                  {notasEmBranco.map(alunoId => (
                    <li key={alunoId}>{alunos.find(a => a.idAluno === alunoId)?.nome}</li>
                  ))}
                </ul>
                <p>Deseja continuar e atribuir nota 0?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded"
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
