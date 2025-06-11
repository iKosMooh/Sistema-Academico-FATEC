import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { cpf, novaSenha } = await req.json();
    if (!cpf || !novaSenha) {
      return NextResponse.json({ success: false, error: "CPF e nova senha obrigatórios" }, { status: 400 });
    }
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);
    await prisma.usuarios.update({ where: { cpf }, data: { senhaHash } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar senha";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
