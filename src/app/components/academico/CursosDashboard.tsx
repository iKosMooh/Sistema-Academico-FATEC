"use client";
import { useEffect, useState } from "react";
import { EditModal } from "@/app/components/ui/EditModal";
import { Modal } from "@/app/components/painel-aulas/Modal";
import CadastrarCursoModal from "@/app/pages/admin/curso/create/page";
import ReactDOM from "react-dom";

interface Curso {
  [key: string]: unknown;
  idCurso: number;
  nomeCurso: string;
  cargaHorariaTotal: number;
  descricao: string | null;
  docsPath: string | null;
}

export function CursosDashboard() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionPortal, setActionPortal] = useState<null | { curso: Curso; anchor: HTMLElement }>(null);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "curso",
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao carregar cursos.");

      setCursos(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const handleDelete = async (idCurso: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este curso?")) return;

    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          table: "curso",
          primaryKey: "idCurso",
          data: { idCurso },
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao deletar.");

      await fetchCursos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const handleEdit = (curso: Curso) => {
    setSelectedCurso(curso);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedCurso: Curso) => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          table: "curso",
          primaryKey: "idCurso",
          data: updatedCurso,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao atualizar.");

      await fetchCursos();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCurso(null);
  };

  const handleCloseCreateModal = async () => {
    setModalOpen(false);
    await fetchCursos();
  };

  const filteredCursos = cursos.filter(curso =>
    curso.nomeCurso.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActionClick = (curso: Curso, e: React.MouseEvent) => {
    setActionPortal({ curso, anchor: e.currentTarget as HTMLElement });
  };

  const closeActionPortal = () => setActionPortal(null);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <span className="ml-3 text-gray-900">Carregando cursos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cursos</h2>
          <p className="text-gray-600">Gerencie os cursos disponíveis</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Novo Curso
        </button>
      </div>

      {/* Modal de criação */}
      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={handleCloseCreateModal} title="Cadastrar Curso">
          {/* Remova o onSuccess, pois o componente não aceita essa prop */}
          <CadastrarCursoModal />
        </Modal>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Pesquisar cursos..."
          className="w-full max-w-md px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{cursos.length}</div>
          <div className="text-blue-800">Total de Cursos</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(cursos.reduce((acc, curso) => acc + curso.cargaHorariaTotal, 0) / cursos.length) || 0}h
          </div>
          <div className="text-green-800">Carga Horária Média</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {cursos.filter(c => c.descricao).length}
          </div>
          <div className="text-purple-800">Com Descrição</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] bg-white border border-gray-200">
          <thead className="bg-gray-50 w-full min-w-[800px] h-20">
            <tr>
              <th className="px-4 py-6 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[180px]">
                Curso
              </th>
              <th className="px-4 py-6 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">
                Carga Horária
              </th>
              <th className="px-4 py-6 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[250px]">
                Descrição
              </th>
              <th className="px-4 py-6 text-right text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 w-full min-w-[800px]">
            {filteredCursos.map((curso) => (
              <tr key={curso.idCurso} className="hover:bg-gray-50 h-20">
                <td className="px-6 py-6 bg-gray-100 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{curso.nomeCurso}</div>
                  <div className="text-sm text-gray-500">ID: {curso.idCurso}</div>
                </td>
                <td className="px-6 py-6 bg-gray-100 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {curso.cargaHorariaTotal}h
                  </span>
                </td>
                <td className="px-6 py-6 bg-gray-100">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {curso.descricao || "-"}
                  </div>
                </td>
                <td className="px-6 py-6 bg-gray-100 text-right relative min-w-[140px]">
                  <button
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                    onClick={e => handleActionClick(curso, e)}
                  >
                    Ações
                  </button>
                  {/* Mini portal para ações, posicionado próximo ao botão */}
                  {actionPortal && actionPortal.curso.idCurso === curso.idCurso &&
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
                              handleEdit(curso);
                              closeActionPortal();
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                            onClick={() => {
                              handleDelete(curso.idCurso);
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
            {filteredCursos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? "Nenhum curso encontrado" : "Nenhum curso cadastrado"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedCurso && (
        <EditModal<Curso>
          isOpen={isModalOpen}
          onClose={closeModal}
          data={selectedCurso}
          onSave={handleSave}
          fields={[
            "idCurso",
            "nomeCurso",
            "cargaHorariaTotal",
            "descricao",
            "docsPath",
          ]}
        />
      )}
    </div>
  );
}
