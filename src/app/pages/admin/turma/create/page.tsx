"use client";
import { useState } from 'react';

interface Turma {
    nome: string;
    ano: number;
    semestre: number;
    cursoId: number;
}

export default function CreateTurmaPage() {
    const [form, setForm] = useState<Turma>({
        nome: '',
        ano: new Date().getFullYear(),
        semestre: 1,
        cursoId: 0,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'ano' || name === 'semestre' || name === 'cursoId' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch('/api/crud/turma', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                throw new Error('Erro ao criar turma');
            }

            setSuccess(true);
            setForm({
                nome: '',
                ano: new Date().getFullYear(),
                semestre: 1,
                cursoId: 0,
            });
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Criar Nova Turma</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Nome</label>
                    <input
                        type="text"
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        required
                        className="border px-2 py-1 w-full"
                    />
                </div>
                <div>
                    <label className="block mb-1">Ano</label>
                    <input
                        type="number"
                        name="ano"
                        value={form.ano}
                        onChange={handleChange}
                        required
                        className="border px-2 py-1 w-full"
                    />
                </div>
                <div>
                    <label className="block mb-1">Semestre</label>
                    <select
                        name="semestre"
                        value={form.semestre}
                        onChange={handleChange}
                        required
                        className="border px-2 py-1 w-full"
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1">Curso ID</label>
                    <input
                        type="number"
                        name="cursoId"
                        value={form.cursoId}
                        onChange={handleChange}
                        required
                        className="border px-2 py-1 w-full"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    {loading ? 'Salvando...' : 'Criar Turma'}
                </button>
                {success && <p className="text-green-600">Turma criada com sucesso!</p>}
                {error && <p className="text-red-600">{error}</p>}
            </form>
        </div>
    );
}