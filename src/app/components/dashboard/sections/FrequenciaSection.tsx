interface AlunoFrequencia {
  idAluno: number;
  nome: string;
  sobrenome: string;
  totalAulas: number;
  presencas: number;
  frequencia: number;
}

interface FrequenciaSectionProps {
  frequencia: {
    taxaPresenca: number;
    totalAulas: number;
    aulasRealizadas: number;
    alunosComBaixaFrequencia?: AlunoFrequencia[];
  };
}

export function FrequenciaSection({ frequencia }: FrequenciaSectionProps) {
  const porcentagem = (frequencia.taxaPresenca * 100).toFixed(1);
  const corIndicador = Number(porcentagem) >= 75 ? 'text-green-600' : 'text-red-600';
  const corBarra = Number(porcentagem) >= 75 ? 'bg-green-600' : 'bg-red-600';

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
          <div className="text-3xl font-bold text-gray-600">{frequencia.totalAulas}</div>
          <div className="text-sm text-gray-600">Total de Aulas</div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${corBarra}`}
          style={{ width: `${Math.min(100, Number(porcentagem))}%` }}
        ></div>
      </div>

      {frequencia.alunosComBaixaFrequencia && frequencia.alunosComBaixaFrequencia.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-600">
            ⚠️ Alunos com Baixa Frequência ({"<"} 75%)
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {frequencia.alunosComBaixaFrequencia.map((aluno: AlunoFrequencia) => (
              <div key={aluno.idAluno} className="flex justify-between items-center bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                <div className="flex-1">
                  <span className="font-medium text-gray-800">
                    {aluno.nome} {aluno.sobrenome}
                  </span>
                  <div className="text-sm text-gray-600">
                    {aluno.presencas}/{aluno.totalAulas} presenças
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold text-lg">
                    {(aluno.frequencia * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {frequencia.alunosComBaixaFrequencia.length > 3 && (
            <div className="mt-2 text-sm text-gray-500 text-center">
              {frequencia.alunosComBaixaFrequencia.length} aluno(s) com baixa frequência
            </div>
          )}
        </div>
      )}

      {(!frequencia.alunosComBaixaFrequencia || frequencia.alunosComBaixaFrequencia.length === 0) && frequencia.totalAulas > 0 && (
        <div className="text-center py-4">
          <div className="text-green-600 font-semibold">
            ✅ Todos os alunos estão com frequência adequada!
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Frequência mínima: 75%
          </div>
        </div>
      )}

      {frequencia.totalAulas === 0 && (
        <div className="text-center py-4 text-gray-500">
          <div className="text-lg">📊 Aguardando dados de frequência</div>
          <div className="text-sm mt-1">
            Nenhuma aula com presença registrada ainda
          </div>
        </div>
      )}
    </div>
  );
}
