import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { handleCrud } from '@/lib/crudService';
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.tipo !== "Professor" && session.user.tipo !== "Admin")) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    const {
      idAluno,
      idTurma,
      idMateria,
      nome,
      valorNota,
      tipoAvaliacao,
      observacoes
    } = await req.json();

    // Preparar dados para inserção
    const notaData = {
      idAluno: Number(idAluno),
      idTurma: Number(idTurma),
      idMateria: Number(idMateria),
      nome: String(nome),
      valorNota: Number(valorNota),
      tipoAvaliacao: String(tipoAvaliacao),
      observacoes: observacoes ? String(observacoes) : null,
      idProfessor: session.user.cpf
    };

    // Usar o serviço CRUD existente
    const result = await handleCrud({
      operation: "upsert",
      table: "notas",
      data: notaData,
      where: {
        uc_aluno_materia_turma_tipo: {
          idAluno: Number(idAluno),
          idMateria: Number(idMateria),
          idTurma: Number(idTurma),
          tipoAvaliacao
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor: " + (error as Error).message },
      { status: 500 }
    );
  }
}
