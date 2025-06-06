import { HomeIcon } from "@heroicons/react/24/solid";

export default function Header() {
    return (
        <header className="bg-blue-800 text-white px-2 py-2 shadow-md w-full">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4 w-full">
                {/* Top row: Home + User */}
                <div className="flex w-full items-center justify-between md:w-auto md:justify-start">
                    {/* Ícone de casinha à esquerda */}
                    <a
                        href="/"
                        className="flex items-center justify-center w-10 h-10 rounded hover:bg-blue-700 transition"
                        aria-label="Início"
                    >
                        <HomeIcon className="w-7 h-7 text-white" />
                    </a>
                    {/* Usuário e sair à direita (mobile: topo à direita) */}
                    <div className="flex items-center gap-2 md:hidden">
                        <span className="text-xs truncate max-w-[80px]">Nome do Usuário</span>
                        <button
                            className="px-2 py-1 text-xs font-bold rounded bg-blue-900 hover:bg-blue-800 text-white transition border border-blue-950"
                            type="button"
                        >
                            Sair
                        </button>
                    </div>
                </div>

                {/* Logo + nome centralizados e juntos em todas as telas */}
                <div className="flex items-center justify-center">
                    <img
                        src="./logo.png"
                        alt="Logo Softmare"
                        className="w-16 h-16 md:w-24 md:h-24 object-contain"
                    />
                    <span className="ml-2 text-2xl md:text-5xl font-extrabold text-white select-none text-center">
                        Softmare
                    </span>
                </div>

                {/* Usuário e sair à direita (desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    <span className="text-xs md:text-sm truncate max-w-[90px] md:max-w-[120px]">Nome do Usuário</span>
                    <button
                        className="px-4 py-2 text-sm font-bold rounded bg-blue-900 hover:bg-blue-800 text-white transition border border-blue-950"
                        type="button"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
}

