import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const DadosSchema = z.object({
  cpf: z.string().min(11),
  nome: z.string().min(2),
  sobrenome: z.string().min(2),
  email: z.string().email()
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = DadosSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { cpf, nome, sobrenome, email } = parsed.data;
    const user = await prisma.usuarios.findUnique({ where: { cpf } });
    if (!user) return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 });

    if (user.tipo === "Aluno") {
      await prisma.alunos.update({ where: { cpf }, data: { nome, sobrenome } });
    } else if (user.tipo === "Professor" || user.tipo === "Coordenador") {
      await prisma.professores.update({ where: { idProfessor: cpf }, data: { nome, sobrenome } });
    }
    // Email não é salvo em todas as tabelas, mas pode ser salvo em uma tabela de emails se existir

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Erro ao atualizar dados" }, { status: 500 });
  }
}
