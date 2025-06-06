"use client";
import { HomeIcon, UserIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";


export default function Header() {
    const pathname = usePathname();
    const isLoginPage = pathname === "/pages/login";
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/pages/login");
    };

    return (
        <>
            <header className="bg-blue-800 rounded-xl shadow-lg px-4 py-2 w-full">
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
                    {/* Botão Início (Desktop) */}
                    <div className="flex-1 flex justify-center">
                        <Link
                            href="/"
                            className="flex items-center justify-center px-4 py-2 rounded-lg bg-white bg-opacity-0 hover:bg-white hover:text-blue-800 transition duration-300 text-white"
                            style={{ transition: "background 0.3s, color 0.3s" }}
                        >
                            <HomeIcon className="w-5 h-5 mr-2" />
                            <span className="font-medium">Início</span>
                        </Link>
                    </div>
                    {/* Área do Usuário + Usuário + Avatar */}
                    <div className="flex items-center">
                        <div className="md:hidden mr-4">
                            <Link
                                href="/"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-0 hover:bg-white hover:text-blue-800 transition duration-300 text-white"
                                style={{ transition: "background 0.3s, color 0.3s" }}
                            >
                                <HomeIcon className="w-6 h-6" />
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <div className="hidden md:block mr-4 text-right">
                                <p className="text-white font-medium text-sm">Bem-vindo,</p>
                                <p className="text-white font-semibold truncate max-w-[120px]">Carlos Silva</p>
                            </div>
                            <div className="user-avatar bg-white bg-opacity-20 p-1 rounded-full transition-transform hover:scale-105">
                                <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
                                    <UserIcon className="text-blue-800 w-6 h-6" />
                                </div>
                            </div>
                            {/* Botão Sair */}
                            {!isLoginPage && (
                                <button
                                    className="ml-4 flex items-center px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition duration-300 shadow-md text-white"
                                    type="button"
                                    onClick={handleLogout}
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                                    <span className="font-medium hidden md:block">Sair</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}

