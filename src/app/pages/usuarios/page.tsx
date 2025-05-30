import prisma from '@/lib/prisma/prisma';

export default async function UsuariosPage() {
    const usuarios = await prisma.usuarios.findMany();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Usuários</h1>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">CPF</th>
                        <th className="border border-gray-300 px-4 py-2">Tipo</th>
                        <th className="border border-gray-300 px-4 py-2">Criado em</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.cpf}>
                            <td className="border border-gray-300 px-4 py-2">{usuario.cpf}</td>
                            <td className="border border-gray-300 px-4 py-2">{usuario.tipo}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {new Date(usuario.created_at).toLocaleString('pt-BR', {
                                    timeZone: 'America/Sao_Paulo',
                                    hour12: false,           // formato 24 horas
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
