// src\app\api\crud\route.ts
import { NextResponse } from 'next/server';
import { handleCrud } from '@/lib/crudService';
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { operation, table, primaryKey, data, relations } = await req.json();

    // Criação de pasta ao criar turma
    if (operation === "insert" && table === "turmas" && data?.nomeTurma) {
      // Chama o CRUD normalmente
      type CrudResult = { idTurma?: number|string; insertId?: number|string; id?: number|string; [key: string]: number | string | undefined };
      const result = await handleCrud({
        operation,
        table,
        primaryKey,
        data,
        relations,
      }) as CrudResult;

      // Após criar, cria a pasta
      const idTurma = result?.idTurma || result?.insertId || result?.id; // depende do retorno do seu CRUD
      const nomeTurma = data.nomeTurma.replace(/[\\/:*?"<>|]/g, "_");
      if (idTurma && nomeTurma) {
        const dirPath = path.join(process.cwd(), "public", "pastas", `id-${idTurma}${nomeTurma}`);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      return NextResponse.json({ success: true, data: result });
    }

    const result = await handleCrud({
      operation,
      table,
      primaryKey,
      data,
      relations,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('Erro no CRUD:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
