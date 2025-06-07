import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const RequestSchema = z.object({
  idTurma: z.number().int().positive()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idTurma } = RequestSchema.parse(body);

    // Buscar dados da turma
    const turma = await prisma.turmas.findUnique({
      where: { idTurma },
      include: {
        curso: true,
        turmaAluno: {
          include: {
            aluno: true
          }
        }
      }
    });

    if (!turma) {
      return NextResponse.json({
        success: false,
        error: 'Turma não encontrada'
      }, { status: 404 });
    }

    // Estatísticas básicas
    const totalAlunos = turma.turmaAluno.length;
    
    const totalAulas = await prisma.aula.count({
      where: { idTurma }
    });

    const aulasMinistradas = await prisma.aula.count({
      where: { 
        idTurma,
        aulaConcluida: true 
      }
    });

    // Média geral da turma
    const notasTurma = await prisma.notas.findMany({
      where: { idTurma },
      select: { valorNota: true }
    });

    const mediaGeralTurma = notasTurma.length > 0 
      ? notasTurma.reduce((acc, nota) => acc + Number(nota.valorNota), 0) / notasTurma.length
      : 0;

    // Frequência média da turma
    const presencasTurma = await prisma.presencas.findMany({
      where: {
        aula: {
          idTurma,
          aulaConcluida: true
        }
      }
    });

    const frequenciaMedia = presencasTurma.length > 0
      ? (presencasTurma.filter(p => p.presente).length / presencasTurma.length) * 100
      : 0;

    // Gráfico de média de notas por aluno
    const mediaNotasPromises = turma.turmaAluno.map(async (ta) => {
      const notasAluno = await prisma.notas.findMany({
        where: {
          idAluno: ta.idAluno,
          idTurma
        }
      });

      const media = notasAluno.length > 0
        ? notasAluno.reduce((acc, nota) => acc + Number(nota.valorNota), 0) / notasAluno.length
        : 0;

      return {
        aluno: `${ta.aluno.nome} ${ta.aluno.sobrenome}`,
        media: Math.round(media * 100) / 100,
        totalNotas: notasAluno.length
      };
    });

    const mediaNotasPorAluno = await Promise.all(mediaNotasPromises);

    // Buscar todas as matérias vinculadas ao curso da turma
    const materiasNaTurma = await prisma.cursoMaterias.findMany({
      where: { idCurso: turma.idCurso },
      include: {
        materia: {
          select: { 
            idMateria: true,
            nomeMateria: true 
          }
        }
      }
    });

    // Gráfico de média de notas por matéria
    const mediaNotasPorMateriaPromises = materiasNaTurma.map(async (cm) => {
      const notasMateria = await prisma.notas.findMany({
        where: {
          idTurma,
          idMateria: cm.materia.idMateria
        }
      });

      const media = notasMateria.length > 0
        ? notasMateria.reduce((acc, nota) => acc + Number(nota.valorNota), 0) / notasMateria.length
        : 0;

      return {
        materia: cm.materia.nomeMateria,
        media: Math.round(media * 100) / 100,
        totalNotas: notasMateria.length
      };
    });

    const mediaNotasPorMateria = await Promise.all(mediaNotasPorMateriaPromises);

    // Gráfico de frequência por matéria
    const frequenciaPorMateriaPromises = materiasNaTurma.map(async (cm) => {
      const presencasMateria = await prisma.presencas.findMany({
        where: {
          aula: {
            idTurma,
            idMateria: cm.materia.idMateria,
            aulaConcluida: true
          }
        }
      });

      const frequencia = presencasMateria.length > 0
        ? (presencasMateria.filter(p => p.presente).length / presencasMateria.length) * 100
        : 0;

      return {
        materia: cm.materia.nomeMateria,
        frequencia: Math.round(frequencia * 100) / 100
      };
    });

    const frequenciaPorMateria = await Promise.all(frequenciaPorMateriaPromises);

    const dashboardData = {
      turma: {
        idTurma: turma.idTurma,
        nomeTurma: turma.nomeTurma,
        anoLetivo: turma.anoLetivo,
        curso: {
          nomeCurso: turma.curso.nomeCurso,
          cargaHorariaTotal: turma.curso.cargaHorariaTotal
        }
      },
      estatisticas: {
        totalAlunos,
        totalAulas,
        aulasMinistradas,
        mediaGeralTurma: Math.round(mediaGeralTurma * 100) / 100,
        frequenciaMedia: Math.round(frequenciaMedia * 100) / 100
      },
      graficos: {
        mediaNotas: mediaNotasPorMateria.sort((a, b) => b.media - a.media), // Ordenar por média decrescente
        mediaNotasPorAluno: mediaNotasPorAluno.sort((a, b) => b.media - a.media), // Ordenar por média decrescente
        frequenciaPorMateria: frequenciaPorMateria.sort((a, b) => b.frequencia - a.frequencia) // Ordenar por frequência decrescente
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard da turma:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}