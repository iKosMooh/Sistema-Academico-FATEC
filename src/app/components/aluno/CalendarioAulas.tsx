"use client";

import { useState, useEffect } from "react";

interface DocsAula {
  idDocAula: number;
  src: string;
  nomeArquivo?: string;
}

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
  docsAula?: DocsAula[]; // Nova propriedade
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
  const [arquivosAula, setArquivosAula] = useState<DocsAula[]>([]);
  const [carregandoArquivos, setCarregandoArquivos] = useState(false);

  // Buscar arquivos da aula quando modal é aberto
  useEffect(() => {
    const buscarArquivosAula = async () => {
      if (!aulaDetalhes) {
        setArquivosAula([]);
        return;
      }

      setCarregandoArquivos(true);
      try {
        const response = await fetch(`/api/aulas/arquivos?idAula=${aulaDetalhes.idAula}`);
        const result = await response.json();
        
        if (result.success) {
          setArquivosAula(result.data || []);
        } else {
          console.error('Erro ao buscar arquivos:', result.error);
          setArquivosAula([]);
        }
      } catch (error) {
        console.error('Erro ao buscar arquivos da aula:', error);
        setArquivosAula([]);
      } finally {
        setCarregandoArquivos(false);
      }
    };

    buscarArquivosAula();
  }, [aulaDetalhes]);

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
    return aulas.filter(aula => {
      const dataAula = new Date(aula.dataAula);
      return dataAula.toDateString() === data.toDateString();
    });
  };

  const diasCalendario = gerarDiasCalendario();
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const baixarArquivo = (arquivo: DocsAula) => {
    // Criar link para download
    const link = document.createElement('a');
    link.href = arquivo.src;
    link.download = arquivo.nomeArquivo || `arquivo_${arquivo.idDocAula}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const obterNomeArquivo = (src: string) => {
    return src.split('/').pop() || 'arquivo';
  };

  const obterTipoArquivo = (src: string) => {
    const extensao = src.split('.').pop()?.toLowerCase();
    switch (extensao) {
      case 'pdf': return { tipo: 'PDF', cor: 'text-red-600', icone: '📄' };
      case 'doc':
      case 'docx': return { tipo: 'Word', cor: 'text-blue-600', icone: '📝' };
      case 'ppt':
      case 'pptx': return { tipo: 'PowerPoint', cor: 'text-orange-600', icone: '📊' };
      case 'xls':
      case 'xlsx': return { tipo: 'Excel', cor: 'text-green-600', icone: '📈' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return { tipo: 'Imagem', cor: 'text-purple-600', icone: '🖼️' };
      case 'mp4':
      case 'avi':
      case 'mov': return { tipo: 'Vídeo', cor: 'text-pink-600', icone: '🎥' };
      default: return { tipo: 'Arquivo', cor: 'text-gray-600', icone: '📎' };
    }
  };

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
          <h3 className="text-xl font-semibold text-gray-900">
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
        <div className="grid grid-cols-7 gap-1 text-gray-900">
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

      {/* Modal de detalhes da aula - ATUALIZADO */}
      {aulaDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
             onClick={() => setAulaDetalhes(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detalhes da Aula</h3>
              <button
                onClick={() => setAulaDetalhes(null)}
                className="text-white hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-gray-900">
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

              {/* Seção de Arquivos da Aula - NOVA */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-gray-900">📎 Materiais da Aula</h4>
                  {carregandoArquivos && (
                    <div className="text-sm text-gray-500">Carregando...</div>
                  )}
                </div>
                
                {carregandoArquivos ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : arquivosAula.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-2xl mb-2">📚</div>
                    <p className="text-sm">Nenhum material disponível para esta aula</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {arquivosAula.map((arquivo) => {
                      const tipoArquivo = obterTipoArquivo(arquivo.src);
                      return (
                        <div
                          key={arquivo.idDocAula}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{tipoArquivo.icone}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {obterNomeArquivo(arquivo.src)}
                              </p>
                              <p className={`text-xs ${tipoArquivo.cor}`}>
                                {tipoArquivo.tipo}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => baixarArquivo(arquivo)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Baixar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
