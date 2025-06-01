import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ajuste conforme seu caminho real

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      idAluno,
      nome,
      sobrenome,
      nomeMae,
      nomePai,
      dataNasc,
      descricao
    } = body;

    // Validação básica de idAluno
    if (!idAluno || typeof idAluno !== 'number') {
      return NextResponse.json(
        { error: 'ID do aluno inválido.' },
        { status: 400 }
      );
    }
    // Atualiza apenas os campos permitidos
    const atualizado = await prisma.alunos.update({
      where: { idAluno },
      data: {
        nome,
        sobrenome,
        nomeMae,
        nomePai: nomePai || null,
        dataNasc: new Date(dataNasc),
        descricao: descricao || null
      }
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
