import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const EnderecoSchema = z.object({
  cpf: z.string().min(11),
  cep: z.string().min(8),
  rua: z.string().min(3),
  cidade: z.string().min(2),
  uf: z.string().length(2),
  numero: z.string().min(1),
  complemento: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = EnderecoSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { cpf, ...endereco } = parsed.data;
    // Busca idAluno ou idProfessor
    const aluno = await prisma.alunos.findFirst({ where: { cpf } });
    if (aluno) {
      await prisma.enderecos.upsert({
        where: { idAluno: aluno.idAluno },
        update: endereco,
        create: { ...endereco, idAluno: aluno.idAluno }
      });
      return NextResponse.json({ success: true });
    }
    // Para professor, pode ser implementado se houver endereço para professor
    return NextResponse.json({ success: false, error: "Usuário não encontrado ou não é aluno" }, { status: 404 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar endereço";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
