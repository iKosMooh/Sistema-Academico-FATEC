import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');

    if (!cpf) {
      return NextResponse.json({
        success: false,
        error: 'CPF do professor é obrigatório'
      }, { status: 400 });
    }

    // Verificar se o professor existe
    const professor = await prisma.professores.findUnique({
      where: { idProfessor: cpf }
    });

    if (!professor) {
      return NextResponse.json({
        success: false,
        error: 'Professor não encontrado'
      }, { status: 404 });
    }

    // Buscar todos os atestados com informações detalhadas
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
