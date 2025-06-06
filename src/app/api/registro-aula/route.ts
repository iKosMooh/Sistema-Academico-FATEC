import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema de validação usando Zod
const RegistroAulaSchema = z.object({
  idAula: z.number().int().positive(),
  presencas: z.array(z.object({
    idAluno: z.number().int().positive(),
    presente: z.boolean()
  })),
  conteudoMinistrado: z.string().optional(),
  observacoesAula: z.string().optional(),
  metodologiaAplicada: z.string().optional(),
  idProfessor: z.string().min(11, 'CPF do professor é obrigatório').max(14)
});

interface PresencaInput {
  idAluno: number;
  presente: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação com Zod
    const validatedData = RegistroAulaSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: validatedData.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      }, { status: 400 });
    }

    const { idAula, presencas, conteudoMinistrado, observacoesAula, metodologiaAplicada, idProfessor } = validatedData.data;

    console.log('Registrando aula:', { idAula, presencas: presencas.length, conteudoMinistrado, idProfessor });

    // Verificar se a aula existe
    const aulaExiste = await prisma.aula.findUnique({
      where: { idAula }
    });

    if (!aulaExiste) {
      return NextResponse.json(
        { success: false, error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o professor existe
    const professorExiste = await prisma.professores.findUnique({
      where: { idProfessor }
    });

    if (!professorExiste) {
      return NextResponse.json(
        { success: false, error: 'Professor não encontrado' },
        { status: 404 }
      );
    }

    // Usar transação para garantir consistência
    const resultado = await prisma.$transaction(async (tx) => {
      try {
        // 1. Atualizar a aula com o conteúdo ministrado
        const aulaAtualizada = await tx.aula.update({
          where: { idAula },
          data: {
            aulaConcluida: true,
            presencasAplicadas: true,
            conteudoMinistrado: conteudoMinistrado || null,
            metodologiaAplicada: metodologiaAplicada || null,
            observacoesAula: observacoesAula || null,
          }
        });

        // 2. Deletar presenças existentes para esta aula
        await tx.presencas.deleteMany({
          where: { idAula }
        });

        // 3. Criar novas presenças com idProfessor
        const presencasData = presencas.map((p: PresencaInput) => ({
          idAula,
          idAluno: p.idAluno,
          idProfessor,
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
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados de entrada inválidos',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      }, { status: 400 });
    }
    
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
