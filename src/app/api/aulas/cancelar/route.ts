import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { idAula } = await req.json();
    if (!idAula) {
      return NextResponse.json({ error: "idAula obrigatório." }, { status: 400 });
    }

    // Busca a aula
    const aula = await prisma.aula.findUnique({ where: { idAula } });
    if (!aula) {
      return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
    }
    if (aula.aulaConcluida) {
      return NextResponse.json({ error: "Aula já está marcada como concluída/cancelada." }, { status: 400 });
    }

    // Marca como cancelada (aulaConcluida = true)
    const aulaAtualizada = await prisma.aula.update({
      where: { idAula },
      data: { aulaConcluida: true }
    });

    return NextResponse.json({ success: true, aula: aulaAtualizada });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao cancelar aula." }, { status: 500 });
  }
}
