import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Buscar todos os atestados enviados pelos alunos para avaliação dos professores
    const atestados = await prisma.atestadosMedicos.findMany({
      include: {
        aluno: {
          select: {
            nome: true,
            sobrenome: true,
            cpf: true
          }
        },
        avaliador: {
          select: {
            nome: true,
            sobrenome: true
          }
        },
        aulasJustificadas: {
          include: {
            aula: {
              include: {
                materia: {
                  select: {
                    nomeMateria: true
                  }
                },
                turma: {
                  select: {
                    nomeTurma: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Pendentes primeiro
        { dataEnvio: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: atestados
    });

  } catch (error) {
    console.error('Erro ao buscar atestados:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
