import { NextResponse } from "next/server";
import { z } from 'zod';
import prisma from "@/lib/prisma";

const GetArquivosSchema = z.object({
  idAula: z.string().transform(val => parseInt(val, 10))
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params = GetArquivosSchema.parse({
      idAula: searchParams.get('idAula')
    });

    // Buscar arquivos da aula
    const arquivos = await prisma.docsAula.findMany({
      where: { idAula: params.idAula },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: arquivos.map(arquivo => ({
        idDocAula: arquivo.idDocAula,
        src: arquivo.src,
        nomeArquivo: arquivo.src.split('/').pop() || `arquivo_${arquivo.idDocAula}`,
        dataUpload: arquivo.created_at
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar arquivos da aula:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
