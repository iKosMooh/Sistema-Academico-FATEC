import { DashboardError } from '@/types/errors';

interface ErrorDisplayProps {
  error: DashboardError;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow">
      <div className="flex items-center space-x-3">
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-red-800">Erro ao carregar dashboard</h3>
      </div>
      <p className="mt-2 text-red-700">{error.message}</p>
      <p className="mt-1 text-sm text-red-500">Código do erro: {error.code}</p>
    </div>
  );
}
