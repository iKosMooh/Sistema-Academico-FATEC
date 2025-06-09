import { NextResponse } from "next/server";
import { z } from 'zod';
import prisma from "@/lib/prisma";

const RequestSchema = z.object({
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cpf } = RequestSchema.parse(body);

    console.log('Dashboard do aluno:', cpf);

    // Buscar dados do aluno
    const aluno = await prisma.alunos.findUnique({
      where: { cpf }
    });

    if (!aluno) {
      return NextResponse.json({
        success: false,
        error: 'Aluno não encontrado'
      }, { status: 404 });
    }

    // Buscar turmas do aluno com curso
    const turmasAluno = await prisma.turmaAluno.findMany({
      where: { idAluno: aluno.idAluno },
      include: {
        turma: {
          include: {
            curso: true
          }
        }
      }
    });

    // Buscar notas do aluno
    const notas = await prisma.notas.findMany({
      where: { idAluno: aluno.idAluno },
      include: {
        materia: true,
        turma: true
      },
      orderBy: {
        dataLancamento: 'desc'
      }
    });

    // Buscar presenças do aluno
    const presencas = await prisma.presencas.findMany({
      where: { idAluno: aluno.idAluno },
      include: {
        aula: {
          include: {
            materia: true,
            turma: true
          }
        }
      }
    });

    // Buscar aulas das turmas do aluno
    const aulasIds = turmasAluno.map(ta => ta.idTurma);
    const aulas = await prisma.aula.findMany({
      where: {
        idTurma: {
          in: aulasIds
        }
      },
      include: {
        materia: true,
        turma: true
      },
      orderBy: {
        dataAula: 'asc'
      }
    });

    // Processar frequência por matéria e turma
    const frequenciaPorMateria = new Map<string, {
      turma: { idTurma: number; nomeTurma: string };
      materia: { nomeMateria: string };
      totalAulas: number;
      presencas: number;
      taxaPresenca: number;
    }>();

    // Contar aulas por matéria/turma
    aulas.forEach(aula => {
      const chave = `${aula.idTurma}-${aula.idMateria}`;
      if (!frequenciaPorMateria.has(chave)) {
        frequenciaPorMateria.set(chave, {
          turma: { idTurma: aula.idTurma, nomeTurma: aula.turma.nomeTurma },
          materia: { nomeMateria: aula.materia.nomeMateria },
          totalAulas: 0,
          presencas: 0,
          taxaPresenca: 0
        });
      }
      
      const item = frequenciaPorMateria.get(chave)!;
      item.totalAulas++;
    });

    // Contar presenças
    presencas.forEach(presenca => {
      if (presenca.aula) {
        const chave = `${presenca.aula.idTurma}-${presenca.aula.idMateria}`;
        const item = frequenciaPorMateria.get(chave);
        if (item && presenca.presente) {
          item.presencas++;
        }
      }
    });

    // Calcular taxa de presença
    frequenciaPorMateria.forEach(item => {
      item.taxaPresenca = item.totalAulas > 0 
        ? (item.presencas / item.totalAulas) * 100 
        : 0;
    });

    // Calcular frequência por turma e matéria - CORRIGIDO
    const frequenciaData = await Promise.all(
      turmasAluno.map(async (turmaAluno) => {
        const { turma } = turmaAluno;
        
        // Buscar todas as matérias da turma
        const materiasNaTurma = await prisma.aula.findMany({
          where: { idTurma: turma.idTurma },
          select: { 
            idMateria: true,
            materia: { select: { nomeMateria: true } }
          },
          distinct: ['idMateria']
        });

        return Promise.all(
          materiasNaTurma.map(async (materiaInfo) => {
            // Buscar total de aulas ministradas (apenas as com aulaConcluida = true)
            const aulasMinistradas = await prisma.aula.count({
              where: {
                idTurma: turma.idTurma,
                idMateria: materiaInfo.idMateria,
                aulaConcluida: true
              }
            });

            // Buscar presenças do aluno nas aulas ministradas
            const presencasDoAluno = await prisma.presencas.count({
              where: {
                idAluno: aluno.idAluno,
                presente: true,
                aula: {
                  idTurma: turma.idTurma,
                  idMateria: materiaInfo.idMateria,
                  aulaConcluida: true
                }
              }
            });

            // Calcular taxa de presença
            const taxaPresenca = aulasMinistradas > 0 
              ? (presencasDoAluno / aulasMinistradas) * 100 
              : 100; // Se não há aulas ministradas, considera 100%

            return {
              turma: {
                idTurma: turma.idTurma,
                nomeTurma: turma.nomeTurma
              },
              materia: {
                nomeMateria: materiaInfo.materia.nomeMateria
              },
              aulasMinistradas: aulasMinistradas,
              presencas: presencasDoAluno,
              taxaPresenca: Math.round(taxaPresenca * 100) / 100
            };
          })
        );
      })
    );

    const frequencia = frequenciaData.flat();

    const dashboardData = {
      aluno: {
        idAluno: aluno.idAluno,
        nome: aluno.nome,
        sobrenome: aluno.sobrenome,
        cpf: aluno.cpf
      },
      turmas: turmasAluno.map(ta => ({
        idTurma: ta.turma.idTurma,
        nomeTurma: ta.turma.nomeTurma,
        anoLetivo: ta.turma.anoLetivo,
        curso: {
          nomeCurso: ta.turma.curso.nomeCurso,
          cargaHorariaTotal: ta.turma.curso.cargaHorariaTotal
        },
        statusMatricula: ta.statusMatricula
      })),
      notas: notas.map(nota => ({
        idNota: nota.idNota,
        nome: nota.nome,
        valorNota: Number(nota.valorNota),
        tipoAvaliacao: nota.tipoAvaliacao,
        dataLancamento: nota.dataLancamento.toISOString(),
        materia: {
          nomeMateria: nota.materia.nomeMateria
        },
        turma: {
          nomeTurma: nota.turma.nomeTurma
        }
      })),
      frequencia: frequencia, // Usar apenas a frequência detalhada corrigida
      aulas: aulas.map(aula => ({
        idAula: aula.idAula,
        dataAula: aula.dataAula.toISOString(),
        horario: aula.horario || '',
        materia: {
          nomeMateria: aula.materia.nomeMateria
        },
        turma: {
          nomeTurma: aula.turma.nomeTurma
        },
        aulaConcluida: aula.aulaConcluida,
        conteudoMinistrado: aula.conteudoMinistrado,
        observacoesAula: aula.observacoesAula
      }))
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Erro ao processar dashboard do aluno:', error);
    
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
