"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ExclamationTriangleIcon, ClockIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/solid";

export default function ResetSistemaPage() {
    const { data: session } = useSession();
    const [isResetting, setIsResetting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [lastReset, setLastReset] = useState<Date | null>(null);
    const [canReset, setCanReset] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(0);

    // Verificar último reset e calcular tempo restante
    useEffect(() => {
        const lastResetTime = localStorage.getItem('lastDatabaseReset');
        if (lastResetTime) {
            const lastDate = new Date(lastResetTime);
            setLastReset(lastDate);

            const now = new Date();
            const timeDiff = now.getTime() - lastDate.getTime();
            const fiveMinutes = 5 * 60 * 1000; // 5 minutos em milliseconds

            if (timeDiff < fiveMinutes) {
                setCanReset(false);
                setTimeRemaining(Math.ceil((fiveMinutes - timeDiff) / 1000));
            }
        }
    }, []);

    // Countdown para próximo reset
    useEffect(() => {
        if (!canReset && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setCanReset(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [canReset, timeRemaining]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleReset = async () => {
        if (!canReset) {
            setMessage({ type: 'error', text: 'Aguarde o tempo mínimo entre resets.' });
            return;
        }

        setIsResetting(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/reset-database', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirm: true,
                    adminCpf: session?.user?.cpf
                })
            });

            const result = await response.json();

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: `Banco resetado com sucesso! ${result.summary || ''}`
                });

                // Salvar timestamp do reset
                localStorage.setItem('lastDatabaseReset', new Date().toISOString());
                setLastReset(new Date());
                setCanReset(false);
                setTimeRemaining(300); // 5 minutos
                setShowConfirmation(false);

            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Erro ao resetar banco'
                });
            }
        } catch (error) {
            console.error('Erro:', error);
            setMessage({
                type: 'error',
                text: 'Erro de conexão. Verifique o servidor.'
            });
        } finally {
            setIsResetting(false);
        }
    };

    const usuariosDemo = [
        {
            tipo: 'Admin',
            login: '111.222.333-96',
            senha: 'admin',
            nome: 'José Marcos Romão Júnior',
            observacao: 'Coordenador do curso de Gestão da Produção Industrial'
        },
        {
            tipo: 'Coordenador',
            login: '839.582.438-60',
            senha: 'coord123',
            nome: 'Gilberto Brandão Marcon',
            observacao: 'Coordenador do curso de Gestão Empresarial'
        },
        {
            tipo: 'Professor',
            login: '649.565.688-27',
            senha: 'prof123',
            nome: 'Márcia Regina Reggiolli',
            observacao: 'Coordenadora do curso de Desenvolvimento de Software'
        },
        {
            tipo: 'Aluno',
            login: '477.719.710-75',
            senha: 'aluno123',
            nome: 'Aluno1 Silva Santos',
            observacao: 'Aluno do 3º semestre de Gestão Empresarial'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                    <div>
                        <h1 className="text-2xl font-bold">Administração do Sistema</h1>
                        <p className="text-red-100">FATEC Itapira - Reset e Configuração do Banco de Dados</p>
                    </div>
                </div>
            </div>

            {/* Informações sobre o Reset */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-yellow-800 mb-4">⚠️ Sobre o Reset do Banco</h2>
                <div className="space-y-3 text-yellow-700">
                    <p>Esta operação irá:</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><strong>Deletar TODOS os dados</strong> existentes no banco</li>
                        <li>Recriar as tabelas com estrutura atualizada</li>
                        <li>Popular com <strong>10 registros</strong> em cada tabela</li>
                        <li>Criar dados realistas baseados na FATEC Itapira</li>
                        <li>Incluir os 3 cursos principais: Gestão da Produção, Gestão Empresarial e Desenvolvimento de Software</li>
                    </ul>
                    <div className="mt-4 p-3 bg-yellow-100 rounded border">
                        <p className="font-medium">🔒 Limitação de Segurança:</p>
                        <p>Esta operação só pode ser executada a cada <strong>5 minutos</strong> para evitar uso acidental.</p>
                    </div>
                </div>
            </div>

            {/* Status do Reset */}
            <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Status do Sistema</h2>
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">
                            {lastReset ? `Último reset: ${lastReset.toLocaleString('pt-BR')}` : 'Nenhum reset registrado'}
                        </span>
                    </div>
                </div>

                {!canReset && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-4 mb-4">
                        <div className="flex items-center space-x-2">
                            <ClockIcon className="w-5 h-5 text-orange-600" />
                            <span className="text-orange-800 font-medium">
                                Próximo reset disponível em: {formatTime(timeRemaining)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Usuários de Demonstração */}
            <div className="bg-white border rounded-lg p-6 text-gray-800">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Usuários de Demonstração
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    {usuariosDemo.map((usuario, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${usuario.tipo === 'Admin' ? 'bg-red-100 text-red-800' :
                                        usuario.tipo === 'Coordenador' ? 'bg-purple-100 text-purple-800' :
                                            usuario.tipo === 'Professor' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                    }`}>
                                    {usuario.tipo}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-800">{usuario.nome}</h3>
                            <div className="mt-2 space-y-1 text-sm">
                                <div className="flex items-center">
                                    <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="font-medium">Login:</span>
                                    <code className="ml-1 bg-gray-200 px-1 rounded">{usuario.login}</code>
                                </div>
                                <div className="flex items-center">
                                    <LockClosedIcon className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="font-medium">Senha:</span>
                                    <code className="ml-1 bg-gray-200 px-1 rounded">{usuario.senha}</code>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">{usuario.observacao}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Estrutura de Dados */}
            <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Dados que serão criados</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        'Usuários (4)', 'Cursos (3)', 'Matérias (15)', 'Professores (10)',
                        'Alunos (10)', 'Turmas (10)', 'Aulas (50+)', 'Notas (100+)',
                        'Presenças (200+)', 'Endereços (10)', 'Contatos (10)', 'Histórico (30)'
                    ].map((item, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded text-center">
                            <span className="text-sm font-medium text-blue-800">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirmação e Reset */}
            <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">🔄 Executar Reset</h2>

                {!showConfirmation ? (
                    <button
                        onClick={() => setShowConfirmation(true)}
                        disabled={!canReset || isResetting}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${canReset && !isResetting
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-gray-300 text-white cursor-not-allowed'
                            }`}
                    >
                        {!canReset ? `Aguarde ${formatTime(timeRemaining)}` : 'Iniciar Reset do Banco'}
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded p-4">
                            <h3 className="font-semibold text-red-800 mb-2">⚠️ Confirmação Obrigatória</h3>
                            <p className="text-red-700 mb-4">
                                Esta ação é <strong>IRREVERSÍVEL</strong>. Todos os dados serão perdidos permanentemente.
                            </p>
                            <p className="text-red-700 mb-4">
                                Tem certeza que deseja resetar o banco de dados e popular com dados de demonstração?
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleReset}
                                    disabled={isResetting}
                                    className={`px-6 py-2 rounded font-medium transition-colors ${!isResetting
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {isResetting ? '🔄 Resetando...' : '✅ SIM, RESETAR BANCO'}
                                </button>
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    disabled={isResetting}
                                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                                >
                                    ❌ NÃO, CANCELAR
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                        message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                            'bg-blue-50 border border-blue-200 text-blue-800'
                    }`}>
                    <p className="font-medium">{message.text}</p>
                    {/* Mensagem específica para erro de chave estrangeira */}
                    {message.type === 'error' && message.text?.includes('P2003') && (
                        <div className="mt-2 text-sm text-red-700">
                            Erro de integridade referencial: verifique se todas as turmas, matérias e professores existem antes de criar as aulas.<br />
                            <strong>Dica:</strong> O erro geralmente ocorre quando está tentando criar aulas para turmas, matérias ou professores que não existem no banco.<br />
                            <span className="font-semibold">Solução:</span> Ajuste a ordem de criação dos dados no reset para garantir que todas as dependências existam antes de criar as aulas.
                        </div>
                    )}
                </div>
            )}

            {/* Loading Overlay */}
            {isResetting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                        <p className="font-medium text-gray-800">Resetando banco de dados...</p>
                        <p className="text-sm text-gray-600">Isso pode levar alguns segundos.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
