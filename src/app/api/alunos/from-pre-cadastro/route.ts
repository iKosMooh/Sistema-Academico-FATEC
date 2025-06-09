import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { formatCPF, formatRG } from "@/utils/cpf-rg";

/**
 * Cria um aluno a partir dos dados de um pré-cadastro.
 * Espera receber { idPreCadastro: number } no corpo da requisição.
 */
export async function POST(req: NextRequest) {
  try {
    const { idPreCadastro } = await req.json();

    if (!idPreCadastro || typeof idPreCadastro !== "number") {
      return NextResponse.json({ error: "idPreCadastro inválido" }, { status: 400 });
    }

    // Busca o pré-cadastro
    const preCadastro = await prisma.preCadastro.findUnique({
      where: { idPreCadastro },
    });

    if (!preCadastro) {
      return NextResponse.json({ error: "Pré-cadastro não encontrado" }, { status: 404 });
    }

    // Extrai e formata o CPF do pré-cadastro
    const cpf = formatCPF(preCadastro.cpf);

    // Verifica se já existe aluno com o mesmo CPF
    const alunoExistente = await prisma.alunos.findUnique({
      where: { cpf: cpf },
    });

    if (alunoExistente) {
      return NextResponse.json({ error: "Já existe um aluno com este CPF" }, { status: 409 });
    }

    // Formata RG para o banco
    const rgBanco = formatRG(preCadastro.rg);

    // Cria o aluno
    const aluno = await prisma.alunos.create({
      data: {
        nome: preCadastro.nome,
        sobrenome: preCadastro.sobrenome,
        cpf: cpf,
        rg: rgBanco,
        nomeMae: preCadastro.nomeMae,
        nomePai: preCadastro.nomePai || null,
        dataNasc: preCadastro.dataNasc,
        descricao: "Criado automaticamente a partir do pré-cadastro",
      },
    });

    // Cria contato
    await prisma.contatoAluno.create({
      data: {
        idAluno: aluno.idAluno,
        nomeTel1: preCadastro.nomeResponsavel || preCadastro.nomeMae || preCadastro.nome,
        tel1: preCadastro.telefone,
        nomeTel2: preCadastro.nomeResponsavel || null,
        tel2: preCadastro.telefoneResponsavel || null,
      },
    });

    // Cria endereço
    await prisma.enderecos.create({
      data: {
        idAluno: aluno.idAluno,
        cep: preCadastro.cep,
        rua: preCadastro.rua,
        cidade: preCadastro.cidade,
        uf: preCadastro.uf,
        numero: preCadastro.numero,
      },
    });

    return NextResponse.json({ success: true, aluno });
  } catch (err: unknown) {
    console.error("Erro ao criar aluno a partir do pré-cadastro:", err);
    const errorMessage = err instanceof Error ? err.message : "Erro interno do servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
