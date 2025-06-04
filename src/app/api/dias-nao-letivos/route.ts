import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { data, descricao } = await req.json();
    if (!data) {
      return NextResponse.json({ error: "Data obrigatória." }, { status: 400 });
    }
    // Cria o feriado
    const feriado = await prisma.diasNaoLetivos.create({
      data: {
        data: new Date(data),
        descricao: descricao || null
      }
    });

    // Cancela todas as aulas do dia (marca aulaConcluida = true)
    const dataISO = new Date(data).toISOString().slice(0, 10);
    await prisma.aula.updateMany({
      where: {
        dataAula: {
          gte: new Date(`${dataISO}T00:00:00.000Z`),
          lte: new Date(`${dataISO}T23:59:59.999Z`)
        }
      },
      data: {
        aulaConcluida: true
      }
    });

    return NextResponse.json({ feriado, aulasCanceladas: true });
  } catch (error) {
    console.error("Erro ao cadastrar feriado:", error);
    return NextResponse.json({ error: "Erro ao cadastrar feriado." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const feriados = await prisma.diasNaoLetivos.findMany({
      orderBy: { data: "asc" }
    });
    return NextResponse.json(feriados);
  } catch (error) {
    console.error("Erro ao buscar dias não letivos:", error);
    return NextResponse.json([], { status: 200 });
  }
}
