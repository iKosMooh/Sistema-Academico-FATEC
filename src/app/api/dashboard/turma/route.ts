import { NextResponse } from "next/server";
import { z } from 'zod';
import prisma from "@/lib/prisma";

// Schemas de validação com Zod
const RequestSchema = z.object({
  idTurma: z.union([z.string(), z.number()]).transform(val => Number(val))
});

const NotaSchema = z.object({
  valorNota: z.union([z.number(), z.string()]).transform(val => Number(val))
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idTurma } = RequestSchema.parse(body);
    
    console.log('Dashboard da turma:', idTurma);

    // Buscar dados sem aulas por enquanto (tabela não existe ainda)
    const [turmaInfo, alunos, notasLancadas] = await Promise.all([
      prisma.turmas.findUnique({
        where: { idTurma },
        include: { curso: true }
      }),
      prisma.turmaAluno.findMany({
        where: { idTurma },
        include: { aluno: true }
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
      })
    ]);

    if (!turmaInfo) {
      return NextResponse.json({
        success: false,
        error: 'Turma não encontrada'
      }, { status: 404 });
    }

    // Validar e processar notas
    const notasValidadas = notasLancadas.map(nota => {
      const notaValidada = NotaSchema.parse({ valorNota: nota.valorNota });
      return { ...nota, valorNota: notaValidada.valorNota };
    });

    // Dados mock para aulas até a tabela ser criada
    const aulasData = {
      totalAulas: 0,
      aulasRealizadas: 0,
      taxaPresenca: 0
    };

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
          porFaltas: []
        },
        notas: {
          mediaGeral: calcularMediaGeral(notasValidadas),
          distribuicao: calcularDistribuicaoNotas(notasValidadas),
          aprovados: notasValidadas.filter(n => n.valorNota >= 6).length
        },
        frequencia: {
          taxaPresenca: aulasData.taxaPresenca,
          totalAulas: aulasData.totalAulas,
          aulasRealizadas: aulasData.aulasRealizadas
        },
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

interface NotaValidada {
  valorNota: number;
}

function calcularMediaGeral(notas: NotaValidada[]) {
  if (notas.length === 0) return 0;
  return notas.reduce((acc, nota) => acc + nota.valorNota, 0) / notas.length;
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
    if (valor >= 0 && valor <= 2) distribuicao[0].quantidade++;
    else if (valor <= 4) distribuicao[1].quantidade++;
    else if (valor <= 6) distribuicao[2].quantidade++;
    else if (valor <= 8) distribuicao[3].quantidade++;
    else if (valor <= 10) distribuicao[4].quantidade++;
  });

  return distribuicao;
}

// Funções removidas temporariamente até a tabela Aulas ser criada
// function calcularTaxaPresenca() será reimplementada quando a tabela existir