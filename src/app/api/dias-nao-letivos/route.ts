import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { data, descricao } = await req.json();
    if (!data) {
      return NextResponse.json({ error: "Data obrigatória." }, { status: 400 });
    }
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
      return NextResponse.json({ error: "Data inválida." }, { status: 400 });
    }
    const existente = await prisma.diasNaoLetivos.findFirst({
      where: { data: dataObj }
    });
    if (existente) {
      return NextResponse.json({ error: "Data já cadastrada." }, { status: 400 });
    }
    const novo = await prisma.diasNaoLetivos.create({
      data: { data: dataObj, descricao }
    });

    // Marca como canceladas todas as aulas já agendadas para essa data
    await prisma.aula.updateMany({
      where: {
        // Replace 'dataAula' with the actual date field name in your 'aula' model
        dataAula: {
          gte: new Date(dataObj.setHours(0, 0, 0, 0)),
          lte: new Date(dataObj.setHours(23, 59, 59, 999))
        }
      },
      data: { aulaConcluida: true }
    });

    return NextResponse.json(novo);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao cadastrar data." }, { status: 500 });
  }
}
