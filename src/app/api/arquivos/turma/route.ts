import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const getFolder = (tipo: string, id: string) =>
  path.join(process.cwd(), "public", "pastas", tipo, id);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo'); // 'turma' ou 'curso'
  const id = searchParams.get('id');

  if (!tipo || !id) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  try {
    const folder = getFolder(tipo, id);
    if (!fs.existsSync(folder)) return NextResponse.json([]);
    
    const files = fs.readdirSync(folder).map((file) => ({
      name: file,
      url: `/pastas/${tipo}/${id}/${file}`,
    }));
    return NextResponse.json(files);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const tipo = formData.get("tipo") as string;
  const id = formData.get("id") as string;

  if (!file || !tipo || !id) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  try {
    const folder = getFolder(tipo, id);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(folder, file.name);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      name: file.name,
      url: `/pastas/${tipo}/${id}/${file.name}`
    });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar arquivo" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo');
  const id = searchParams.get('id');
  const fileName = searchParams.get('file');

  if (!tipo || !id || !fileName) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  try {
    const folder = getFolder(tipo, id);
    const filePath = path.join(folder, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Erro ao remover arquivo" }, { status: 500 });
  }
}
