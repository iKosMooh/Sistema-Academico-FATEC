import { NextResponse } from "next/server";
import { z } from 'zod';
import prisma from "@/lib/prisma";
import { Decimal } from '@prisma/client/runtime/library';

// Schemas de validação com Zod
const RequestSchema = z.object({
  idTurma: z.union([z.string(), z.number()]).transform(val => Number(val))
});

interface NotaAPI {
  idNota: number;
  nome: string;
  valorNota: Decimal | number | string;
  tipoAvaliacao: string;
  dataLancamento: Date;
  aluno: {
    nome: string;
    sobrenome: string;
  };
}

interface PresencaAPI {
  idPresenca: number;
  idAula: number;
  idAluno: number;
  presente: boolean;
  aluno: {
    idAluno: number;
    nome: string;
    sobrenome: string;
  };
}

interface TurmaAlunoAPI {
  statusMatricula?: string;
  aluno: {
    idAluno: number;
    nome: string;
    sobrenome: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idTurma } = RequestSchema.parse(body);
    
    console.log('Dashboard da turma:', idTurma);

    const [turmaInfo, alunos, notasLancadas, presencasData] = await Promise.all([
      prisma.turmas.findUnique({
        where: { idTurma },
        include: { curso: true }
      }),
      prisma.turmaAluno.findMany({
        where: { idTurma },
        include: { 
          aluno: {
            select: {
              idAluno: true,
              nome: true,
              sobrenome: true
            }
          }
        }
      }),
      prisma.notas.findMany({
        where: { idTurma },
        include: {
          aluno: {
            select: {
              nome: true,
              sobrenome: true
            }
          }
        },
        orderBy: {
          dataLancamento: 'desc'
        }
      }),
      // Buscar presenças das aulas desta turma
      prisma.presencas.findMany({
        include: {
          aula: {
            select: { idAula: true, idTurma: true }
          },
          aluno: {
            select: {
              idAluno: true,
              nome: true,
              sobrenome: true
            }
          }
        },
        where: {
          aula: {
            idTurma: idTurma
          }
        }
      })
    ]);

    if (!turmaInfo) {
      return NextResponse.json({
        success: false,
        error: 'Turma não encontrada'
      }, { status: 404 });
    }

    // Filtrar apenas presenças desta turma
    const presencasFiltradas = presencasData.filter(p => p.aula?.idTurma === idTurma);

    // Processar notas com tratamento específico para Decimal
    const notasValidadas = notasLancadas.map((nota: NotaAPI) => {
      let valorNota: number;
      
      try {
        if (nota.valorNota instanceof Decimal) {
          valorNota = nota.valorNota.toNumber();
        } else if (typeof nota.valorNota === 'number') {
          valorNota = nota.valorNota;
        } else if (typeof nota.valorNota === 'string') {
          valorNota = parseFloat(nota.valorNota);
        } else {
          // Fallback para outros tipos - tentar converter para string
          valorNota = parseFloat(String(nota.valorNota));
        }
        
        if (isNaN(valorNota)) {
          valorNota = 0;
        }
        
      } catch (error) {
        console.error('Erro ao processar valorNota:', error, nota.valorNota);
        valorNota = 0;
      }
      
      return {
        ...nota,
        valorNota
      };
    });

    // Calcular dados de frequência
    const frequenciaData = calcularFrequencia(presencasFiltradas, alunos);

