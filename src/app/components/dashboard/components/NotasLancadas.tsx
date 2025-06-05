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
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Notas Lançadas</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Aluno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Avaliação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Nota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(notas) && notas.map((nota) => (
              <tr key={nota.idNota} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {`${nota.aluno.nome} ${nota.aluno.sobrenome}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{nota.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{nota.tipoAvaliacao}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap font-medium">
                  {nota.valorNota.toFixed(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
