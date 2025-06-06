"use client";

interface Turma {
  idTurma: number;
  nomeTurma: string;
  anoLetivo: number;
  curso: {
    nomeCurso: string;
    cargaHorariaTotal: number;
  };
  statusMatricula: string;
}

interface TurmasAlunoProps {
  turmas: Turma[];
}

export function TurmasAluno({ turmas }: TurmasAlunoProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🎓 Minhas Turmas</h2>
        <p className="text-gray-600">{turmas.length} turma{turmas.length !== 1 ? 's' : ''} encontrada{turmas.length !== 1 ? 's' : ''}</p>
      </div>

      {turmas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma turma encontrada</h3>
          <p className="text-gray-600">Você ainda não está matriculado em nenhuma turma.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {turmas.map((turma) => (
            <div key={turma.idTurma} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{turma.nomeTurma}</h3>
                  <p className="text-gray-600 font-medium">{turma.curso.nomeCurso}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  turma.statusMatricula === 'Ativa' 
                    ? 'bg-green-100 text-green-800' 
                    : turma.statusMatricula === 'Trancada'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {turma.statusMatricula}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ano Letivo:</span>
                  <span className="font-medium">{turma.anoLetivo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carga Horária Total:</span>
                  <span className="font-medium">{turma.curso.cargaHorariaTotal}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID da Turma:</span>
                  <span className="font-medium text-blue-600">#{turma.idTurma}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Status da matrícula atualizado automaticamente
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
