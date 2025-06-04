"use client";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";

export default function CreateTurmaPage() {
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const [formData, setFormData] = useState({
    nomeTurma: '',
    anoLetivo: String(currentYear),
    idCurso: '',
    semestre: '1º semestre',
  });

  const [cursos, setCursos] = useState<{ idCurso: number; nomeCurso: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchCursos() {
      try {
        const res = await fetch('/api/crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'get',
            table: 'curso',
          }),
        });
        const result = await res.json();
        if (result.success) {
          setCursos(result.data);
        } else {
          setError('Erro ao carregar cursos');
        }
      } catch {
        setError('Erro ao carregar cursos');
      }
    }
    fetchCursos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const res = await fetch('/api/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'insert',
          table: 'turmas',
          data: {
            nomeTurma: formData.nomeTurma,
            anoLetivo: parseInt(formData.anoLetivo, 10),
            idCurso: parseInt(formData.idCurso, 10),
          },
        }),
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.error || 'Erro ao criar turma');

      setSuccess(true);
      router.push('/pages/admin/turma/view');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Criar Nova Turma</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nome da Turma</label>
          <input
            type="text"
            name="nomeTurma"
            value={formData.nomeTurma}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
            placeholder="Ex: DSM"
          />
        </div>
        <div>
          <label className="block mb-1">Ano Letivo</label>
          <select
            name="anoLetivo"
            value={formData.anoLetivo}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
          >
            {anos.map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Semestre</label>
          <select
            name="semestre"
            value={formData.semestre}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
          >
            <option value="1º semestre">1º semestre</option>
            <option value="2º semestre">2º semestre</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Curso</label>
          <select
            name="idCurso"
            value={formData.idCurso}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
          >
            <option value="">Selecione o curso</option>
            {cursos.map((curso) => (
              <option key={curso.idCurso} value={curso.idCurso}>
                {curso.nomeCurso}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Salvando...' : 'Criar Turma'}
        </button>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Turma criada com sucesso!</p>}
      </form>
    </div>
  );
}