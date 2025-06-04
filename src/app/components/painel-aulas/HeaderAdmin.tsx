import { useAppContext } from "./AppContext";

export function HeaderAdmin() {
  const { usuario } = useAppContext();
  return (
    <header className="bg-blue-900 text-white flex items-center justify-between px-6 py-3 shadow">
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg">FATEC – Sistema Acadêmico</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">{usuario.nome}</span>
        <span className="rounded-full bg-blue-700 px-3 py-1 text-xs">{usuario.tipo}</span>
        {/* Dropdown de perfil/ajustes pode ser adicionado aqui */}
      </div>
    </header>
  );
}
