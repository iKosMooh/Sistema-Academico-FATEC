import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }
    await prisma.diasNaoLetivos.delete({ where: { id } });
    return NextResponse.json({ removida: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover data." }, { status: 500 });
  }
}
