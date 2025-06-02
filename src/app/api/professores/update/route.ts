// src/app/api/professores/update/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isValidCPF, isValidRG, formatCPF, formatRG } from "@/utils/cpf-rg";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { idProfessor, nome, sobrenome, rg, cargo } = body;

    // 1. Validação básica de idProfessor
    if (!idProfessor || typeof idProfessor !== "string") {
      return NextResponse.json(
        { error: "ID do professor inválido." },
        { status: 400 }
      );
    }

    // 2. Validar RG
    if (!rg || !isValidRG(rg)) {
      return NextResponse.json(
        { error: "RG inválido." },
        { status: 400 }
      );
    }
    const rgFormatado = formatRG(rg);

    // 3. Validar CPF (aqui idProfessor é o CPF)
    if (!isValidCPF(idProfessor)) {
      return NextResponse.json(
        { error: "CPF inválido." },
        { status: 400 }
      );
    }
    const cpfFormatado = formatCPF(idProfessor);

    // 4. Executar atualização
    const updatedProfessor = await prisma.professores.update({
      where: { idProfessor: cpfFormatado },
      data: {
        nome,
        sobrenome,
        rg: rgFormatado,
        cargo,
      },
    });

    return NextResponse.json(updatedProfessor);
  } catch (error) {
    console.error("Erro ao atualizar professor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
