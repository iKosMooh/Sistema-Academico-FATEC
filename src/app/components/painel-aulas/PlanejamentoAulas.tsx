'use client';
import { useState, useEffect } from "react";
import { useAppContext } from "./AppContext";
import { PlanejamentoAulaModal } from "./PlanejamentoAulaModal";
import { format } from "date-fns";

interface Aula {
  idAula: number;
  titulo: string;
  dataAula: string;
  horario: string;
  duracao: string;
  status: "prevista" | "ministrada" | "pendente" | "adiada";
  conteudo: string;
  aulaConcluida: boolean;
  materia: { nomeMateria: string };
  planejamento?: string;
  metodologia?: string;
}

interface Feriado {
  id: number;
  data: string;
  descricao?: string;
}

interface PlanejamentoDados {
  idAula: number;
  planejamento: string;
  metodologia: string;
}

interface DocAula {
  src: string;
  [key: string]: string | number | boolean | null | undefined;
}

export function PlanejamentoAulas({ reloadFlag }: { reloadFlag?: number }) {
  const { turma } = useAppContext();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth());
  const anoAtual = new Date().getFullYear();
  const [modalPlanejamento, setModalPlanejamento] = useState(false);
  const [aulaSelected, setAulaSelected] = useState<Aula | null>(null);

  // Carrega aulas
  useEffect(() => {
    if (turma) {
      console.log('Buscando aulas para turma:', turma.id);
      fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "aula",
          relations: { materia: true, turma: true },
          where: { idTurma: Number(turma.id) }
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          console.log('Resultado da busca de aulas:', result);
          if (result.success && result.data) {
            type AulaApi = {
              idAula: number;
              idTurma: number;
              dataAula: string;
              horario?: string;
              duracaoMinutos?: number;
              aulaConcluida?: boolean;
              presencasAplicadas?: boolean;
              observacoes?: string;
              descricao?: string;
              planejamento?: string;
              metodologia?: string;
              materia?: { nomeMateria?: string };
            };

            const aulasFormatadas = result.data
              .filter((a: AulaApi) => a.idTurma === Number(turma.id))
              .map((a: AulaApi) => ({
                idAula: a.idAula,
                titulo: a.materia?.nomeMateria || a.descricao || "Aula",
                dataAula: a.dataAula,
                horario: a.horario || a.dataAula?.slice(11, 16) || "",
                duracao: a.duracaoMinutos ? `${a.duracaoMinutos} min` : "—",
                status: a.aulaConcluida
                  ? "ministrada"
                  : a.presencasAplicadas
                  ? "pendente"
                  : "prevista",
                conteudo: a.observacoes || "",
                aulaConcluida: !!a.aulaConcluida,
                materia: { nomeMateria: a.materia?.nomeMateria || a.descricao || "Aula" },
                planejamento: a.planejamento || "",
                metodologia: a.metodologia || "",
              }));
            
            console.log('Aulas formatadas:', aulasFormatadas);
            setAulas(aulasFormatadas);
          } else {
            console.error('Erro ao buscar aulas:', result.error);
            setAulas([]);
          }
        })
        .catch(error => {
          console.error('Erro na requisição de aulas:', error);
          setAulas([]);
        });
    } else {
      setAulas([]);
    }
  }, [turma, mesAtual, reloadFlag]);

  // Carrega feriados
  useEffect(() => {
    fetch("/api/dias-nao-letivos", { method: "GET" })
      .then((res) => {
        if (res.ok) return res.text();
        if (res.status === 405) return "[]";
        return "[]";
      })
      .then((text) => {
        try {
          const result = JSON.parse(text);
          if (Array.isArray(result)) setFeriados(result);
          else setFeriados([]);
        } catch {
          setFeriados([]);
        }
      })
      .catch(() => setFeriados([]));
  }, [turma, mesAtual]);

  function getDaysOfMonth(year: number, month: number) {
    const days: Date[] = [];
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  // Helper para saber se é feriado
  function getFeriado(dateStr: string) {
    return feriados.find((f: Feriado) => f.data.slice(0, 10) === dateStr);
  }

  const handleAulaClick = (aula: Aula) => {
    setAulaSelected(aula);
  };

  const handlePlanejamento = () => {
    if (aulaSelected) {
      setModalPlanejamento(true);
    }
  };

  const handleSavePlanejamento = async (dados: PlanejamentoDados) => {
    try {
      console.log('Salvando planejamento:', dados);
      console.log('ID da aula sendo enviado:', dados.idAula);
      
      const response = await fetch("/api/planejamento-aula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          idAula: dados.idAula,
          planejamento: dados.planejamento,
          metodologia: dados.metodologia,
        }),
      });

      const result = await response.json();
      console.log('Resultado do save:', result);
      
      if (result.success) {
        alert("Planejamento salvo com sucesso!");
        // Recarregar aulas
        if (turma) {
          const updatedAulas = aulas.map(aula => 
            aula.idAula === dados.idAula 
              ? { ...aula, planejamento: dados.planejamento, metodologia: dados.metodologia }
              : aula
          );
          setAulas(updatedAulas);
          setAulaSelected(null);
        }
      } else {
        console.error('Erro no resultado:', result);
        console.error('Detalhes do erro:', result.details);
        alert("Erro ao salvar planejamento: " + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar planejamento");
    }
  };

  // Função para carregar arquivos
  const loadArquivosPlanejamento = async (idAula: number) => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "aula",
          relations: { docsAula: true },
          where: { idAula: idAula }
        }),
      });

      const result = await response.json();
      
      if (result.success && result.data.docsAula) {
        const arquivos = result.data.docsAula.filter((doc: DocAula) => 
          doc.src.includes('/planejamento/')
        );
        
        if (arquivos.length > 0) {
          let mensagem = "Arquivos anexados:\n\n";
          arquivos.forEach((arquivo: DocAula, index: number) => {
            const nomeArquivo = arquivo.src.split('/').pop();
            mensagem += `${index + 1}. ${nomeArquivo}\n`;
          });
          mensagem += "\nPara baixar ou gerenciar os arquivos, acesse o modal de edição.";
          alert(mensagem);
        } else {
          alert("Nenhum arquivo anexado encontrado para este planejamento.");
        }
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      alert('Erro ao carregar arquivos anexados.');
    }
  };

  // Calcular dias do calendário
  const daysOfMonth = getDaysOfMonth(anoAtual, mesAtual);
  const firstDayOfWeek = new Date(anoAtual, mesAtual, 1).getDay();
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  if (!turma) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">
          Planejamento de Aulas
        </h2>
        <p className="text-white">Selecione uma turma para visualizar o planejamento de aulas.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Planejamento de Aulas - {turma.nome}
      </h2>

      {/* Aula selecionada e botão de planejamento */}
      {aulaSelected && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-800">
                Aula Selecionada: {aulaSelected.titulo} (ID: {aulaSelected.idAula})
              </h3>
              <p className="text-blue-600">
                {new Date(aulaSelected.dataAula).toLocaleDateString('pt-BR')} - {aulaSelected.horario}
              </p>
              {aulaSelected.planejamento && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-blue-700 font-semibold">
                    ✓ Planejamento já existe
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-700">
                      <strong>Conteúdo:</strong> {aulaSelected.planejamento.substring(0, 100)}
                      {aulaSelected.planejamento.length > 100 && '...'}
                    </p>
                    {aulaSelected.metodologia && (
                      <p className="text-sm text-gray-700 mt-1">
                        <strong>Metodologia:</strong> {aulaSelected.metodologia.substring(0, 100)}
                        {aulaSelected.metodologia.length > 100 && '...'}
                      </p>
                    )}
                  </div>
                  {/* Botão para ver arquivos */}
                  <button
                    onClick={() => loadArquivosPlanejamento(aulaSelected.idAula)}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    📎 Ver Arquivos Anexados
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePlanejamento}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {aulaSelected.planejamento ? 'Editar Planejamento' : 'Planejar Aula'}
              </button>
              <button
                onClick={() => setAulaSelected(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-900"
            onClick={() => setMesAtual((m) => (m === 0 ? 11 : m - 1))}
          >
            {"<"}
          </button>
          <div className="text-lg font-bold text-white">
            {meses[mesAtual]} {anoAtual}
          </div>
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-900"
            onClick={() => setMesAtual((m) => (m === 11 ? 0 : m + 1))}
          >
            {">"}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs bg-gray-100 rounded-t">
          <div className="text-center font-semibold py-1 text-gray-900">Dom</div>
          <div className="text-center font-semibold py-1 text-gray-900">Seg</div>
          <div className="text-center font-semibold py-1 text-gray-900">Ter</div>
          <div className="text-center font-semibold py-1 text-gray-900">Qua</div>
          <div className="text-center font-semibold py-1 text-gray-900">Qui</div>
          <div className="text-center font-semibold py-1 text-gray-900">Sex</div>
          <div className="text-center font-semibold py-1 text-gray-900">Sáb</div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs bg-white rounded-b shadow p-2">
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
          {daysOfMonth.map((date) => {
            const dataStr = format(date, "yyyy-MM-dd");
            const aulasDoDia = aulas.filter(
              (a) => a.dataAula.slice(0, 10) === dataStr
            );
            const feriado = getFeriado(dataStr);

            return (
              <div
                key={dataStr}
                className={`min-h-[48px] border rounded flex flex-col items-center justify-start p-1 relative group transition-all duration-150
                  ${feriado ? "bg-red-100 border-red-400" : ""}
                `}
                style={{ zIndex: 1 }}
              >
                <span
                  className={`text-gray-900 ${feriado ? "text-red-700 font-bold" : ""}`}
                >
                  {date.getDate()}
                </span>
                
                {feriado && (
                  <span className="block text-xs text-red-700 font-semibold mb-1">
                    {feriado.descricao || "Feriado"}
                  </span>
                )}

                {aulasDoDia.map((a) => {
                  let cor = "bg-blue-700 text-white";
                  let label = "";
                  const isSelected = aulaSelected?.idAula === a.idAula;
                  
                  if (feriado) {
                    cor = "bg-red-600 text-white";
                    label = "Cancelada";
                  } else if (a.aulaConcluida) {
                    cor = "bg-green-600 text-white";
                    label = "Concluída";
                  } else {
                    cor = "bg-blue-700 text-white";
                    label = "Pendente";
                  }

                  if (isSelected) {
                    cor += " ring-2 ring-yellow-400";
                  }

                  return (
                    <span
                      key={a.idAula}
                      className={`mt-1 px-1 py-0.5 rounded text-xs w-full text-center truncate ${cor} cursor-pointer hover:opacity-80 transition-all`}
                      title={`ID: ${a.idAula} - ${a.titulo} ${a.horario} - Clique para selecionar`}
                      onClick={() => handleAulaClick(a)}
                    >
                      <div className="text-xs opacity-70">#{a.idAula}</div>
                      {a.titulo} {a.horario}
                      <br />
                      <span className="text-xs font-bold">
                        ({label})
                      </span>
                      {a.planejamento && (
                        <span className="block text-xs">📋</span>
                      )}
                    </span>
                  );
                })}

                {feriado && aulasDoDia.length === 0 && (
                  <span className="mt-1 px-1 py-0.5 rounded text-xs w-full text-center truncate bg-red-600 text-white font-bold">
                    Cancelada (Feriado)
                  </span>
                )}

                {(aulasDoDia.length > 0 || feriado) && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 z-50 hidden group-hover:flex flex-col min-w-[180px] max-w-xs bg-white border border-blue-400 shadow-xl rounded p-3 text-xs text-gray-900 transition-all duration-150"
                    style={{
                      transform: "translate(-50%, -110%) scale(1.08)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                      minHeight: "60px",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      className={`font-semibold mb-1 ${
                        feriado ? "text-red-700" : "text-blue-700"
                      }`}
                    >
                      {format(date, "dd/MM/yyyy")}
                    </div>
                    {feriado && (
                      <div className="mb-2 text-red-700 font-semibold">
                        {feriado.descricao || "Feriado/Dia Não Letivo"}
                      </div>
                    )}
                    {aulasDoDia.map((a) => (
                      <div key={a.idAula} className="mb-2 last:mb-0">
                        <div className="font-bold text-gray-900">{a.titulo}</div>
                        <div className="text-gray-900">
                          Horário: {a.horario}
                          {a.duracao && <> | Duração: {a.duracao}</>}
                          {feriado ? (
                            <span className="ml-2 text-red-700 font-semibold">
                              (Cancelada)
                            </span>
                          ) : a.aulaConcluida ? (
                            <span className="ml-2 text-green-700 font-semibold">
                              (Concluída)
                            </span>
                          ) : (
                            <span className="ml-2 text-blue-700 font-semibold">
                              (Pendente)
                            </span>
                          )}
                        </div>
                        {a.planejamento && (
                          <div className="mt-1 text-blue-600">
                            <strong>Planejado:</strong> {a.planejamento.substring(0, 50)}...
                          </div>
                        )}
                        {a.conteudo && (
                          <div className="mt-1 whitespace-pre-line break-words text-gray-900">
                            <strong>Conteúdo:</strong> {a.conteudo.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Instruções */}
      <div className="mt-6 text-center text-white">
        <p className="text-sm">
          Clique em uma aula no calendário para selecioná-la e depois clique em &quot;Planejar Aula&quot; para criar o planejamento.
        </p>
        <p className="text-xs mt-2 text-gray-300">
          📋 = Aula já possui planejamento
        </p>
      </div>

      <PlanejamentoAulaModal
        isOpen={modalPlanejamento}
        onClose={() => {
          setModalPlanejamento(false);
          setAulaSelected(null);
        }}
        aula={aulaSelected}
        onSave={handleSavePlanejamento}
      />
    </div>
  );
}