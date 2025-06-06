'use client';
import { useState, useEffect } from 'react';

interface Curso {
  idCurso: number;
  nomeCurso: string;
}

interface Turma {
  [key: string]: unknown;
  idTurma: number;
  nomeTurma: string;
  anoLetivo: number;
  idCurso: number;
  curso?: {
    nomeCurso: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface TurmaFormData {
  nomeTurma: string;
  anoLetivo: string;
  idCurso: number;
}

export function TurmasDashboard() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TurmaFormData>({
    nomeTurma: '',
    anoLetivo: new Date().getFullYear().toString(),
    idCurso: 0
  });

  // Carregar turmas - seguindo padrão dos outros arquivos
  const fetchTurmas = async () => {
    try {
      const response = await fetch('/api/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'get',
          table: 'turmas', // Usando nome correto conforme schema
          relations: { curso: true }
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar turmas.');
      }

      setTurmas(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.');
      console.error('Erro ao carregar turmas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar cursos - seguindo padrão dos outros arquivos
  const fetchCursos = async () => {
    try {
      const response = await fetch('/api/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'get',
          table: 'curso' // Usando nome correto conforme schema
        })
      });

      const result = await response.json();

      if (result.success) {
        setCursos(result.data);
      } else {
        console.error('Erro ao carregar cursos:', result.error);
      }
    } catch (err) {
      console.error('Erro ao carregar cursos:', err);
    }
  };

  useEffect(() => {
    fetchTurmas();
    fetchCursos();
  }, []);

  // Criar/Atualizar turma - seguindo padrão exato dos outros arquivos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nomeTurma.trim() || !formData.anoLetivo || !formData.idCurso) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const operation = editingTurma ? 'update' : 'insert';
      
      const dataToSend: TurmaFormData & { idTurma?: number } = {
        nomeTurma: formData.nomeTurma.trim(),
        anoLetivo: formData.anoLetivo,
        idCurso: formData.idCurso
      };

      // Para update, incluir o ID
      if (editingTurma) {
        dataToSend.idTurma = editingTurma.idTurma;
      }

      const response = await fetch('/api/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          table: 'turmas', // Usando nome correto conforme schema
          primaryKey: editingTurma ? 'idTurma' : undefined,
          data: dataToSend
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao salvar turma');
      }

      alert(editingTurma ? 'Turma atualizada com sucesso!' : 'Turma criada com sucesso!');
      closeModal();
      await fetchTurmas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao salvar turma:', err);
    }
  };

  // Deletar turma - seguindo padrão dos outros arquivos
  const handleDelete = async (idTurma: number) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) {
      return;
    }

    try {
      const response = await fetch('/api/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'delete',
          table: 'turmas', // Usando nome correto conforme schema
          primaryKey: 'idTurma',
          data: { idTurma }
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao deletar');
      }

      alert('Turma excluída com sucesso!');
      await fetchTurmas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao deletar turma:', err);
    }
  };

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nomeTurma: turma.nomeTurma,
      anoLetivo: turma.anoLetivo.toString(),
      idCurso: turma.idCurso
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTurma(null);
    setError(null);
    setFormData({
      nomeTurma: '',
      anoLetivo: new Date().getFullYear().toString(),
      idCurso: 0
    });
  };

  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => currentYear + i);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando turmas...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Turmas</h2>
          <p className="text-gray-600">Gerencie as turmas do sistema</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nova Turma
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Lista de Turmas */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {turmas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma turma cadastrada
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome da Turma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ano Letivo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {turmas.map((turma) => (
                <tr key={turma.idTurma} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {turma.idTurma}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {turma.nomeTurma}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {turma.curso?.nomeCurso || `Curso ID: ${turma.idCurso}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {turma.anoLetivo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(turma)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(turma.idTurma)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingTurma ? 'Editar Turma' : 'Nova Turma'}
            </h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Turma *
                </label>
                <input
                  type="text"
                  value={formData.nomeTurma}
                  onChange={(e) => setFormData({ ...formData, nomeTurma: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: DSM 1A, ADS 2B..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso *
                </label>
                <select
                  value={formData.idCurso}
                  onChange={(e) => setFormData({ ...formData, idCurso: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={0}>Selecione um curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.idCurso} value={curso.idCurso}>
                      {curso.nomeCurso}
                    </option>
                  ))}
                </select>
                {cursos.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Nenhum curso encontrado. Cadastre cursos primeiro.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano Letivo *
                </label>
                <select
                  value={formData.anoLetivo}
                  onChange={(e) => setFormData({ ...formData, anoLetivo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {anos.map((ano) => (
                    <option key={ano} value={ano.toString()}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cursos.length === 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingTurma ? 'Atualizar' : 'Criar'} Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
