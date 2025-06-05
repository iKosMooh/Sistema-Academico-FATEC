import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const feriados = await prisma.diasNaoLetivos.findMany();
    return NextResponse.json(feriados);
  } catch (error: unknown) {
    console.error("Erro ao buscar feriados:", error);
    return NextResponse.json({ error: "Erro ao buscar feriados" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { data, descricao } = await req.json();
  try {
    const feriado = await prisma.diasNaoLetivos.create({
      data: { data: new Date(data), descricao }
    });
    return NextResponse.json(feriado);
  } catch (error) {
    console.error("Erro ao criar feriado:", error);
    return NextResponse.json({ error: "Erro ao criar feriado" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
  }

  try {
    await prisma.diasNaoLetivos.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ message: "Feriado deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar feriado:", error);
    return NextResponse.json({ error: "Erro ao deletar feriado" }, { status: 500 });
  }
}
