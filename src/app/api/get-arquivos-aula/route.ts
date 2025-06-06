import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Buscar a aula com seus documentos
    const aula = await prisma.aula.findUnique({
      where: { idAula: parseInt(idAula) },
      include: {
        docsAula: true,
        materia: true,
        turma: true
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
    console.error('Erro ao buscar arquivos da aula:', error);
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
