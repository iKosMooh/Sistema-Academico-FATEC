import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { idTurma } = await req.json();
    console.log('Dashboard da turma:', idTurma);

    // Buscar dados incluindo notas
    const [turmaInfo, alunos, aulas, notasLancadas] = await Promise.all([
      prisma.turmas.findUnique({
        where: { idTurma: Number(idTurma) },
        include: { curso: true }
      }),
      prisma.turmaAluno.findMany({
        where: { idTurma: Number(idTurma) },
        include: { aluno: true }
      }),
      prisma.aula.findMany({
        where: { idTurma: Number(idTurma) },
        include: { presencas: true }
      }),
      prisma.notas.findMany({
        where: { idTurma: Number(idTurma) },
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
      })
    ]);
    return NextResponse.json({
      success: true,
      data: {
        turma: {
          id: turmaInfo?.idTurma,
          nome: turmaInfo?.nomeTurma,
          anoLetivo: turmaInfo?.anoLetivo,
          curso: { nome: turmaInfo?.curso.nomeCurso }
        },
        alunos: {
          total: alunos.length,
          ativos: alunos.filter(a => a.statusMatricula === 'Ativa').length,
          porFaltas: []
        },
        notas: {
          mediaGeral: calcularMediaGeral(notasLancadas.map(n => ({ valorNota: Number(n.valorNota) }))),
          distribuicao: calcularDistribuicaoNotas(notasLancadas.map(n => ({ valorNota: Number(n.valorNota) }))),
          aprovados: notasLancadas.filter(n => Number(n.valorNota) >= 6).length
        },
        frequencia: {
          taxaPresenca: calcularTaxaPresenca(aulas, alunos),
          totalAulas: aulas.length,
          aulasRealizadas: aulas.filter(a => a.aulaConcluida).length
        },
        notasLancadas: notasLancadas.map(nota => ({
          idNota: nota.idNota,
          nome: nota.nome,
          valorNota: Number(nota.valorNota),
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
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

interface Nota {
  valorNota: number | string;
}

function calcularMediaGeral(notas: Nota[]) {
  if (notas.length === 0) return 0;
  return notas.reduce((acc, nota) => acc + Number(nota.valorNota), 0) / notas.length;
}

function calcularDistribuicaoNotas(notas: Array<{ valorNota: number }>) {
  const distribuicao = [
    { faixa: '0-2', quantidade: 0 },
    { faixa: '2-4', quantidade: 0 },
    { faixa: '4-6', quantidade: 0 },
    { faixa: '6-8', quantidade: 0 },
    { faixa: '8-10', quantidade: 0 }
  ];

  notas.forEach(nota => {
    const valor = Number(nota.valorNota);
    if (valor >= 0 && valor <= 2) distribuicao[0].quantidade++;
    else if (valor <= 4) distribuicao[1].quantidade++;
    else if (valor <= 6) distribuicao[2].quantidade++;
    else if (valor <= 8) distribuicao[3].quantidade++;
    else if (valor <= 10) distribuicao[4].quantidade++;
  });

  return distribuicao;
}

interface Presenca {
  presente: boolean;
  idAluno: number;
}

interface Aula {
  aulaConcluida: boolean;
  presencas: Presenca[];
}

interface TurmaAluno {
  idAluno: number;
  statusMatricula: string;
  aluno: {
    idAluno: number;
    nome: string;
    sobrenome: string;
  };
}

function calcularTaxaPresenca(aulas: Aula[], alunos: TurmaAluno[]) {
  // Filtra apenas aulas concluídas e alunos ativos
  const aulasRealizadas = aulas.filter(aula => aula.aulaConcluida);
  const alunosAtivos = alunos.filter(aluno => aluno.statusMatricula === 'Ativa');
  
  if (aulasRealizadas.length === 0 || alunosAtivos.length === 0) {
    return 0;
  }

  // Calcula o total de presenças de todos os alunos em todas as aulas
  let totalPresencas = 0;

  // Para cada aula realizada
  aulasRealizadas.forEach(aula => {
    // Para cada aluno ativo
    alunosAtivos.forEach(aluno => {
      // Procura a presença do aluno nesta aula
      const presencaAluno = aula.presencas.find(p => p.idAluno === aluno.idAluno);
      // Se encontrou e está presente, incrementa o total
      if (presencaAluno?.presente) {
        totalPresencas++;
      }
    });
  });

  // Total possível = número de aulas × número de alunos
  const totalPossivel = aulasRealizadas.length * alunosAtivos.length;

  // Retorna a proporção (será um número entre 0 e 1)
  return totalPossivel > 0 ? totalPresencas / totalPossivel : 0;
}
