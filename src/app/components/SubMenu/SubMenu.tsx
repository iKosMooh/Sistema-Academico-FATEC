'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '../painel-aulas/AppContext';

const menuGroups = [
    {
        label: 'Gerenciamento de Turma',
        items: [
            { label: 'Calendário de Aulas', key: 'planejamento' },
            { label: 'Registro de Aulas / Frequência', key: 'registro' },
            { label: 'Gerenciar Aulas Recorrentes', key: 'recorrentes' },
            { label: 'Vincular Alunos à Turma', key: 'alunos' },
        ],
    },
    {
        label: 'Outros',
        items: [

            { label: 'Professores', key: 'professores' },
            { label: 'Turmas', key: 'turmas' },
            { label: 'Disciplinas', key: 'disciplinas' },
            { label: 'Presenças', key: 'presencas' },
        ],
    },
];

export default function SubMenu({ onSelect, selectedKey }: { onSelect: (key: string) => void, selectedKey: string }) {
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    // Turmas do contexto global
    const { turma, setTurma, setDisciplina } = useAppContext();
    const [turmas, setTurmas] = useState<{ id: string, nome: string }[]>([]);

    useEffect(() => {
        // Busca turmas do banco
        fetch("/api/crud", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                operation: "get",
                table: "turmas",
            }),
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.success) {
                    setTurmas(
                        result.data.map((t: { idTurma: number | string; nomeTurma: string }) => ({
                            id: String(t.idTurma),
                            nome: t.nomeTurma,
                        }))
                    );
                }
            });
    }, []);

    const handleGroupClick = (label: string) => {
        setOpenGroup(openGroup === label ? null : label);
    };

    // Só mostra o select se algum item do grupo "Aulas" estiver selecionado
    const isAulasItemSelected = menuGroups[0].items.some(item => item.key === selectedKey);

    return (
        <aside className="bg-blue-700 text-white w-64 min-h-screen p-4">
            {isAulasItemSelected && (
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1 text-white">Turma</label>
                    <select
                        className="w-full border rounded px-2 py-1 text-white-900"
                        value={turma?.id || ""}
                        onChange={e => {
                            const t = turmas.find(t => t.id === e.target.value) || null;
                            setTurma(t);
                            setDisciplina(null);
                        }}
                    >
                        <option value="">Selecione a turma</option>
                        {turmas.map(t => (
                            <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                    </select>
                </div>
            )}
            <nav>
                <ul className="space-y-2">
                    {menuGroups.map((group) => (
                        <li key={group.label}>
                            <button
                                className="w-full flex justify-between items-center text-left font-semibold px-2 py-2 rounded hover:bg-blue-700 transition"
                                onClick={() => handleGroupClick(group.label)}
                                aria-expanded={openGroup === group.label}
                            >
                                {group.label}
                                <span className="ml-2">{openGroup === group.label ? '▲' : '▼'}</span>
                            </button>
                            {openGroup === group.label && (
                                <ul className="ml-4 mt-1 space-y-1">
                                    {group.items.map((item) => (
                                        <li key={item.key}>
                                            <button
                                                onClick={() => onSelect(item.key)}
                                                className={`block w-full text-left text-sm px-2 py-1 rounded
                                                    ${selectedKey === item.key ? 'bg-blue-900 font-bold' : 'hover:bg-blue-900'}
                                                `}
                                            >
                                                {item.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}