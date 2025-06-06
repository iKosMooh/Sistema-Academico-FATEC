import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { unlink } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    const { idDocAula } = await request.json();

    if (!idDocAula) {
      return NextResponse.json(
        { success: false, error: 'ID do documento é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o documento no banco
    const doc = await prisma.docsAula.findUnique({
      where: { idDocAula: parseInt(idDocAula) }
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    // Deletar o arquivo físico
    try {
      const caminhoArquivo = path.join(process.cwd(), 'uploads', doc.src);
      await unlink(caminhoArquivo);
    } catch {
      console.warn('Arquivo físico não encontrado:', doc.src);
      // Continua mesmo se o arquivo físico não existir
    }

    // Deletar o registro do banco
    await prisma.docsAula.delete({
      where: { idDocAula: parseInt(idDocAula) }
    });

    return NextResponse.json({
      success: true,
      message: 'Arquivo excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
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
