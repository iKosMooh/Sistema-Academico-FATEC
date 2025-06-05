interface FrequenciaSectionProps {
  frequencia: {
    taxaPresenca: number;
    totalAulas: number;
    aulasRealizadas: number;
    alunosComBaixaFrequencia?: Array<{
      nome: string;
      frequencia: number;
    }>;
  };
}

export function FrequenciaSection({ frequencia }: FrequenciaSectionProps) {
  const porcentagem = (frequencia.taxaPresenca * 100).toFixed(1);
  const corIndicador = Number(porcentagem) >= 75 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Frequência da Turma</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className={`text-3xl font-bold ${corIndicador}`}>{porcentagem}%</div>
          <div className="text-sm text-gray-600">Taxa de Presença</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{frequencia.aulasRealizadas}</div>
          <div className="text-sm text-gray-600">Aulas Realizadas</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{frequencia.totalAulas}</div>
          <div className="text-sm text-gray-600">Total de Aulas</div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className={`h-2.5 rounded-full ${Number(porcentagem) >= 75 ? 'bg-green-600' : 'bg-red-600'}`}
          style={{ width: `${porcentagem}%` }}
        ></div>
      </div>

      {frequencia.alunosComBaixaFrequencia && frequencia.alunosComBaixaFrequencia.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Alunos com Baixa Frequência</h3>
          <div className="space-y-2">
            {frequencia.alunosComBaixaFrequencia.map((aluno, index) => (
              <div key={index} className="flex justify-between items-center bg-red-50 p-2 rounded">
                <span>{aluno.nome}</span>
                <span className="text-red-600 font-semibold">
                  {(aluno.frequencia * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
