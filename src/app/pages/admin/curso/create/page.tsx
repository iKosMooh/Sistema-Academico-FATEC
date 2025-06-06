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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      router.push('/pages/academico/dashboard');  // Redireciona para a listagem de cursos
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
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Criar Curso</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nome do Curso</label>
          <input
            type="text"
            name="nomeCurso"
            value={formData.nomeCurso}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Carga Horária Total</label>
          <input
            type="number"
            name="cargaHorariaTotal"
            value={formData.cargaHorariaTotal}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Descrição</label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Caminho de Documentos (Opcional)</label>
          <input
            type="text"
            name="docsPath"
            value={formData.docsPath}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">Curso criado com sucesso!</p>}
      </form>
    </div>
  );
}
