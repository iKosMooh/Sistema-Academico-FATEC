'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCursoPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nomeCurso: '',
    cargaHorariaTotal: '',
    descricao: '',
    docsPath: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'insert',
          table: 'curso',
          data: {
            nomeCurso: formData.nomeCurso,
            cargaHorariaTotal: parseInt(formData.cargaHorariaTotal, 10),
            descricao: formData.descricao || null,
            docsPath: formData.docsPath || null,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.error || 'Erro ao criar o curso.');

      setSuccess(true);
      router.push('/pages/academico/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro desconhecido ao criar o curso.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded shadow p-4 mt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Criar Curso</h1>
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-xl shadow space-y-0 text-base">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block font-semibold text-blue-700 mb-1 text-base">
              <span className="text-red-600">*</span> Nome do Curso
            </label>
            <input
              type="text"
              name="nomeCurso"
              value={formData.nomeCurso}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              placeholder="Nome do Curso"
            />
          </div>
          <div>
            <label className="block font-semibold text-blue-700 mb-1 text-base">
              <span className="text-red-600">*</span> Carga Horária Total
            </label>
            <input
              type="number"
              name="cargaHorariaTotal"
              value={formData.cargaHorariaTotal}
              onChange={handleChange}
              required
              min="1"
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              placeholder="Carga Horária Total"
            />
          </div>
          <div>
            <label className="block font-semibold text-blue-700 mb-1 text-base">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              placeholder="Descrição"
              rows={2}
            />
          </div>
          <div>
            <label className="block font-semibold text-blue-700 mb-1 text-base">
              Caminho de Documentos (Opcional)
            </label>
            <input
              type="text"
              name="docsPath"
              value={formData.docsPath}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 text-base"
              placeholder="Caminho de Documentos"
            />
          </div>
        </div>
        {error && <div className="text-red-600 my-2 text-base">{error}</div>}
        {success && <div className="text-green-600 my-2 text-base">Curso criado com sucesso!</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 font-semibold shadow text-lg"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
