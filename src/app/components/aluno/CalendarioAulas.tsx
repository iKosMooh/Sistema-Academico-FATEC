"use client";

import { useState } from "react";

interface Aula {
  idAula: number;
  dataAula: string;
  horario: string;
  materia: {
    nomeMateria: string;
  };
  turma: {
    nomeTurma: string;
  };
  aulaConcluida: boolean;
  conteudoMinistrado?: string;
  observacoesAula?: string;
}

interface CalendarioAulasProps {
  aulas: Aula[];
}

export function CalendarioAulas({ aulas }: CalendarioAulasProps) {
  const [mesAtual, setMesAtual] = useState(() => {
    const agora = new Date();
    return new Date(agora.getFullYear(), agora.getMonth(), 1);
  });

  const [aulaDetalhes, setAulaDetalhes] = useState<Aula | null>(null);

  // Filtrar aulas do mês atual
  const aulasDoMes = aulas.filter(aula => {
    const dataAula = new Date(aula.dataAula);
    return dataAula.getMonth() === mesAtual.getMonth() && 
           dataAula.getFullYear() === mesAtual.getFullYear();
  });

  // Gerar dias do calendário
  const gerarDiasCalendario = () => {
    const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const primeiroDiaSemana = primeiroDia.getDay();
    
    const dias = [];
    
    // Dias do mês anterior
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const data = new Date(primeiroDia);
      data.setDate(data.getDate() - (i + 1));
      dias.push({ data, outroMes: true });
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
      dias.push({ data, outroMes: false });
    }
    
    // Completar a última semana
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const data = new Date(ultimoDia);
      data.setDate(data.getDate() + i);
      dias.push({ data, outroMes: true });
    }
    
    return dias;
  };

  const navegarMes = (direcao: number) => {
    setMesAtual(prev => new Date(prev.getFullYear(), prev.getMonth() + direcao, 1));
  };

  const obterAulasDoDia = (data: Date) => {
    return aulasDoMes.filter(aula => {
      const dataAula = new Date(aula.dataAula);
      return dataAula.toDateString() === data.toDateString();
    });
  };

  const diasCalendario = gerarDiasCalendario();
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🗓️ Calendário de Aulas</h2>
        <p className="text-gray-600">{aulasDoMes.length} aula{aulasDoMes.length !== 1 ? 's' : ''} este mês</p>
      </div>

      {/* Navegação do calendário */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navegarMes(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Anterior
          </button>
          <h3 className="text-xl font-semibold">
            {nomesMeses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </h3>
          <button
            onClick={() => navegarMes(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Próximo →
          </button>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
            <div key={dia} className="p-2 text-center text-sm font-medium text-gray-600">
              {dia}
            </div>
          ))}
        </div>

        {/* Dias do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {diasCalendario.map((dia, index) => {
            const aulasDoDia = obterAulasDoDia(dia.data);
            const temAulas = aulasDoDia.length > 0;
            
            return (
              <div
                key={index}
                className={`min-h-[80px] p-1 border border-gray-200 ${
                  dia.outroMes ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } ${temAulas ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
                onClick={() => temAulas && setAulaDetalhes(aulasDoDia[0])}
              >
                <div className="text-sm font-medium mb-1">
                  {dia.data.getDate()}
                </div>
                {aulasDoDia.map((aula, aulaIndex) => (
                  <div
                    key={aulaIndex}
                    className={`text-xs p-1 mb-1 rounded truncate ${
                      aula.aulaConcluida 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}
                    title={`${aula.materia.nomeMateria} - ${aula.horario}`}
                  >
                    {aula.horario} {aula.materia.nomeMateria}
                  </div>
                ))}
                {aulasDoDia.length > 1 && (
                  <div className="text-xs text-gray-500">
                    +{aulasDoDia.length - 1} mais
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de aulas do mês */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Aulas do Mês</h3>
        </div>
        {aulasDoMes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma aula programada</h3>
            <p className="text-gray-600">Não há aulas programadas para este mês.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {aulasDoMes
              .sort((a, b) => new Date(a.dataAula).getTime() - new Date(b.dataAula).getTime())
              .map((aula) => (
              <div key={aula.idAula} className="p-4 hover:bg-gray-50 cursor-pointer"
                   onClick={() => setAulaDetalhes(aula)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{aula.materia.nomeMateria}</h4>
                    <p className="text-sm text-gray-600">{aula.turma.nomeTurma}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(aula.dataAula).toLocaleDateString('pt-BR')} às {aula.horario}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    aula.aulaConcluida 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {aula.aulaConcluida ? 'Concluída' : 'Programada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes da aula */}
      {aulaDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
             onClick={() => setAulaDetalhes(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Detalhes da Aula</h3>
              <button
                onClick={() => setAulaDetalhes(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Matéria</p>
                <p className="font-medium">{aulaDetalhes.materia.nomeMateria}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Turma</p>
                <p className="font-medium">{aulaDetalhes.turma.nomeTurma}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data e Horário</p>
                <p className="font-medium">
                  {new Date(aulaDetalhes.dataAula).toLocaleDateString('pt-BR')} às {aulaDetalhes.horario}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  aulaDetalhes.aulaConcluida 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {aulaDetalhes.aulaConcluida ? 'Aula Concluída' : 'Aula Programada'}
                </span>
              </div>
              
              {aulaDetalhes.aulaConcluida && aulaDetalhes.conteudoMinistrado && (
                <div>
                  <p className="text-sm text-gray-600">Conteúdo Ministrado</p>
                  <p className="text-sm">{aulaDetalhes.conteudoMinistrado}</p>
                </div>
              )}
              
              {aulaDetalhes.observacoesAula && (
                <div>
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="text-sm">{aulaDetalhes.observacoesAula}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
