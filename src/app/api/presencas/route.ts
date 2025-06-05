import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { idAula, idAluno, idProfessor, presente } = await req.json();

    // Verifica se já existe presença
    const presencaExistente = await prisma.presencas.findFirst({
      where: {
        AND: [
          { idAula: Number(idAula) },
          { idAluno: Number(idAluno) }
        ]
      }
    });

    let result;

    if (presencaExistente) {
      // Atualiza presença existente
      result = await prisma.presencas.update({
        where: { idPresenca: presencaExistente.idPresenca },
        data: { presente }
      });
    } else {
      // Cria nova presença
      result = await prisma.presencas.create({
        data: {
          idAula: Number(idAula),
          idAluno: Number(idAluno),
          idProfessor: String(idProfessor),
          presente
        }
      });
    }

    // Atualiza status da aula
    await prisma.aula.update({
      where: { idAula: Number(idAula) },
      data: { 
        presencasAplicadas: true,
        aulaConcluida: true
      }
    });

    return NextResponse.json({
      success: true,
      data: result,
      isUpdate: !!presencaExistente
    });

  } catch (error) {
    console.error('Erro ao processar presença:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar presença' },
      { status: 500 }
    );
  }
}
