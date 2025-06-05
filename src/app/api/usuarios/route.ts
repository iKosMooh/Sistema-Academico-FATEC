import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Schema para validação
const createUserSchema = z.object({
  cpf: z.string().min(11).max(14),
  senha: z.string().min(4),
  tipo: z.enum(['Admin', 'Professor', 'Aluno'])
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validação
    const validatedData = createUserSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: validatedData.error.issues
      }, { status: 400 });
    }

    // Verifica se usuário já existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { cpf: data.cpf }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Usuário já existe'
      }, { status: 409 });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    // Cria usuário
    const usuario = await prisma.usuarios.create({
      data: {
        cpf: data.cpf,
        senhaHash,
        tipo: data.tipo
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        cpf: usuario.cpf,
        tipo: usuario.tipo
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao criar usuário'
    }, { status: 500 });
  }
}
