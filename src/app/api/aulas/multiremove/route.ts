import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const { nomeMateriaExcluir, dataInicialExcluir, dataFinalExcluir } = await req.json();
    if (!nomeMateriaExcluir || !dataInicialExcluir || !dataFinalExcluir) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }
    const dtIni = new Date(dataInicialExcluir);
    const dtFim = new Date(dataFinalExcluir);
    if (isNaN(dtIni.getTime()) || isNaN(dtFim.getTime()) || dtIni > dtFim) {
      return NextResponse.json({ error: "Intervalo de datas inválido." }, { status: 400 });
    }
    const aulasRemovidas = await prisma.aula.deleteMany({
      where: {
        materia: nomeMateriaExcluir,
        // Substitua 'data' pelo nome correto do campo de data em seu modelo Prisma, por exemplo 'dataAula'
        dataAula: { gte: dtIni, lte: dtFim }
      }
    });
    return NextResponse.json({ removidas: aulasRemovidas.count });
  } catch {
    return NextResponse.json({ error: "Erro ao remover aulas." }, { status: 500 });
  }
}
