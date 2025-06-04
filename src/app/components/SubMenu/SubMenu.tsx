'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const menuGroups = [
	{
		label: 'Aulas',
		items: [
			{ label: 'Planejamento de Aulas', path: '/aulas/planejamento' },
			{ label: 'Registro de Aulas / Frequência', path: '/aulas/registro' },
			{ label: 'Gerenciar Aulas Recorrentes', path: '/aulas/recorrentes' },
		],
	},
	
	{
		label: 'Outros',
		items: [
			{ label: 'Alunos', path: '/alunos' },
			{ label: 'Professores', path: '/professores' },
			{ label: 'Turmas', path: '/turmas' },
			{ label: 'Disciplinas', path: '/disciplinas' },
			{ label: 'Presenças', path: '/presencas' },
		],
	},
];

export default function SubMenu() {
	const router = useRouter();
	const [openGroup, setOpenGroup] = useState<string | null>(null);

	const handleGroupClick = (label: string) => {
		setOpenGroup(openGroup === label ? null : label);
	};

	return (
		<aside className="bg-blue-700 text-white w-64 min-h-screen p-4">
			<nav>
				<ul className="space-y-2">
					{menuGroups.map((group) => (
						<li key={group.label}>
							<button
								className="w-full flex justify-between items-center text-left font-semibold px-2 py-2 rounded hover:bg-blue-800 transition"
								onClick={() => handleGroupClick(group.label)}
								aria-expanded={openGroup === group.label}
							>
								{group.label}
								<span className="ml-2">
									{openGroup === group.label ? '▲' : '▼'}
								</span>
							</button>
							{openGroup === group.label && (
								<ul className="ml-4 mt-1 space-y-1">
									{group.items.map((item) => (
										<li key={item.path}>
											<button
												onClick={() => router.push(item.path)}
												className="block w-full text-left text-sm hover:bg-blue-900 px-2 py-1 rounded"
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