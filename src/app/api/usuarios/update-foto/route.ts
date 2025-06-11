import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cpf = formData.get("cpf")?.toString();
    const foto = formData.get("foto") as File | null;

    if (!cpf || !foto) {
      return NextResponse.json({ success: false, error: "CPF e foto são obrigatórios" }, { status: 400 });
    }

    const ext = path.extname(foto.name).toLowerCase() || ".png";
    const allowed = [".png", ".jpg", ".jpeg"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ success: false, error: "Formato de imagem não permitido" }, { status: 400 });
    }

    // Salvar arquivo na pasta correta do fotoPath
    const pasta = path.join(process.cwd(), "public", "pastas", "usuarios", cpf);
    await fs.mkdir(pasta, { recursive: true });
    const filename = `profile${ext}`;
    const buffer = Buffer.from(await foto.arrayBuffer());
    await fs.writeFile(path.join(pasta, filename), buffer);

    // Atualiza o caminho da foto no banco (Alunos, Professores ou Coordenadores)
    const fotoPath = `/pastas/usuarios/${cpf}/${filename}`;
    const user = await prisma.usuarios.findUnique({ where: { cpf } });
    if (!user) return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 });

    if (user.tipo === "Aluno") {
      await prisma.alunos.update({ where: { cpf }, data: { fotoPath } });
    } else if (user.tipo === "Professor" || user.tipo === "Coordenador") {
      await prisma.professores.update({ where: { idProfessor: cpf }, data: { fotoPath } });
    }

    return NextResponse.json({ success: true, fotoPath });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar foto";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