    return NextResponse.json({
      success: true,
      data: {
        turma: {
          id: turmaInfo.idTurma,
          nome: turmaInfo.nomeTurma,
          anoLetivo: turmaInfo.anoLetivo,
          curso: { nome: turmaInfo.curso?.nomeCurso || 'Curso não encontrado' }
        },
        alunos: {
          total: alunos.length,
          ativos: alunos.filter(a => a.statusMatricula === 'Ativa').length,
          dados: alunos.map(a => ({
            idAluno: a.aluno.idAluno,
            nome: a.aluno.nome,
            sobrenome: a.aluno.sobrenome
          }))
        },
        notas: {
          mediaGeral: calcularMediaGeral(notasValidadas),
          distribuicao: calcularDistribuicaoNotas(notasValidadas),
          aprovados: notasValidadas.filter(n => n.valorNota >= 6).length
        },
        frequencia: frequenciaData,
        presencas: presencasFiltradas.map(p => ({
          idPresenca: p.idPresenca,
          idAula: p.idAula,
          idAluno: p.idAluno,
          idProfessor: p.idProfessor,
          presente: p.presente,
          justificativa: p.justificativa,
          dataRegistro: p.dataRegistro
        })),
        notasLancadas: notasValidadas.map(nota => ({
          idNota: nota.idNota,
          nome: nota.nome,
          valorNota: nota.valorNota,
          tipoAvaliacao: nota.tipoAvaliacao,
          dataLancamento: nota.dataLancamento,
          aluno: {
            nome: nota.aluno.nome,
            sobrenome: nota.aluno.sobrenome
          }
        }))
      }
    });

  } catch (error) {
    console.error('Erro ao processar dados do dashboard:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados inválidos',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// Função para calcular frequência baseada nas presenças reais
function calcularFrequencia(presencas: PresencaAPI[], alunos: TurmaAlunoAPI[]) {
  if (presencas.length === 0 || alunos.length === 0) {
    return {
      taxaPresenca: 0,
      totalAulas: 0,
      aulasRealizadas: 0,
      alunosComBaixaFrequencia: []
    };
  }

  // Contar aulas únicas
  const aulasUnicas = new Set(presencas.map(p => p.idAula));
  const totalAulas = aulasUnicas.size;

  // Calcular frequência por aluno
  const frequenciaPorAluno = new Map();
  
  // Inicializar todos os alunos
  alunos.forEach(alunoData => {
    const aluno = alunoData.aluno;
    frequenciaPorAluno.set(aluno.idAluno, {
      nome: aluno.nome,
      sobrenome: aluno.sobrenome,
      presencas: 0,
      totalAulas: 0
    });
  });

  // Contar presenças
  presencas.forEach(presenca => {
    const alunoFreq = frequenciaPorAluno.get(presenca.idAluno);
    if (alunoFreq) {
      alunoFreq.totalAulas++;
      if (presenca.presente) {
        alunoFreq.presencas++;
      }
    }
  });

  // Calcular estatísticas
  let totalPresencasPossivel = 0;
  let totalPresencasReais = 0;
  const alunosComBaixaFrequencia: AlunoComBaixaFrequencia[] = [];

  frequenciaPorAluno.forEach((freq, idAluno) => {
    if (freq.totalAulas > 0) {
      totalPresencasPossivel += freq.totalAulas;
      totalPresencasReais += freq.presencas;

      const frequenciaAluno = freq.presencas / freq.totalAulas;
      
      if (frequenciaAluno < 0.75) {
        alunosComBaixaFrequencia.push({
          idAluno,
          nome: freq.nome,
          sobrenome: freq.sobrenome,
          totalAulas: freq.totalAulas,
          presencas: freq.presencas,
          frequencia: frequenciaAluno
        });
      }
    }
  });

  const taxaPresenca = totalPresencasPossivel > 0 
    ? totalPresencasReais / totalPresencasPossivel 
    : 0;

  return {
    taxaPresenca,
    totalAulas,
    aulasRealizadas: totalAulas,
    alunosComBaixaFrequencia: alunosComBaixaFrequencia.sort((a, b) => a.frequencia - b.frequencia)
  };
}

interface AlunoComBaixaFrequencia {
  idAluno: number;
  nome: string;
  sobrenome: string;
  totalAulas: number;
  presencas: number;
  frequencia: number;
}

interface NotaValidada {
  valorNota: number;
}

function calcularMediaGeral(notas: NotaValidada[]) {
  if (notas.length === 0) return 0;
  const soma = notas.reduce((acc, nota) => acc + nota.valorNota, 0);
  return parseFloat((soma / notas.length).toFixed(2));
}

function calcularDistribuicaoNotas(notas: NotaValidada[]) {
  const distribuicao = [
    { faixa: '0-2', quantidade: 0 },
    { faixa: '2-4', quantidade: 0 },
    { faixa: '4-6', quantidade: 0 },
    { faixa: '6-8', quantidade: 0 },
    { faixa: '8-10', quantidade: 0 }
  ];

  notas.forEach(nota => {
    const valor = nota.valorNota;
    if (valor >= 0 && valor < 2) distribuicao[0].quantidade++;
    else if (valor >= 2 && valor < 4) distribuicao[1].quantidade++;
    else if (valor >= 4 && valor < 6) distribuicao[2].quantidade++;
    else if (valor >= 6 && valor < 8) distribuicao[3].quantidade++;
    else if (valor >= 8 && valor <= 10) distribuicao[4].quantidade++;
  });

  return distribuicao;
}

// Funções removidas temporariamente até a tabela Aulas ser criada
// function calcularTaxaPresenca() será reimplementada quando a tabela existir