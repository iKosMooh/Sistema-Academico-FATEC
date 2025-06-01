import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar sessão e tipo de usuário (somente Admin cadastra)
    const session = await getServerSession(authOptions);
    if (!session || session.user.tipo !== "Admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();

    // 2. Extrair campos de Alunos e ContatoAluno do FormData
    const nome = formData.get("nome")?.toString()?.trim() || null;
    const sobrenome = formData.get("sobrenome")?.toString()?.trim() || null;
    const cpf = formData.get("cpf")?.toString()?.trim() || null;
    const rg = formData.get("rg")?.toString()?.trim() || null;
    const nomeMae = formData.get("nomeMae")?.toString()?.trim() || null;
    const nomePai = formData.get("nomePai")?.toString()?.trim() || null;
    const dataNascRaw = formData.get("dataNasc")?.toString() || null;
    const descricao = formData.get("descricao")?.toString()?.trim() || null;

    const nomeTel1 = formData.get("nomeTel1")?.toString()?.trim() || null;
    const tel1 = formData.get("tel1")?.toString()?.trim() || null;
    const nomeTel2 = formData.get("nomeTel2")?.toString()?.trim() || null;
    const tel2 = formData.get("tel2")?.toString()?.trim() || null;

    // 3. Verificar obrigatoriedade dos campos principais
    const faltando: string[] = [];
    if (!nome) faltando.push("nome");
    if (!sobrenome) faltando.push("sobrenome");
    if (!cpf) faltando.push("cpf");
    if (!rg) faltando.push("rg");
    if (!nomeMae) faltando.push("nomeMae");
    if (!dataNascRaw) faltando.push("dataNasc");

    // Verificar obrigatoriedade do contato
    if (!nomeTel1) faltando.push("nomeTel1");
    if (!tel1) faltando.push("tel1");

    if (faltando.length) {
      return NextResponse.json(
        { error: `Campos obrigatórios ausentes: ${faltando.join(", ")}` },
        { status: 400 }
      );
    }

    // 4. Verificar duplicidade de CPF e RG na tabela Alunos
    const existeAluno = await prisma.alunos.findFirst({
      where: {
        OR: [
          { cpf: cpf! },
          { rg: rg! },
        ],
      },
    });
    if (existeAluno) {
      return NextResponse.json(
        { error: "Já existe um aluno com este CPF ou RG" },
        { status: 400 }
      );
    }

    // 5. Converter data de nascimento em Date
    const dataNasc = new Date(dataNascRaw!);
    if (isNaN(dataNasc.getTime())) {
      return NextResponse.json(
        { error: "Data de Nascimento inválida" },
        { status: 400 }
      );
    }

    // 6. Criar registro de Aluno + ContatoAluno em operação única (nested create)
    //    A coluna fotoPath ficará null nesta etapa; atualizaremos após salvar o arquivo.
    const novoAluno = await prisma.alunos.create({
      data: {
        nome: nome!,
        sobrenome: sobrenome!,
        cpf: cpf!,
        rg: rg!,
        nomeMae: nomeMae!,
        nomePai: nomePai || null,
        dataNasc,
        descricao: descricao || null,
        // Nested create de ContatoAluno
        contato: {
          create: {
            nomeTel1: nomeTel1!,
            tel1: tel1!,
            nomeTel2: nomeTel2 || null,
            tel2: tel2 || null,
          },
        },
      },
      include: {
        contato: true, // para retornar também os dados de ContatoAluno
      },
    });

    const idAluno = novoAluno.idAluno;

    // 7. Processar upload de foto (se houver)
    const fotoFile = formData.get("foto") as File | null;
    let fotoPath: string | null = null;
    if (fotoFile) {
      // Caminho base: public/pastas/alunos/{idAluno}
      const baseDir = path.join(process.cwd(), "public", "pastas", "alunos");
      const pastaAluno = path.join(baseDir, String(idAluno));
      await fs.mkdir(pastaAluno, { recursive: true });

      const buffer = Buffer.from(await fotoFile.arrayBuffer());
      const ext = path.extname(fotoFile.name) || ".png";
      const filename = `foto${ext}`;

      await fs.writeFile(path.join(pastaAluno, filename), buffer);
      fotoPath = `/pastas/alunos/${idAluno}/${filename}`;
    }

    // 8. Se fotoPath não for nulo, atualizar o campo fotoPath no registro de Aluno
    let alunoComFoto = novoAluno;
    if (fotoPath) {
      alunoComFoto = await prisma.alunos.update({
        where: { idAluno },
        data: { fotoPath },
        include: { contato: true },
      });
    }

    // 9. Retornar o objeto completo (Aluno + ContatoAluno + fotoPath se houver)
    return NextResponse.json(alunoComFoto);
  } catch (err: any) {
    console.error("🔥 Erro em /api/alunos/insert:", err);
    const message = err.message || "Erro interno no servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
