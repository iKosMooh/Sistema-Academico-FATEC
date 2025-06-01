import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Retorna todos os alunos, incluindo os dados de contato
    const alunos = await prisma.alunos.findMany({
      include: {
        contato: true, // Incluir dados de ContatoAluno
      },
    });
    return NextResponse.json(alunos);
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar alunos." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { idAluno } = await req.json();

    if (typeof idAluno !== "number") {
      return NextResponse.json(
        { error: "ID do aluno inválido." },
        { status: 400 }
      );
    }

    // Deleta o aluno. A relação com ContatoAluno deve ser removida em cascade
    await prisma.alunos.delete({
      where: { idAluno },
    });

    return NextResponse.json({ message: "Aluno deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar aluno:", error);
    return NextResponse.json(
      { error: "Erro ao deletar aluno." },
      { status: 500 }
    );
  }
}
