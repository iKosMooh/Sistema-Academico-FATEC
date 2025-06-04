export default function Header() {
    return (
        <header className="bg-blue-800 text-white p-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
                <h3 className="text-lg font-bold">Logo</h3>
            </div>

            {/* Título da seção */}
            <div className="text-center flex-grow">
                <h2 className="text-xl font-semibold">Título da Seção</h2>
            </div>

            {/* Nome do usuário e botão de sair */}
            <div className="flex items-center space-x-4">
                <span className="text-sm">Nome do Usuário</span>
                <span className="font-bold">Sair</span> 
            </div>
        </header>
    );
}

