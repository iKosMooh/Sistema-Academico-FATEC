"use client";
import { useEffect, useState } from "react";
import { EditModal } from "@/app/components/ui/EditModal";
import ReactDOM from "react-dom";
import { Modal } from "@/app/components/painel-aulas/Modal";
import CadastrarMateriaModal from "@/app/pages/admin/materias/create/page";

interface Materia {
  [key: string]: unknown;
  idMateria: number;
  nomeMateria: string;
}

export function MateriasDashboard() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionPortal, setActionPortal] = useState<null | { materia: Materia; anchor: HTMLElement }>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchMaterias = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "materias",
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao carregar matérias.");

      setMaterias(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const handleDelete = async (idMateria: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta matéria?")) return;

    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "delete",
          table: "materias",
          primaryKey: "idMateria",
          data: { idMateria },
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao deletar.");

      await fetchMaterias();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const handleEdit = (materia: Materia) => {
    setSelectedMateria(materia);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedMateria: Materia) => {
    try {
      const dataToSend = {
        idMateria: updatedMateria.idMateria,
        nomeMateria: updatedMateria.nomeMateria,
      };

      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          table: "materias",
          primaryKey: "idMateria",
          data: dataToSend,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Erro ao atualizar.");

      await fetchMaterias();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMateria(null);
  };

  const filteredMaterias = materias.filter(materia =>
    materia.nomeMateria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActionClick = (materia: Materia, e: React.MouseEvent) => {
    setActionPortal({ materia, anchor: e.currentTarget as HTMLElement });
  };

  const closeActionPortal = () => setActionPortal(null);

  const handleCloseCreateModal = async () => {
    setModalOpen(false);
    await fetchMaterias();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <span className="ml-3 text-gray-900">Carregando matérias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded shadow mt-8 min-h-[60vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matérias</h2>
          <p className="text-gray-600">Gerencie as matérias disponíveis</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nova Matéria
        </button>
      </div>

      {/* Modal de criação */}
      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={handleCloseCreateModal} title="Cadastrar Matéria">
          <CadastrarMateriaModal />
        </Modal>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Pesquisar matérias..."
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{materias.length}</div>
          <div className="text-green-800">Total de Matérias</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {filteredMaterias.length}
          </div>
          <div className="text-blue-800">Resultados da Pesquisa</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Nome da Matéria
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMaterias.map((materia) => (
              <tr key={materia.idMateria} className="hover:bg-blue-50">
                <td className="py-4 px-2 text-gray-900 bg-gray-200">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {materia.idMateria}
                  </span>
                </td>
                <td className="py-4 px-2 text-gray-900 bg-gray-200">
                  <div className="font-medium">{materia.nomeMateria}</div>
                </td>
                <td className="py-4 px-2 text-gray-900 bg-gray-200 text-right relative min-w-[140px]">
                  <button
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                    onClick={e => handleActionClick(materia, e)}
                  >
                    Ações
                  </button>
                  {/* Mini portal para ações, posicionado próximo ao botão */}
                  {actionPortal && actionPortal.materia.idMateria === materia.idMateria &&
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
                              handleEdit(materia);
                              closeActionPortal();
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                            onClick={() => {
                              handleDelete(materia.idMateria);
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
            {filteredMaterias.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 px-2 text-center text-gray-500 bg-gray-200">
                  {searchTerm ? "Nenhuma matéria encontrada" : "Nenhuma matéria cadastrada"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedMateria && (
        <EditModal<Materia>
          isOpen={isModalOpen}
          onClose={closeModal}
          data={selectedMateria}
          onSave={handleSave}
          fields={[
            "idMateria",
            "nomeMateria",
          ]}
        />
      )}
    </div>
  );
}
