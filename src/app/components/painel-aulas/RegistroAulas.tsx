'use client';
import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "./AppContext";
import { Modal } from "./Modal";
import { useSession } from "next-auth/react";

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
  conteudoMinistrado?: string;
  metodologiaAplicada?: string;
  observacoesAula?: string;
}

interface Aluno {
  idAluno: number;
  nomeAluno: string;
  presente?: boolean;
}

interface RegistroPresencaData {
  idAula: number;
  presencas: { idAluno: number; presente: boolean }[];
  conteudoMinistrado: string;
  metodologiaAplicada: string;
  observacoesAula: string;
  idProfessor: string;
}

interface PresencaAPI {
  idPresenca: number;
  idAula: number;
  idAluno: number;
  idProfessor: string;
  presente: boolean;
  justificativa?: string;
  dataRegistro: string;
}

interface AulaAPI {
  idAula: number;
  idTurma: number;
  dataAula: string;
  horario: string;
  titulo?: string;
  duracao?: string;
  conteudo?: string;
  planejamento?: string;
  metodologia?: string;
  conteudoMinistrado?: string;
  metodologiaAplicada?: string;
  observacoesAula?: string;
  materia?: { nomeMateria?: string };
  presencasAplicadas?: boolean;
  aulaConcluida?: boolean;
}

interface TurmaAlunoAPI {
  idAluno: number;
  aluno?: {
    nome?: string;
    sobrenome?: string;
    cpf?: string;
  };
}

interface TurmaAlunoResponse {
  aluno: {
    idAluno: number;
    nome: string;
    sobrenome: string;
  };
}

