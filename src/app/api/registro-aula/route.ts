import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PresencaInput {
  idAluno: string | number;
  presente: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { idAula, presencas, conteudoMinistrado, observacoesAula } = await request.json();

    console.log('Registrando aula:', { idAula, presencas: presencas.length, conteudoMinistrado });

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

    // Usar transação para garantir consistência
    const resultado = await prisma.$transaction(async (tx) => {
      try {
        // 1. Atualizar a aula com o conteúdo ministrado
        const aulaAtualizada = await tx.aula.update({
          where: { idAula: parseInt(idAula) },
          data: {
            aulaConcluida: true,
            presencasAplicadas: true,
            conteudoMinistrado: conteudoMinistrado || null,
            observacoes: observacoesAula || null,
          }
        });

        // 2. Deletar presenças existentes para esta aula
        await tx.presencas.deleteMany({
          where: { idAula: parseInt(idAula) }
        });

        // 3. Criar novas presenças
        const presencasData = presencas.map((p: PresencaInput) => ({
          idAula: parseInt(idAula),
          idAluno: parseInt(p.idAluno.toString()),
          presente: Boolean(p.presente)
        }));

        await tx.presencas.createMany({
          data: presencasData
        });

        return aulaAtualizada;
      } catch (transactionError) {
        console.error('Erro na transação:', transactionError);
        throw transactionError;
      }
    });

    return NextResponse.json({
      success: true,
      data: resultado,
      message: 'Registro da aula salvo com sucesso'
    });

  } catch (error) {
    console.error('Erro ao registrar aula:', error);
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

    // Buscar aula com presenças
    const aula = await prisma.aula.findUnique({
      where: { idAula: parseInt(idAula) },
      include: {
        presencas: {
          include: {
            aluno: true
          }
        },
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
    console.error('Erro ao buscar registro da aula:', error);
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
