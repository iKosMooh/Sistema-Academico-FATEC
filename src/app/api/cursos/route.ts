import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CursoSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ativo = searchParams.get('ativo');
    
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

    } catch (dbError: any) {
      console.error('Erro do banco de dados:', dbError);

      if (dbError.code === 'P2021' || 
          dbError.message?.includes('does not exist') ||
          dbError.message?.includes('Curso')) {
        
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
      
      throw dbError;
    }

  } catch (error: any) {
    console.error('Erro ao buscar cursos:', error);
    
    if (error.code === 'P2021' || 
        error.message?.includes('does not exist')) {
      
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

    } catch (dbError: any) {
      console.error('Erro do banco de dados:', dbError);

      if (dbError.code === 'P2021' || 
          dbError.message?.includes('does not exist')) {
        
        return NextResponse.json({ 
          success: true, 
          message: 'Curso validado. Sistema em configuração.',
          simulated: true,
          data: validatedData
        });
      }

      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Nome do curso já existe' },
          { status: 400 }
        );
      }
      
      throw dbError;
    }

  } catch (error: any) {
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
