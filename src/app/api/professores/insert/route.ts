// src/app/api/professores/insert/route.ts

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
    
    // Log dos dados recebidos
    console.log('Dados recebidos:', Object.fromEntries(formData.entries()));

    // Validações iniciais
    const idProfessor = formData.get("idProfessor")?.toString().replace(/\D/g, '');
    const rg = formData.get("rg")?.toString().replace(/\D/g, '');
    const dataNascStr = formData.get("dataNasc")?.toString();

    if (!idProfessor || idProfessor.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    if (!rg || rg.length < 9) {
      return NextResponse.json({ error: "RG inválido" }, { status: 400 });
    }

    if (!dataNascStr) {
      return NextResponse.json({ error: "Data de nascimento inválida" }, { status: 400 });
    }

    // Formatação do CPF e RG
    const cpfFormatado = idProfessor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    const rgFormatado = rg.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");

    // Verificar existência do usuário e professor separadamente
    const [professorExiste, professorRgExiste, usuarioExiste] = await Promise.all([
      prisma.professores.findUnique({
        where: { idProfessor: cpfFormatado }
      }),
      prisma.professores.findFirst({
        where: { rg: rgFormatado }
      }),
      prisma.usuarios.findUnique({
        where: { cpf: cpfFormatado }
      })
    ]);

    // Verificações específicas
    if (professorExiste) {
      return NextResponse.json(
        { error: "Já existe um professor com este CPF" },
        { status: 400 }
      );
    }

    if (professorRgExiste) {
      return NextResponse.json(
        { error: "Já existe um professor com este RG" },
        { status: 400 }
      );
    }

    // Preparar dados do professor
    const payload = {
      idProfessor: cpfFormatado,
      nome: formData.get("nome")?.toString()?.trim() || "",
      sobrenome: formData.get("sobrenome")?.toString()?.trim() || "",
      rg: rgFormatado,
      dataNasc: new Date(dataNascStr),
      cargo: formData.get("cargo")?.toString()?.trim() || "",
      descricao: formData.get("descricao")?.toString()?.trim() || null,
      tel: formData.get("tel")?.toString()?.trim() || null,
      fotoPath: null as string | null,
      docsPath: `/pastas/professores/${cpfFormatado}`
    };

    // Validar campos obrigatórios
    const camposObrigatorios = ['nome', 'sobrenome', 'cargo'];
    for (const campo of camposObrigatorios) {
      if (!payload[campo as keyof typeof payload]) {
        return NextResponse.json(
          { error: `Campo ${campo} é obrigatório` },
          { status: 400 }
        );
      }
    }

    // Processar foto se existir
    const fotoFile = formData.get("foto") as File | null;
    if (fotoFile) {
      try {
        const baseDir = path.join(process.cwd(), "public", "pastas", "professores", cpfFormatado);
        await fs.mkdir(baseDir, { recursive: true });

        const buffer = Buffer.from(await fotoFile.arrayBuffer());
        const ext = path.extname(fotoFile.name) || ".png";
        const filename = `profile${ext}`;
        await fs.writeFile(path.join(baseDir, filename), buffer);
        payload.fotoPath = `/pastas/professores/${cpfFormatado}/${filename}`;
      } catch (error) {
        console.error('Erro ao processar foto:', error);
      }
    }

    console.log('Payload preparado:', payload);

    try {
      // Criar apenas o professor, já que validamos que ele não existe
      const result = await prisma.professores.create({ data: payload });

      // Se não existe usuário, criar também
      if (!usuarioExiste) {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(idProfessor, salt);
        
        await prisma.usuarios.create({
          data: {
            cpf: cpfFormatado,
            senhaHash,
            tipo: "Professor",
          },
        });
      }

      console.log('Professor criado com sucesso:', result);
      return NextResponse.json({ 
        success: true, 
        data: result,
        message: usuarioExiste ? 
          "Professor criado e vinculado ao usuário existente" : 
          "Professor e usuário criados com sucesso"
      });

    } catch (error) {
      console.error("Erro detalhado:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
      return NextResponse.json({ 
        error: errorMessage,
        details: error
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Erro inesperado:", error);
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 });
  }
}
