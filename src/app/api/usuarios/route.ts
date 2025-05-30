// src/app/api/usuarios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { cpf, senhaHash, tipo } = await request.json();

    // Verifica se o usuário já existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { cpf },
    });

    if (usuarioExistente) {
      return NextResponse.json({ error: 'Usuário já cadastrado.' }, { status: 400 });
    }

    // Hash da senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const senhaHasheada = await bcrypt.hash(senhaHash, salt);

    // Cria o novo usuário com senha hasheada
    const novoUsuario = await prisma.usuarios.create({
      data: {
        cpf,
        senhaHash: senhaHasheada,
        tipo,
      },
    });

    return NextResponse.json(novoUsuario, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
