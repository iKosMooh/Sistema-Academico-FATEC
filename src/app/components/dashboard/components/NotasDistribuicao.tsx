'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DistribuicaoItem {
  faixa: string;
  quantidade: number;
}

interface NotasDistribuicaoProps {
  data: DistribuicaoItem[];
}

import { TooltipProps } from 'recharts';

type CustomTooltipProps = TooltipProps<number, string>;

export function NotasDistribuicao({ data }: NotasDistribuicaoProps) {
  const totalAlunos = data.reduce((acc, item) => acc + item.quantidade, 0);
  
  const chartData = data.map(item => ({
    faixa: item.faixa,
    percentual: totalAlunos > 0 
      ? Number(((item.quantidade / totalAlunos) * 100).toFixed(1))
      : 0,
    quantidade: item.quantidade // mantido para o tooltip
  }));

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-semibold mb-1">Faixa de Nota: {label}</p>
        <p>Percentual: {payload[0].value}%</p>
      </div>
    );
  };

  const getBarColor = (faixa: string): string => {
    switch (faixa) {
      case '0-2': return '#EF4444'; // red-500
      case '2-4': return '#F97316'; // orange-500
      case '4-6': return '#EAB308'; // yellow-500
      case '6-8': return '#2563EB'; // blue-600
      case '8-10': return '#22C55E'; // green-500
      default: return '#6B7280'; // gray-500
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Distribuição de Notas</h3>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="faixa" 
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Faixas de Notas',
                position: 'insideBottom',
                offset: -10
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Percentual de Alunos (%)',
                angle: -90,
                position: 'insideLeft',
                offset: 10
              }}
            />
            <Tooltip content={CustomTooltip} />
            <Bar
              dataKey="percentual"
              label={{ 
                position: 'top',
                formatter: (value: number) => `${value}%`
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={getBarColor(entry.faixa)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        Total de alunos: {totalAlunos}
      </div>
    </div>
  );
}
