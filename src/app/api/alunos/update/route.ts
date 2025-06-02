// src/app/api/alunos/update/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isValidCPF, isValidRG, formatCPF, formatRG } from "@/utils/cpf-rg";

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

    // 2. Validar formato de dataNasc
    const novaDataNasc = new Date(dataNasc);
    if (isNaN(novaDataNasc.getTime())) {
      return NextResponse.json(
        { error: "Data de Nascimento inválida." },
        { status: 400 }
      );
    }

    // 3. Validar CPF
    if (!cpf || !isValidCPF(cpf)) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }
    const cpfFormatado = formatCPF(cpf);

    // 4. Validar RG
    if (!rg || !isValidRG(rg)) {
      return NextResponse.json({ error: "RG inválido." }, { status: 400 });
    }
    const rgFormatado = formatRG(rg);

    // ✅ 5. Verificar duplicidade de CPF na tabela Alunos (excluindo o próprio idAluno)
    const alunoComMesmoCPF = await prisma.alunos.findFirst({
      where: {
        cpf: cpfFormatado,
        NOT: { idAluno },
      },
    });

    if (alunoComMesmoCPF) {
      return NextResponse.json(
        { error: "Já existe outro aluno cadastrado com este CPF." },
        { status: 400 }
      );
    }

    // ✅ 6. Verificar duplicidade de CPF na tabela Usuarios
    const usuarioComMesmoCPF = await prisma.usuarios.findUnique({
      where: { cpf: cpfFormatado },
    });

    if (usuarioComMesmoCPF) {
      return NextResponse.json(
        { error: "Já existe um usuário cadastrado com este CPF." },
        { status: 400 }
      );
    }

    // ✅ 7. Atualizar Aluno + ContatoAluno em uma única operação transacional
    const updatedAluno = await prisma.alunos.update({
      where: { idAluno },
      data: {
        nome,
        sobrenome,
        cpf: cpfFormatado,
        rg: rgFormatado,
        nomeMae,
        nomePai: nomePai || null,
        dataNasc: novaDataNasc,
        descricao: descricao || null,
        contato: {
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
