// src/app/api/professores/get-delete/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // ajuste conforme seu caminho real

export async function GET() {
  try {
    const professores = await prisma.professores.findMany();
    return NextResponse.json(professores);
  } catch (_error: unknown) {
    console.error("Erro ao buscar professores:", _error);
    return NextResponse.json(
      { error: "Erro ao buscar professores." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { idProfessor } = await req.json();

    if (!idProfessor) {
      return NextResponse.json(
        { error: "idProfessor não fornecido." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.professores.delete({
        where: { idProfessor },
      }),
      prisma.usuarios.delete({
        where: { cpf: idProfessor },
      }),
    ]);

    return NextResponse.json({ message: "Professor e usuário deletados com sucesso." });
  } catch (_error: unknown) {
    console.error("Erro ao deletar professor e usuário:", _error);
    return NextResponse.json(
      { error: "Erro ao deletar professor e usuário." },
      { status: 500 }
    );
  }
}
