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
    await prisma.professores.delete({
      where: { idProfessor },
    });
    return NextResponse.json({ message: "Professor deletado com sucesso." });
  } catch (_error: unknown) {
    console.error("Erro ao deletar professor:", _error);
    return NextResponse.json(
      { error: "Erro ao deletar professor." },
      { status: 500 }
    );
  }
}
