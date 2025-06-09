// src/app/api/alunos/insert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.tipo !== "Admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const nome = formData.get("nome")?.toString() ?? "";
    const sobrenome = formData.get("sobrenome")?.toString() ?? "";
    const cpf = formData.get("cpf")?.toString() ?? "";
    const rg = formData.get("rg")?.toString() ?? "";
    const nomeMae = formData.get("nomeMae")?.toString() ?? "";
    const nomePai = formData.get("nomePai")?.toString() ?? "";
    const dataNascRaw = formData.get("dataNasc")?.toString() ?? "";
    const descricao = formData.get("descricao")?.toString() ?? "";
    const nomeTel1 = formData.get("nomeTel1")?.toString() ?? "";
    const tel1 = formData.get("tel1")?.toString() ?? "";
    const nomeTel2 = formData.get("nomeTel2")?.toString() ?? "";
    const tel2 = formData.get("tel2")?.toString() ?? "";

    // Campos obrigatórios
    const faltando: string[] = [];
    if (!nome) faltando.push("nome");
    if (!sobrenome) faltando.push("sobrenome");
    if (!cpf) faltando.push("cpf");
    if (!rg) faltando.push("rg");
    if (!nomeMae) faltando.push("nomeMae");
    if (!dataNascRaw) faltando.push("dataNasc");
    if (!nomeTel1) faltando.push("nomeTel1");
    if (!tel1) faltando.push("tel1");

    if (faltando.length) {
      return NextResponse.json(
        { error: `Campos obrigatórios ausentes: ${faltando.join(", ")}` },
        { status: 400 }
      );
    }

    const dataNasc = new Date(dataNascRaw);
    if (isNaN(dataNasc.getTime())) {
      return NextResponse.json(
        { error: "Data de nascimento inválida." },
        { status: 400 }
      );
    }

    // Verificar duplicidade de CPF ou RG
    const existe = await prisma.alunos.findFirst({
      where: {
        OR: [{ cpf }, { rg }],
      },
    });
    if (existe) {
      return NextResponse.json(
        { error: "Já existe um aluno com este CPF ou RG" },
        { status: 400 }
      );
    }

    // Preparar diretório para foto (opcional)
    const baseDir = path.join(process.cwd(), "public", "pastas", "alunos");
    await fs.mkdir(baseDir, { recursive: true });
    const pasta = path.join(baseDir, cpf);
    await fs.mkdir(pasta, { recursive: true });

    let fotoPath: string | null = null;
    const fotoFile = formData.get("foto") as File | null;
    if (fotoFile) {
      const buffer = Buffer.from(await fotoFile.arrayBuffer());
      const ext = path.extname(fotoFile.name) || ".png";
      const filename = `profile${ext}`;
      await fs.writeFile(path.join(pasta, filename), buffer);
      fotoPath = `/pastas/alunos/${cpf}/${filename}`;
    }

    // Inserir nas três tabelas em transação
    const novoAluno = await prisma.$transaction(async (tx) => {
      // 1) Criar registro em Alunos
      const aluno = await tx.alunos.create({
        data: {
          nome,
          sobrenome,
          cpf,
          rg,
          nomeMae,
          nomePai: nomePai || null,
          dataNasc,
          descricao: descricao || null,
          fotoPath,
        },
      });

      // 2) Criar registro em ContatoAluno
      await tx.contatoAluno.create({
        data: {
          idAluno: aluno.idAluno,
          nomeTel1,
          tel1,
          nomeTel2: nomeTel2 || null,
          tel2: tel2 || null,
        },
      });

      // 3) Criar usuário na tabela Usuarios (senhaHash = bcrypt do CPF)
      // Só cria se NÃO existir usuário com esse CPF
      const usuarioExistente = await tx.usuarios.findUnique({
        where: { cpf },
      });
      if (!usuarioExistente) {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(cpf, salt); // <--- CPF (com pontuação) é a senha original
        await tx.usuarios.create({
          data: {
            cpf: cpf,
            senhaHash,
            tipo: "Aluno",
          },
        });
      }

      return aluno;
    });

    return NextResponse.json(novoAluno);
  } catch (_err: unknown) {
    const err = _err as Error;
    console.error("🔥 Erro em /api/alunos/insert:", err);
    const message = err.message || "Erro interno no servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
