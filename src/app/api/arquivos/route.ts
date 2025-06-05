import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Função auxiliar para garantir que a pasta base existe
function ensureBaseFoldersExist() {
  const baseDir = path.join(process.cwd(), "public", "pastas");
  const turmasDir = path.join(baseDir, "turmas");
  const cursosDir = path.join(baseDir, "cursos");

  [baseDir, turmasDir, cursosDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

const getFolder = (tipo: string, id: string) => {
  ensureBaseFoldersExist();
  return path.join(process.cwd(), "public", "pastas", tipo + "s", id);
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo');
  const id = searchParams.get('id');

  if (!tipo || !id) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  try {
    const folder = getFolder(tipo, id);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      return NextResponse.json([]);
    }
    
    const files = fs.readdirSync(folder).map((file) => ({
      name: file,
      url: `/pastas/${tipo}s/${id}/${file}`,
    }));
    return NextResponse.json(files);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return NextResponse.json({ error: "Erro ao listar arquivos" }, { status: 500 });
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
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(folder, file.name);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      name: file.name,
      url: `/pastas/${tipo}s/${id}/${file.name}`
    });
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
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
  } catch (error) {
    console.error('Erro ao remover arquivo:', error);
    return NextResponse.json({ error: "Erro ao remover arquivo" }, { status: 500 });
  }
}
