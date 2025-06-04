import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const getTurmaFolder = (idTurmaNome: string) =>
  path.join(process.cwd(), "public", "pastas", idTurmaNome);

export async function GET(req: Request, { params }: { params: { idTurma: string } }) {
  try {
    const idTurmaNome = params.idTurma;
    const folder = getTurmaFolder(idTurmaNome);
    if (!fs.existsSync(folder)) return NextResponse.json([]);
    const files = fs.readdirSync(folder).map((file) => ({
      name: file,
      url: `/pastas/${idTurmaNome}/${file}`,
    }));
    return NextResponse.json(files);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request, { params }: { params: { idTurma: string } }) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "Arquivo não enviado." }, { status: 400 });

  const idTurmaNome = params.idTurma;
  const folder = getTurmaFolder(idTurmaNome);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = path.join(folder, file.name);
  fs.writeFileSync(filePath, buffer);

  return NextResponse.json({ success: true, name: file.name, url: `/pastas/${idTurmaNome}/${file.name}` });
}

export async function DELETE(req: Request, { params }: { params: { idTurma: string } }) {
  const url = new URL(req.url);
  const fileName = url.searchParams.get("file");
  if (!fileName) return NextResponse.json({ error: "Arquivo não especificado." }, { status: 400 });

  const idTurmaNome = params.idTurma;
  const folder = getTurmaFolder(idTurmaNome);
  const filePath = path.join(folder, fileName);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "Erro ao remover arquivo." }, { status: 500 });
  }
}
