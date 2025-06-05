import { memo } from 'react';

interface Nota {
  valorNota: number;
  tipoAvaliacao: string;
  nome: string;
  aluno: {
    nome: string;
    sobrenome: string;
  };
}

interface DesempenhoSectionProps {
  notas: Nota[];
  mediaGeral: number;
  alunosAprovados: number;
  totalAlunos: number;
}

export const DesempenhoSection = memo(function DesempenhoSection({
  notas,
  mediaGeral,
  alunosAprovados,
  totalAlunos,
}: DesempenhoSectionProps) {
  const aproveitamento = (alunosAprovados / totalAlunos) * 100;
  const corStatus = aproveitamento >= 60 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Desempenho da Turma</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {mediaGeral.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Média Geral</div>
        </div>

        <div className="text-center">
          <div className={`text-3xl font-bold ${corStatus}`}>
            {aproveitamento.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Taxa de Aprovação</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {alunosAprovados} / {totalAlunos}
          </div>
          <div className="text-sm text-gray-600">Alunos Aprovados</div>
        </div>
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notas.map((nota, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {`${nota.aluno.nome} ${nota.aluno.sobrenome}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nota.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {nota.tipoAvaliacao}
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap font-medium">
                  {nota.valorNota.toFixed(1)}
                </td>
              </tr>
            ))}
            {notas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma nota lançada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
