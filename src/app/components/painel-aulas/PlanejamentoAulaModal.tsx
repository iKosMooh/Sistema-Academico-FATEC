'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Modal } from './Modal';

interface ArquivoAnexado {
  idDocAula: number;
  src: string;
  nomeArquivo: string;
  tipoArquivo: string;
}

interface ApiDocAula {
  idDocAula: number;
  src: string;
}

interface PlanejamentoAulaData {
  idAula: number;
  planejamento: string;
  metodologia: string;
}

interface PlanejamentoAulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  aula: {
    idAula: number;
    dataAula: string;
    horario: string;
    materia: { nomeMateria: string };
    planejamento?: string;
    metodologia?: string;
  } | null;
  onSave: (dados: PlanejamentoAulaData) => void;
}

export function PlanejamentoAulaModal({ isOpen, onClose, aula, onSave }: PlanejamentoAulaModalProps) {
  const [planejamento, setPlanejamento] = useState('');
  const [metodologia, setMetodologia] = useState('');
  const [arquivos, setArquivos] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [arquivosExistentes, setArquivosExistentes] = useState<ArquivoAnexado[]>([]);
  const [loadingArquivos, setLoadingArquivos] = useState(false);
  const [arquivoVisualizando, setArquivoVisualizando] = useState<ArquivoAnexado | null>(null);

  useEffect(() => {
    if (aula) {
      setPlanejamento(aula.planejamento || '');
      setMetodologia(aula.metodologia || '');
      
      // Carregar arquivos existentes se houver planejamento
      if (aula.planejamento) {
        loadArquivosExistentes(aula.idAula);
      } else {
        setArquivosExistentes([]);
      }
    }
  }, [aula]);

  const loadArquivosExistentes = async (idAula: number) => {
    setLoadingArquivos(true);
    try {
      const response = await fetch(`/api/get-arquivos-aula?idAula=${idAula}`);
      const result = await response.json();
      
      if (result.success && result.data.docsAula) {
        const arquivosPlanejamento = result.data.docsAula
          .filter((doc: ApiDocAula) => doc.src.includes('/planejamento/'))
          .map((doc: ApiDocAula) => {
            const nomeArquivo = doc.src.split('/').pop() || 'Arquivo';
            const extensao = nomeArquivo.split('.').pop()?.toLowerCase() || '';
            return {
              idDocAula: doc.idDocAula,
              src: doc.src,
              nomeArquivo,
              tipoArquivo: extensao
            };
          });
        
        setArquivosExistentes(arquivosPlanejamento);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos existentes:', error);
    } finally {
      setLoadingArquivos(false);
    }
  };

  const handleDeleteArquivo = async (idDocAula: number) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;
    
    try {
      const response = await fetch('/api/delete-arquivo-aula', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idDocAula })
      });
      
      if (response.ok) {
        setArquivosExistentes(prev => prev.filter(arq => arq.idDocAula !== idDocAula));
        alert('Arquivo excluído com sucesso!');
      } else {
        alert('Erro ao excluir arquivo');
      }
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      alert('Erro ao excluir arquivo');
    }
  };

  const handleVisualizarArquivo = (arquivo: ArquivoAnexado) => {
    setArquivoVisualizando(arquivo);
  };

  const handleDownloadArquivo = (src: string, nomeArquivo: string) => {
    const link = document.createElement('a');
    link.href = `/uploads/${src}`;
    link.download = nomeArquivo;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIconeArquivo = (tipoArquivo: string) => {
    switch (tipoArquivo) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'ppt':
      case 'pptx': return '📊';
      case 'xls':
      case 'xlsx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📎';
    }
  };

  const podeVisualizar = (tipoArquivo: string) => {
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'].includes(tipoArquivo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aula) return;

    setUploading(true);

    try {
      // Se houver arquivos novos, fazer upload primeiro
      if (arquivos && arquivos.length > 0) {
        const formData = new FormData();
        Array.from(arquivos).forEach(arquivo => {
          formData.append('arquivos', arquivo);
        });
        formData.append('idAula', aula.idAula.toString());
        formData.append('tipo', 'planejamento');

        const uploadResponse = await fetch('/api/upload-aula', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Erro no upload dos arquivos');
        }
        
        // Recarregar lista de arquivos após upload
        await loadArquivosExistentes(aula.idAula);
      }

      // Salvar o planejamento usando a nova API
      const dadosAula = {
        idAula: aula.idAula,
        planejamento,
        metodologia
      };

      console.log('Dados sendo enviados para save:', dadosAula);
      await onSave(dadosAula);
      
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar dados da aula');
    } finally {
      setUploading(false);
    }
  };

  if (!aula) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Planejamento de Aula">
        <form onSubmit={handleSubmit} className="bg-gray-100 rounded-xl p-6 shadow border border-gray-300 space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg mb-2">
            <h4 className="font-semibold text-blue-800">
              {aula.materia.nomeMateria} (ID: {aula.idAula})
            </h4>
            <p className="text-sm text-blue-600">
              {new Date(aula.dataAula).toLocaleDateString('pt-BR')} - {aula.horario}
            </p>
          </div>

          <div>
            <label htmlFor="planejamento" className="block text-sm font-medium mb-2 text-blue-700">
              O que pretende apresentar nesta aula?
            </label>
            <textarea
              id="planejamento"
              value={planejamento}
              onChange={(e) => setPlanejamento(e.target.value)}
              rows={4}
              className="w-full border border-blue-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              placeholder="Descreva o conteúdo que será abordado..."
            />
          </div>

          <div>
            <label htmlFor="metodologia" className="block text-sm font-medium mb-2 text-blue-700">
              Como será desenvolvida a aula?
            </label>
            <textarea
              id="metodologia"
              value={metodologia}
              onChange={(e) => setMetodologia(e.target.value)}
              rows={4}
              className="w-full border border-blue-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              placeholder="Descreva a metodologia, recursos que serão utilizados..."
            />
          </div>
          
          {/* Arquivos existentes */}
          {arquivosExistentes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-700">
                Arquivos Anexados Atualmente ({arquivosExistentes.length})
              </label>
              {loadingArquivos ? (
                <p className="text-sm text-gray-500">Carregando arquivos...</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
                  {arquivosExistentes.map((arquivo) => (
                    <div 
                      key={arquivo.idDocAula} 
                      className="flex items-center justify-between bg-gray-100 p-3 rounded border hover:bg-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg">{getIconeArquivo(arquivo.tipoArquivo)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 font-medium truncate">
                            {arquivo.nomeArquivo}
                          </p>
                          <p className="text-xs text-gray-500 uppercase">
                            {arquivo.tipoArquivo}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        {podeVisualizar(arquivo.tipoArquivo) && (
                          <button
                            type="button"
                            onClick={() => handleVisualizarArquivo(arquivo)}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                            title="Visualizar arquivo"
                          >
                            👁️
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadArquivo(arquivo.src, arquivo.nomeArquivo)}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          title="Baixar arquivo"
                        >
                          ⬇️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArquivo(arquivo.idDocAula)}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                          title="Excluir arquivo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="arquivos" className="block text-sm font-medium mb-2 text-blue-700">
              Adicionar Novos Arquivos (opcional)
            </label>
            <input
              type="file"
              id="arquivos"
              multiple
              onChange={(e) => setArquivos(e.target.files)}
              className="w-full border border-blue-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            />
            <p className="text-xs text-gray-500 mt-1">
              Aceitos: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
            </p>
          </div>

          <div className="text-xs text-gray-500 border-t pt-2">
            Debug - ID da Aula: {aula.idAula} | Arquivos: {arquivosExistentes.length}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl hover:bg-gray-600 disabled:opacity-50 font-semibold shadow"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 font-semibold shadow flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                'Salvar Planejamento'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização de Arquivo */}
      {arquivoVisualizando && (
        <Modal 
          isOpen={!!arquivoVisualizando} 
          onClose={() => setArquivoVisualizando(null)} 
          title={`Visualizar: ${arquivoVisualizando.nomeArquivo}`}
        >
          <div className="max-w-4xl max-h-[80vh] overflow-auto">
            {arquivoVisualizando.tipoArquivo === 'pdf' && (
              <div className="w-full h-[70vh]">
                <iframe
                  src={`/uploads/${arquivoVisualizando.src}`}
                  className="w-full h-full border rounded"
                  title={arquivoVisualizando.nomeArquivo}
                />
                <div className="mt-2 text-center">
                  <button
                    onClick={() => handleDownloadArquivo(arquivoVisualizando.src, arquivoVisualizando.nomeArquivo)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    📥 Baixar PDF
                  </button>
                </div>
              </div>
            )}
            {['jpg', 'jpeg', 'png', 'gif'].includes(arquivoVisualizando.tipoArquivo) && (
                <div className="text-center">
                <Image
                  src={`/uploads/${arquivoVisualizando.src}`}
                  alt={arquivoVisualizando.nomeArquivo}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[60vh] object-contain mx-auto rounded border"
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '60vh' }}
                />
                <div className="mt-4">
                  <button
                  onClick={() => handleDownloadArquivo(arquivoVisualizando.src, arquivoVisualizando.nomeArquivo)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                  📥 Baixar Imagem
                  </button>
                </div>
                </div>
            )}

            {arquivoVisualizando.tipoArquivo === 'txt' && (
              <div>
                <iframe
                  src={`/uploads/${arquivoVisualizando.src}`}
                  className="w-full h-96 border rounded p-4"
                  title={arquivoVisualizando.nomeArquivo}
                />
                <div className="mt-2 text-center">
                  <button
                    onClick={() => handleDownloadArquivo(arquivoVisualizando.src, arquivoVisualizando.nomeArquivo)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    📥 Baixar Arquivo
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setArquivoVisualizando(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
