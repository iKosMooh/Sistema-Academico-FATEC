import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { cpf, senha } = await req.json();
    if (!cpf || !senha) {
      return NextResponse.json({ success: false, error: "CPF e senha obrigatórios" }, { status: 400 });
    }
    const user = await prisma.usuarios.findUnique({ where: { cpf } });
    if (!user) return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 });
    const ok = await bcrypt.compare(senha, user.senhaHash);
    if (!ok) return NextResponse.json({ success: false, error: "Senha incorreta" }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao checar senha";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
