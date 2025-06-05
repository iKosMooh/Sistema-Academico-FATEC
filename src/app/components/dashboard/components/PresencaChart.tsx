interface PresencaChartProps {
  frequencia: {
    taxaPresenca: number;
    totalAulas: number;
    aulasRealizadas: number;
  };
}

export function PresencaChart({ frequencia }: PresencaChartProps) {
  const porcentagem = (frequencia.taxaPresenca * 100).toFixed(1);
  const corBarra = Number(porcentagem) >= 75 ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Taxa de Presença</h3>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200">
              Presença
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gray-600">
              {porcentagem}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${porcentagem}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${corBarra}`}
          ></div>
        </div>
        <div className="text-sm text-gray-600">
          {frequencia.aulasRealizadas} de {frequencia.totalAulas} aulas realizadas
        </div>
      </div>
    </div>
  );
}
