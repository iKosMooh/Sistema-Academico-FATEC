interface NotaLancada {
  idNota: number;
  nome: string;
  valorNota: number;
  tipoAvaliacao: string;
  dataLancamento: string;
  aluno: {
    nome: string;
    sobrenome: string;
  };
}

interface NotasLancadasProps {
  notas: NotaLancada[];
}

export function NotasLancadas({ notas = [] }: NotasLancadasProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow border border-gray-300 mb-6">
      <div className="p-0 pb-4">
        <h3 className="text-lg font-semibold text-gray-800">Notas Lançadas</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded-2xl bg-white bg-opacity-60 shadow-sm">
          <thead>
            <tr>
              <th className="text-gray-900">Aluno</th>
              <th className="text-gray-900">Avaliação</th>
              <th className="text-gray-900">Tipo</th>
              <th className="text-gray-900 text-right">Nota</th>
              <th className="text-gray-900">Data</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(notas) && notas.map((nota, idx) => (
              <tr key={nota.idNota}>
                <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900 px-6 py-4 whitespace-nowrap" : "bg-gray-50 text-blue-900 px-6 py-4 whitespace-nowrap"}>
                  {`${nota.aluno.nome} ${nota.aluno.sobrenome}`}
                </td>
                <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900 px-6 py-4 whitespace-nowrap" : "bg-gray-50 text-blue-900 px-6 py-4 whitespace-nowrap"}>
                  {nota.nome}
                </td>
                <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900 px-6 py-4 whitespace-nowrap" : "bg-gray-50 text-blue-900 px-6 py-4 whitespace-nowrap"}>
                  {nota.tipoAvaliacao}
                </td>
                <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900 px-6 py-4 text-right whitespace-nowrap font-medium" : "bg-gray-50 text-blue-900 px-6 py-4 text-right whitespace-nowrap font-medium"}>
                  {nota.valorNota.toFixed(1)}
                </td>
                <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900 px-6 py-4 whitespace-nowrap text-sm" : "bg-gray-50 text-blue-900 px-6 py-4 whitespace-nowrap text-sm"}>
                  {new Date(nota.dataLancamento).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {(!Array.isArray(notas) || notas.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma nota lançada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
