'use client';
import { useState, useEffect } from 'react';

interface ConteudoMinistradoFormProps {
  idAula: number;
  conteudoMinistrado?: string;
  onSave: (conteudo: string) => void;
}

export function ConteudoMinistradoForm({ idAula, conteudoMinistrado = '', onSave }: ConteudoMinistradoFormProps) {
  const [conteudo, setConteudo] = useState(conteudoMinistrado);
  const [arquivos, setArquivos] = useState<FileList | null>(null);

  useEffect(() => {
    setConteudo(conteudoMinistrado);
  }, [conteudoMinistrado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se houver arquivos, fazer upload primeiro
    if (arquivos && arquivos.length > 0) {
      const formData = new FormData();
      Array.from(arquivos).forEach(arquivo => {
        formData.append('arquivos', arquivo);
      });
      formData.append('idAula', idAula.toString());
      formData.append('tipo', 'materiais');

      try {
        const uploadResponse = await fetch('/api/upload-aula', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Erro no upload dos arquivos');
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao fazer upload dos arquivos');
        return;
      }
    }

    onSave(conteudo);
  };

  return (
    <div className="bg-white border rounded-lg p-4 mt-4">
      <h4 className="font-semibold text-gray-800 mb-3">
        Conteúdo Realmente Ministrado
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva o que foi realmente apresentado nesta aula..."
          />
        </div>

        <div>
          <label htmlFor="arquivos-aula" className="block text-sm font-medium mb-2">
            Materiais Utilizados na Aula (opcional)
          </label>
          <input
            type="file"
            id="arquivos-aula"
            multiple
            onChange={(e) => setArquivos(e.target.files)}
            className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
          Salvar Conteúdo Ministrado
        </button>
      </form>
    </div>
  );
}
