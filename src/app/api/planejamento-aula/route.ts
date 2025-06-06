import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, idAula, planejamento, metodologia } = body;

    console.log('Operação de planejamento:', { operation, idAula, planejamento, metodologia });

    switch (operation) {
      case 'update':
        if (!idAula) {
          return NextResponse.json(
            { success: false, error: 'ID da aula é obrigatório' },
            { status: 400 }
          );
        }

        // Verificar se a aula existe
        const aulaExiste = await prisma.aula.findUnique({
          where: { idAula: parseInt(idAula) }
        });

        if (!aulaExiste) {
          return NextResponse.json(
            { success: false, error: 'Aula não encontrada' },
            { status: 404 }
          );
        }

        // Atualizar o planejamento
        const aulaAtualizada = await prisma.aula.update({
          where: { idAula: parseInt(idAula) },
          data: {
            planejamento: planejamento || null,
            metodologia: metodologia || null,
          },
          include: {
            materia: true,
            turma: true
          }
        });

        return NextResponse.json({
          success: true,
          data: aulaAtualizada,
          message: 'Planejamento atualizado com sucesso'
        });

      case 'get':
        if (!idAula) {
          return NextResponse.json(
            { success: false, error: 'ID da aula é obrigatório' },
            { status: 400 }
          );
        }

        const aula = await prisma.aula.findUnique({
          where: { idAula: parseInt(idAula) },
          include: {
            materia: true,
            turma: true,
            docsAula: true
          }
        });

        if (!aula) {
          return NextResponse.json(
            { success: false, error: 'Aula não encontrada' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: aula
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Operação não suportada' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API de planejamento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idAula = searchParams.get('idAula');

    if (!idAula) {
      return NextResponse.json(
        { success: false, error: 'ID da aula é obrigatório' },
        { status: 400 }
      );
    }

    const aula = await prisma.aula.findUnique({
      where: { idAula: parseInt(idAula) },
      include: {
        materia: true,
        turma: true,
        docsAula: true
      }
    });

    if (!aula) {
      return NextResponse.json(
        { success: false, error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: aula
    });
  } catch (error) {
    console.error('Erro ao buscar aula:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