export function RegistroAulas() {
  const { turma } = useAppContext();
  const { data: session } = useSession();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [modalPresenca, setModalPresenca] = useState(false);
  const [aulaSelected, setAulaSelected] = useState<Aula | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [conteudoMinistrado, setConteudoMinistrado] = useState('');
  const [metodologiaAplicada, setMetodologiaAplicada] = useState('');
  const [observacoesAula, setObservacoesAula] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [loading, setLoading] = useState(false);
  // Função para carregar aulas
  const carregarAulas = useCallback(async () => {
    if (!turma?.id) {
      setAulas([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "aula",
          relations: { materia: true },
        }),
      });
      const result = await res.json();
      if (result.success) {
        setAulas(
          (result.data as AulaAPI[])
            .filter((a: AulaAPI) => String(a.idTurma) === String(turma.id))
            .map((a: AulaAPI) => ({
              idAula: a.idAula,
              titulo: a.titulo || '',
              dataAula: a.dataAula,
              horario: a.horario,
              duracao: a.duracao || '',
              status: a.aulaConcluida ? 'ministrada' : 'pendente' as "prevista" | "ministrada" | "pendente" | "adiada",
              conteudo: a.conteudo || '',
              aulaConcluida: !!a.aulaConcluida,
              materia: { nomeMateria: a.materia?.nomeMateria || '' },
              planejamento: a.planejamento,
              metodologia: a.metodologia,
              conteudoMinistrado: a.conteudoMinistrado,
              metodologiaAplicada: a.metodologiaAplicada,
              observacoesAula: a.observacoesAula,
            }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [turma?.id]); // Adicionada dependência turma.id

  // Carrega aulas da turma
  useEffect(() => {
    carregarAulas();
  }, [carregarAulas]); // Atualizado para usar carregarAulas como dependência

  // Carrega alunos vinculados à turma
  useEffect(() => {
    const fetchAlunos = async () => {
      if (!turma?.id) {
        setAlunos([]);
        return;
      }

      try {
        const response = await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "get",
            table: "turmaAluno",
            relations: { aluno: true },
            where: { idTurma: Number(turma.id) },
          }),
        });

        const result = await response.json();
        
        if (result.success && result.data) {
          setAlunos(
            result.data
              .filter((ta: TurmaAlunoAPI) => ta.aluno)
              .map((ta: TurmaAlunoAPI) => ({
                idAluno: ta.idAluno,
                nomeAluno: ta.aluno?.nome ?? "",
                sobrenome: ta.aluno?.sobrenome ?? "",
                cpf: ta.aluno?.cpf ?? "",
              }))
          );
        } else {
          console.error('Erro ao buscar alunos:', result.error);
          setAlunos([]);
        }
      } catch (error) {
        console.error('Erro na requisição de alunos:', error);
        setAlunos([]);
      }
    };

    fetchAlunos();
  }, [turma]);

  // Função removerPresenca removida pois não está sendo utilizada.

  // Permite editar presenças mesmo para aulas já aplicadas
  // (não desabilite o checkbox e sempre permita togglePresenca)
  // O botão "Aplicar Presença para Selecionadas" pode ser usado para editar qualquer aula, inclusive já aplicada


  const handleAulaClick = (aula: Aula) => {
    setAulaSelected(aula);
    setConteudoMinistrado(aula.conteudoMinistrado || '');
    setMetodologiaAplicada(aula.metodologiaAplicada || '');
    setObservacoesAula(aula.observacoesAula || '');
  };

  const handleRegistrarPresenca = async () => {
    if (aulaSelected && turma) {
      try {
        // Buscar alunos da turma
        const res = await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "get",
            table: "turmaAluno",
            relations: { aluno: true },
            where: { idTurma: Number(turma.id) }
          }),
        });

        const result = await res.json();
        
        if (result.success && result.data) {
          // Buscar presenças existentes para esta aula (se houver)
          const presencasExistentes = await fetch("/api/crud", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation: "get",
              table: "presencas",
              where: { idAula: aulaSelected.idAula }
            }),
          }).then(res => res.json());

          const presencasMap = new Map<number, boolean>();
          if (presencasExistentes.success && presencasExistentes.data) {
            (presencasExistentes.data as PresencaAPI[]).forEach((presenca: PresencaAPI) => {
              presencasMap.set(presenca.idAluno, presenca.presente);
            });
          }

          const alunosFormatados = (result.data as TurmaAlunoResponse[]).map((ta: TurmaAlunoResponse) => ({
            idAluno: ta.aluno.idAluno,
            nomeAluno: `${ta.aluno.nome} ${ta.aluno.sobrenome}`,
            presente: presencasMap.get(ta.aluno.idAluno) ?? false // Usar presença existente ou false como padrão
          }));
          
          setAlunos(alunosFormatados);
          setModalPresenca(true);
        }
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        alert('Erro ao carregar alunos da turma');
      }
    }
  };

  const handlePresencaChange = (idAluno: number, presente: boolean) => {
    setAlunos(prev => prev.map(aluno => 
      aluno.idAluno === idAluno ? { ...aluno, presente } : aluno
    ));
  };

  const handleSalvarPresenca = async () => {
    if (!aulaSelected) return;

    const idProfessor = session?.user?.cpf || "";
    
    if (!idProfessor) {
      alert("Não foi possível identificar o professor. Faça login novamente.");
      return;
    }

    // Verificar se pelo menos um aluno tem presença definida
    const presencasDefinidas = alunos.filter(aluno => aluno.presente !== undefined);
    if (presencasDefinidas.length === 0) {
      alert("Marque a presença de pelo menos um aluno.");
      return;
    }

    setSalvando(true);
    try {
      const dadosRegistro: RegistroPresencaData = {
        idAula: aulaSelected.idAula,
        presencas: alunos.map(aluno => ({
          idAluno: aluno.idAluno,
          presente: aluno.presente !== undefined ? aluno.presente : false
        })),
        conteudoMinistrado: conteudoMinistrado.trim(),
        metodologiaAplicada: metodologiaAplicada.trim(),
        observacoesAula: observacoesAula.trim(),
        idProfessor
      };

      console.log('Enviando dados:', dadosRegistro);

      const response = await fetch("/api/registro-aula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosRegistro),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Sucesso! ${result.message}`);
        setModalPresenca(false);
        setAulaSelected(null);
        // Limpar campos
        setConteudoMinistrado('');
        setMetodologiaAplicada('');
        setObservacoesAula('');
        setAlunos([]);
        // Recarregar aulas para mostrar status atualizado
        await carregarAulas();
      } else {
        alert("Erro ao salvar registro: " + (result.error || 'Erro desconhecido'));
        if (result.details) {
          console.error('Detalhes do erro:', result.details);
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar registro da aula. Verifique sua conexão e tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Registro de Aulas e Frequência - {turma?.nome || 'Selecione uma turma'}
      </h2>

      {!turma && (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">Selecione uma turma para visualizar as aulas</p>
        </div>
      )}

      {turma && (
        <>
          {/* Lista de Aulas */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Aulas da Turma</h3>
            
            {loading ? (
              <p className="text-gray-600">Carregando aulas...</p>
            ) : aulas.length === 0 ? (
              <p className="text-gray-600">Nenhuma aula encontrada para esta turma.</p>
            ) : (
              <div className="space-y-3">
                {aulas.map((aula) => (
                  <div 
                    key={aula.idAula}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      aulaSelected?.idAula === aula.idAula 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAulaClick(aula)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {aula.materia.nomeMateria}
                        </h4>
                        <p className="text-gray-600">
                          {new Date(aula.dataAula).toLocaleDateString('pt-BR')} - {aula.horario}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            aula.aulaConcluida 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {aula.aulaConcluida ? 'Concluída' : 'Pendente'}
                          </span>
                          {aula.planejamento && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                              📋 Planejada
                            </span>
                          )}
                          {aula.conteudoMinistrado && (
                            <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                              ✅ Registrada
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="bg-white text-white font-bold border border-white px-4 py-2 rounded-xl shadow hover:bg-green-50 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAulaClick(aula);
                        }}
                      >
                        Selecionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aula selecionada */}
          {aulaSelected && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800">
                    Aula Selecionada: {aulaSelected.materia.nomeMateria}
                  </h3>
                  <p className="text-green-600 mb-3">
                    {new Date(aulaSelected.dataAula).toLocaleDateString('pt-BR')} - {aulaSelected.horario}
                  </p>
                  
                  {/* Mostrar planejamento vs realizado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aulaSelected.planejamento && (
                      <div className="bg-blue-50 p-3 rounded border">
                        <h4 className="font-semibold text-blue-700 mb-2">📋 Planejado:</h4>
                        <p className="text-sm text-gray-700">{aulaSelected.planejamento}</p>
                        {aulaSelected.metodologia && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Metodologia:</strong> {aulaSelected.metodologia}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {aulaSelected.conteudoMinistrado && (
                      <div className="bg-green-50 p-3 rounded border">
                        <h4 className="font-semibold text-green-700 mb-2">✅ Ministrado:</h4>
                        <p className="text-sm text-gray-700">{aulaSelected.conteudoMinistrado}</p>
                        {aulaSelected.metodologiaAplicada && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Como foi aplicado:</strong> {aulaSelected.metodologiaAplicada}
                          </p>
                        )}
                        {aulaSelected.observacoesAula && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Observações:</strong> {aulaSelected.observacoesAula}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {aulaSelected.aulaConcluida && (
                    <p className="text-sm text-green-700 mt-2 font-semibold">
                      ✓ Aula já registrada com presença
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={handleRegistrarPresenca}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-green-700 transition-colors"
                  >
                    {aulaSelected.aulaConcluida ? 'Editar Registro' : 'Registrar Aula'}
                  </button>
                  <button
                    onClick={() => setAulaSelected(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Registro de Presença */}
      <Modal 
        isOpen={modalPresenca} 
        onClose={() => setModalPresenca(false)} 
        title={`Registro da Aula - ${aulaSelected?.titulo}`}
      >
        <div className="space-y-6">
          {/* Informações da Aula */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              {aulaSelected?.materia.nomeMateria}
            </h3>
            <p className="text-blue-600">
              {aulaSelected && new Date(aulaSelected.dataAula).toLocaleDateString('pt-BR')} - {aulaSelected?.horario}
            </p>
          </div>

          {/* Registro do Conteúdo Ministrado */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">📚 O que foi ministrado nesta aula?</h4>
            
            <div>
              <label htmlFor="conteudoMinistrado" className="block text-sm font-medium mb-2 text-gray-700">
                Conteúdo realmente abordado
              </label>
              <textarea
                id="conteudoMinistrado"
                value={conteudoMinistrado}
                onChange={(e) => setConteudoMinistrado(e.target.value)}
                rows={4}
                className="w-full border border-blue-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                placeholder="Descreva o que realmente foi ensinado nesta aula..."
              />
            </div>

            <div>
              <label htmlFor="metodologiaAplicada" className="block text-sm font-medium mb-2 text-gray-700">
                Como a aula foi desenvolvida
              </label>
              <textarea
                id="metodologiaAplicada"
                value={metodologiaAplicada}
                onChange={(e) => setMetodologiaAplicada(e.target.value)}
                rows={3}
                className="w-full border border-blue-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                placeholder="Metodologia aplicada, recursos utilizados, dinâmica da aula..."
              />
            </div>

            <div>
              <label htmlFor="observacoesAula" className="block text-sm font-medium mb-2 text-gray-700">
                Observações gerais
              </label>
              <textarea
                id="observacoesAula"
                value={observacoesAula}
                onChange={(e) => setObservacoesAula(e.target.value)}
                rows={2}
                className="w-full border border-blue-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                placeholder="Dificuldades encontradas, participação dos alunos, ajustes necessários..."
              />
            </div>
          </div>

          {/* Lista de Presença */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">👥 Lista de Presença</h4>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {alunos.map((aluno) => (
                <div 
                  key={aluno.idAluno}
                  className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <span className="text-gray-700">{aluno.nomeAluno}</span>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`presenca-${aluno.idAluno}`}
                        checked={aluno.presente === true}
                        onChange={() => handlePresencaChange(aluno.idAluno, true)}
                        className="text-green-600"
                      />
                      <span className="text-green-600 font-medium">Presente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`presenca-${aluno.idAluno}`}
                        checked={aluno.presente === false}
                        onChange={() => handlePresencaChange(aluno.idAluno, false)}
                        className="text-red-600"
                      />
                      <span className="text-red-600 font-medium">Ausente</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setModalPresenca(false)}
                        disabled={salvando}
                        className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl hover:bg-gray-600 disabled:opacity-50 font-semibold shadow"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSalvarPresenca}
                        disabled={salvando}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-600 disabled:opacity-50 font-semibold shadow flex items-center justify-center"
                      >
                        {salvando ? (
                          <>
                            <span>Salvando...</span>
                          </>
                        ) : (
                          'Salvar Registro'
                        )}
                      </button>
                    </div>
                  </div>
                </Modal>
              </div>
            );
          }