import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      idAluno,
      nome,
      sobrenome,
      cpf,
      rg,
      nomeMae,
      nomePai,
      dataNasc,
      descricao,
      nomeTel1,
      tel1,
      nomeTel2,
      tel2,
    } = body;

    // 1. Validação básica de idAluno
    if (!idAluno || typeof idAluno !== "number") {
      return NextResponse.json(
        { error: "ID do aluno inválido." },
        { status: 400 }
      );
    }

    // 2. (Opcional) Validar formato de dataNasc
    const novaDataNasc = new Date(dataNasc);
    if (isNaN(novaDataNasc.getTime())) {
      return NextResponse.json(
        { error: "Data de Nascimento inválida." },
        { status: 400 }
      );
    }

    // 3. Atualizar Aluno + ContatoAluno em uma única operação transacional
    const updatedAluno = await prisma.alunos.update({
      where: { idAluno },
      data: {
        nome,
        sobrenome,
        cpf,
        rg,
        nomeMae,
        nomePai: nomePai || null,
        dataNasc: novaDataNasc,
        descricao: descricao || null,
        contato: {
          // Se o contato já existe, faz “update” do registro
          update: {
            nomeTel1,
            tel1,
            nomeTel2: nomeTel2 || null,
            tel2: tel2 || null,
          },
        },
      },
      include: {
        contato: true,
      },
    });

    return NextResponse.json(updatedAluno);
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
