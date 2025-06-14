import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CursoSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // const { searchParams } = new URL(request.url);
    
    try {
      const cursos = await prisma.curso.findMany({
        select: {
          idCurso: true,
          nomeCurso: true,
          cargaHorariaTotal: true,
          descricao: true,
        },
        orderBy: {
          nomeCurso: 'asc'
        }
      });

      return NextResponse.json(cursos);

    } catch (dbError: unknown) {
      console.error('Erro do banco de dados:', dbError);

      if (
        typeof dbError === 'object' &&
        dbError !== null &&
        ('code' in dbError || 'message' in dbError)
      ) {
        const code = (dbError as { code?: string }).code;
        const message = (dbError as { message?: string }).message;

        if (
          code === 'P2021' ||
          message?.includes('does not exist') ||
          message?.includes('Curso')
        ) {
          // Retornar cursos mock para desenvolvimento
          const cursosMock = [
            {
              idCurso: 1,
              nomeCurso: "Análise e Desenvolvimento de Sistemas",
              cargaHorariaTotal: 2880,
              descricao: "Curso superior de tecnologia"
            },
            {
              idCurso: 2,
              nomeCurso: "Gestão Empresarial",
              cargaHorariaTotal: 2400,
              descricao: "Curso superior de tecnologia"
            }
          ];

          return NextResponse.json(cursosMock);
        }
      }

      throw dbError;
    }

  } catch (error: unknown) {
    console.error('Erro ao buscar cursos:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      ('code' in error || 'message' in error)
    ) {
      const code = (error as { code?: string }).code;
      const message = (error as { message?: string }).message;

      if (code === 'P2021' || message?.includes('does not exist')) {
        const cursosMock = [
          {
            idCurso: 1,
            nomeCurso: "Análise e Desenvolvimento de Sistemas",
            cargaHorariaTotal: 2880,
            descricao: "Curso superior de tecnologia"
          }
        ];

        return NextResponse.json(cursosMock);
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados do curso
    const validatedData = CursoSchema.parse(body);

    try {
      const curso = await prisma.curso.create({
        data: {
          nomeCurso: validatedData.nomeCurso,
          cargaHorariaTotal: validatedData.cargaHorariaTotal,
          descricao: validatedData.descricao || null,
          docsPath: validatedData.docsPath || null,
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Curso criado com sucesso',
        data: curso
      });

    } catch (dbError: unknown) {
      console.error('Erro do banco de dados:', dbError);

      if (
        typeof dbError === 'object' &&
        dbError !== null &&
        ('code' in dbError || 'message' in dbError)
      ) {
        const code = (dbError as { code?: string }).code;
        const message = (dbError as { message?: string }).message;

        if (code === 'P2021' || message?.includes('does not exist')) {
          return NextResponse.json({ 
            success: true, 
            message: 'Curso validado. Sistema em configuração.',
            simulated: true,
            data: validatedData
          });
        }

        if (code === 'P2002') {
          return NextResponse.json(
            { error: 'Nome do curso já existe' },
            { status: 400 }
          );
        }
      }
      
      throw dbError;
    }

  } catch (error: unknown) {
    console.error('Erro ao criar curso:', error);
    
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { 
          error: `Erro de validação: ${firstError.message}`,
          field: firstError.path.join('.'),
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
