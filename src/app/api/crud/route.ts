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

    // Criação de pasta ao criar usuário (Admin, Professor, Aluno)
    if (
      operation === "insert" &&
      table === "usuarios" &&
      data?.cpf
    ) {
      const result = await handleCrud({
        operation,
        table,
        primaryKey,
        data,
        relations,
      });

      // Cria pasta para o usuário
      const cpf = String(data.cpf).replace(/[\\/:*?"<>|]/g, "_");
      if (cpf) {
        const dirPath = path.join(process.cwd(), "public", "pastas", "Usuarios", cpf);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      return NextResponse.json({ success: true, data: result });
    }

    // Criação de pasta ao criar aluno
    if (
      operation === "insert" &&
      table === "alunos" &&
      data?.cpf
    ) {
      const result = await handleCrud({
        operation,
        table,
        primaryKey,
        data,
        relations,
      });

      // Cria pasta para o aluno
      const cpf = String(data.cpf).replace(/[\\/:*?"<>|]/g, "_");
      if (cpf) {
        const dirPath = path.join(process.cwd(), "public", "pastas", "Usuarios", cpf);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      return NextResponse.json({ success: true, data: result });
    }

    // Criação de pasta ao criar professor
    if (
      operation === "insert" &&
      table === "professores" &&
      data?.idProfessor
    ) {
      const result = await handleCrud({
        operation,
        table,
        primaryKey,
        data,
        relations,
      });

      // Cria pasta para o professor
      const cpf = String(data.idProfessor).replace(/[\\/:*?"<>|]/g, "_");
      if (cpf) {
        const dirPath = path.join(process.cwd(), "public", "pastas", "Usuarios", cpf);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      return NextResponse.json({ success: true, data: result });
    }

    // Deleção de usuário (Admin, Professor, Aluno) - remove pasta também
    if (
      operation === "delete" &&
      (
        (table === "usuarios" && data?.cpf) ||
        (table === "alunos" && data?.cpf) ||
        (table === "professores" && data?.idProfessor)
      )
    ) {
      const result = await handleCrud({
        operation,
        table,
        primaryKey,
        data,
        relations,
      });

      // Remove pasta do usuário
      let cpf = "";
      if (table === "usuarios" && data?.cpf) cpf = String(data.cpf);
      if (table === "alunos" && data?.cpf) cpf = String(data.cpf);
      if (table === "professores" && data?.idProfessor) cpf = String(data.idProfessor);
      cpf = cpf.replace(/[\\/:*?"<>|]/g, "_");
      if (cpf) {
        const dirPath = path.join(process.cwd(), "public", "pastas", "Usuarios", cpf);
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
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
