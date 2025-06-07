'use client';
import { useState, useEffect } from 'react';
import ReactDOM from "react-dom";

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
  const [actionPortal, setActionPortal] = useState<null | { turma: Turma; anchor: HTMLElement }>(null);

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

  const handleActionClick = (turma: Turma, e: React.MouseEvent) => {
    setActionPortal({ turma, anchor: e.currentTarget as HTMLElement });
  };

  const closeActionPortal = () => setActionPortal(null);

  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => currentYear + i);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <div className="ml-3 text-gray-900">Carregando turmas...</div>
        </div>
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
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[60px]">
                  ID
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[160px]">
                  Nome da Turma
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[180px]">
                  Curso
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">
                  Ano Letivo
                </th>
                <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider min-w-[120px]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {turmas.map((turma) => (
                <tr key={turma.idTurma} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium bg-gray-200">
                    {turma.idTurma}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap bg-gray-200">
                    <div className="text-sm font-medium text-gray-900">
                      {turma.nomeTurma}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap bg-gray-200">
                    <div className="text-sm text-gray-900">
                      {turma.curso?.nomeCurso || `Curso ID: ${turma.idCurso}`}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap bg-gray-200">
                    <div className="text-sm text-gray-900">
                      {turma.anoLetivo}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium relative min-w-[140px] bg-gray-200">
                    <button
                      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                      onClick={e => handleActionClick(turma, e)}
                    >
                      Ações
                    </button>
                    {actionPortal && actionPortal.turma.idTurma === turma.idTurma &&
                      ReactDOM.createPortal(
                        <div
                          className="fixed z-50"
                          style={{
                            top: `${(actionPortal.anchor.getBoundingClientRect().bottom + window.scrollY) + 8}px`,
                            left: `${actionPortal.anchor.getBoundingClientRect().right - 160 + window.scrollX}px`,
                          }}
                        >
                          <div className="bg-white border border-gray-300 rounded shadow-lg p-4 flex flex-col gap-2 min-w-[150px]">
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                              onClick={() => {
                                handleEdit(turma);
                                closeActionPortal();
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                              onClick={() => {
                                handleDelete(turma.idTurma);
                                closeActionPortal();
                              }}
                            >
                              Excluir
                            </button>
                            <button
                              className="bg-gray-200 text-gray-900 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                              onClick={closeActionPortal}
                            >
                              Fechar
                            </button>
                          </div>
                        </div>,
                        document.body
                      )
                    }
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
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {editingTurma ? 'Editar Turma' : 'Nova Turma'}
            </h3>
            <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-xl shadow space-y-0 text-base">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block font-semibold text-blue-700 mb-1 text-base">
                    <span className="text-red-600">*</span> Nome da Turma
                  </label>
                  <input
                    type="text"
                    value={formData.nomeTurma}
                    onChange={(e) => setFormData({ ...formData, nomeTurma: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
                    placeholder="Ex: DSM 1A, ADS 2B..."
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-blue-700 mb-1 text-base">
                    <span className="text-red-600">*</span> Curso
                  </label>
                  <select
                    value={formData.idCurso}
                    onChange={(e) => setFormData({ ...formData, idCurso: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
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
                  <label className="block font-semibold text-blue-700 mb-1 text-base">
                    <span className="text-red-600">*</span> Ano Letivo
                  </label>
                  <select
                    value={formData.anoLetivo}
                    onChange={(e) => setFormData({ ...formData, anoLetivo: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
                    required
                  >
                    {anos.map((ano) => (
                      <option key={ano} value={ano.toString()}>
                        {ano}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && (
                <div className="text-red-600 my-2 text-base">{error}</div>
              )}
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
                  disabled={cursos.length === 0 || loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow text-lg"
                >
                  {editingTurma ? 'Atualizar' : loading ? 'Salvando...' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
