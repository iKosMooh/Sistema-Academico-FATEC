"use client";
import { HomeIcon, UserIcon, ArrowRightStartOnRectangleIcon, AcademicCapIcon } from "@heroicons/react/24/solid";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

// Importação condicional do hook de permissões
function usePermissionsWithFallback() {
  const { data: session } = useSession();
  
  // Fallback manual se o hook não existir ou falhar
  const userType = session?.user?.tipo;
  
  return {
    userType,
    isAdmin: userType === 'Admin',
    canAccessCoordenador: userType === 'Admin' || userType === 'Coordenador',
    canAccessProfessor: userType === 'Admin' || userType === 'Coordenador' || userType === 'Professor',
    session,
  };
}

export default function Header() {
    const pathname = usePathname();
    const isLoginPage = pathname === "/pages/login";
    const router = useRouter();
    const { data: session, status } = useSession();
    const { userType, isAdmin, canAccessCoordenador, canAccessProfessor } = usePermissionsWithFallback();
    const [showDropdown, setShowDropdown] = useState(false);

    // Fechar dropdown quando clicar fora
    useEffect(() => {
        const handleClickOutside = () => setShowDropdown(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut({ redirect: false });
            router.push("/pages/login");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            // Forçar redirect em caso de erro
            window.location.href = "/pages/login";
        }
    };

    const handleHomeClick = () => {
        if (session) {
            // Usuário logado - ir para dashboard apropriado
            switch (userType) {
                case 'Admin':
                    router.push('/pages/admin/dashboard');
                    break;
                case 'Coordenador':
                    router.push('/pages/coordenador/dashboard');
                    break;
                case 'Professor':
                    router.push('/pages/professor/dashboard');
                    break;
                case 'Aluno':
                    router.push('/pages/aluno/dashboard');
                    break;
                default:
                    router.push('/');
            }
        } else {
            // Usuário não logado - ir para homepage
            router.push('/');
        }
    };

    const getNavigationItems = () => {
        if (!session) return [];

        const items = [];

        // Admin pode acessar tudo
        if (isAdmin) {
            items.push(
                { href: '/pages/admin/painel-aulas', label: 'Aulas', icon: AcademicCapIcon }
            );
        }

        // Coordenador
        if (canAccessCoordenador && !isAdmin) {
            items.push(
                { href: '/pages/admin/painel-aulas', label: 'Aulas', icon: AcademicCapIcon }
            );
        }

        // Professor
        if (canAccessProfessor && !canAccessCoordenador) {
            items.push(
                { href: '/pages/admin/painel-aulas', label: 'Aulas', icon: AcademicCapIcon }
            );
        }

        // Aluno
        if (userType === 'Aluno') {
            items.push(
                { href: '/pages/admin/painel-aulas', label: 'Aulas', icon: AcademicCapIcon }
            );
        }

        return items;
    };

    const getUserDisplayName = () => {
        if (!session?.user) return 'Usuário';
        
        const { nome, sobrenome, email } = session.user;
        
        if (nome) {
            return sobrenome ? `${nome} ${sobrenome}` : nome;
        } else if (email) {
            return email.split('@')[0];
        }
        return 'Usuário';
    };

    const getUserRole = () => {
        const roleLabels = {
            Admin: 'Administrador',
            Coordenador: 'Coordenador',
            Professor: 'Professor',
            Aluno: 'Aluno'
        };
        return roleLabels[userType as keyof typeof roleLabels] || userType;
    };

    if (status === 'loading') {
        return (
            <header className="bg-blue-800 shadow-lg px-4 py-2 w-full">
                <div className="flex items-center justify-center h-20">
                    <div className="animate-pulse text-white">Carregando...</div>
                </div>
            </header>
        );
    }

    return (
        <>
            <header className="bg-blue-800 shadow-lg px-4 py-2 w-full relative z-50">
                <div className="flex items-center h-20">
                    {/* Logo + Nome */}
                    <div className="flex items-center flex-shrink-0">
                        <div className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="Logo Softmare"
                                width={128}
                                height={128}
                                className="w-32 h-32 object-contain"
                                priority
                            />
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent select-none ml-0">
                                Softmare
                            </span>
                        </div>
                    </div>

                    {/* Navegação Central */}
                    <div className="flex-1 flex justify-center">
                        <button
                            onClick={handleHomeClick}
                            className="flex items-center justify-center px-4 py-2 rounded-lg bg-white bg-opacity-0 hover:bg-white hover:text-blue-800 transition duration-300 text-white"
                            style={{ transition: "background 0.3s, color 0.3s" }}
                        >
                            <HomeIcon className="w-5 h-5 mr-2" />
                            <span className="font-medium flex justify-center items-center w-full">
                                {session ? 'Dashboard' : 'Início'}
                            </span>
                        </button>
                    </div>

                    {/* Área do Usuário */}
                    <div className="flex items-center">
                        {/* Botão Home Mobile */}
                        <div className="md:hidden mr-4">
                            <button
                                onClick={handleHomeClick}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-0 hover:bg-white hover:text-blue-800 transition duration-300 text-white"
                                style={{ transition: "background 0.3s, color 0.3s" }}
                            >
                                <HomeIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {session ? (
                            <div className="flex items-center relative">
                                {/* Informações do Usuário */}
                                <div className="hidden md:block mr-4 text-right">
                                    <p className="text-white font-medium text-sm">Bem-vindo,</p>
                                    <p className="text-white font-semibold truncate max-w-[120px]">
                                        {getUserDisplayName()}
                                    </p>
                                    <p className="text-blue-200 text-xs">
                                        {getUserRole()}
                                    </p>
                                </div>

                                {/* Avatar + Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDropdown(!showDropdown);
                                        }}
                                        className="user-avatar bg-white bg-opacity-20 p-1 rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                                    >
                                        <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
                                            {session.user?.fotoPath ? (
                                                <Image
                                                    src={session.user.fotoPath}
                                                    alt="Avatar"
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full object-cover"
                                                />
                                            ) : (
                                                <UserIcon className="text-blue-800 w-6 h-6" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border py-2 z-50">
                                            {/* Header do Dropdown */}
                                            <div className="px-4 py-2 border-b">
                                                <p className="font-semibold text-gray-800 truncate">
                                                    {getUserDisplayName()}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {getUserRole()}
                                                </p>
                                            </div>

                                            {/* Itens de Navegação */}
                                            <div className="py-1">
                                                {getNavigationItems().map((item, index) => {
                                                    const Icon = item.icon;
                                                    const isActive = pathname === item.href;
                                                    
                                                    return (
                                                        <Link
                                                            key={index}
                                                            href={item.href}
                                                            onClick={() => setShowDropdown(false)}
                                                            className={`flex items-center px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                                                                isActive 
                                                                    ? 'bg-blue-100 text-blue-800 border-r-2 border-blue-500' 
                                                                    : 'text-gray-700'
                                                            }`}
                                                        >
                                                            <Icon className="w-4 h-4 mr-3" />
                                                            {item.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t pt-1">
                                                <button
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        handleLogout();
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <ArrowRightStartOnRectangleIcon className="w-4 h-4 mr-3" />
                                                    Sair
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Botão Sair (Desktop) */}
                                {!isLoginPage && (
                                    <button
                                        className="ml-4 hidden lg:flex items-center px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition duration-300 shadow-md text-white"
                                        type="button"
                                        onClick={handleLogout}
                                    >
                                        <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Sair</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            // Usuário não logado
                            !isLoginPage && (
                                <Link
                                    href="/pages/login"
                                    className="flex items-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition duration-300 shadow-md text-white"
                                >
                                    <UserIcon className="w-5 h-5 mr-2" />
                                    <span className="font-medium">Entrar</span>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </header>

            {/* Overlay para fechar dropdown */}
            {showDropdown && (
                <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </>
    );
}

