// src\app\api\professores\update\route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ajuste o caminho conforme sua estrutura

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const { idProfessor, nome, sobrenome, cargo } = body;

    // Validação básica
    if (!idProfessor || typeof idProfessor !== 'string') {
      return NextResponse.json({ error: 'ID do professor inválido.' }, { status: 400 });
    }

    // Atualização no banco de dados
    const updatedProfessor = await prisma.professores.update({
      where: { idProfessor },
      data: {
        nome,
        sobrenome,
        cargo,
      },
    });

    return NextResponse.json(updatedProfessor);
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
