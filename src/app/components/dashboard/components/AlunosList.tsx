interface AlunosListProps {
  alunosPorFalta: Array<{
    nome: string;
    faltas: number;
  }>;
}

export function AlunosList({ alunosPorFalta }: AlunosListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Alunos com Mais Faltas</h3>
      <div className="space-y-3">
        {alunosPorFalta.map((aluno, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 bg-gray-50 rounded"
          >
            <div>
              <span className="font-medium">{aluno.nome}</span>
            </div>
            <div className="flex items-center">
              <span className="text-red-500 font-medium">
                {aluno.faltas} faltas
              </span>
            </div>
          </div>
        ))}
        {alunosPorFalta.length === 0 && (
          <p className="text-gray-500 text-center">Nenhum registro de falta</p>
        )}
      </div>
    </div>
  );
}
