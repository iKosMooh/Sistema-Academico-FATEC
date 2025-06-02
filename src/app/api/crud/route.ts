// src\app\api\crud\route.ts
import { NextResponse } from 'next/server';
import { handleCrud } from '@/lib/crudService';

export async function POST(req: Request) {
  try {
    const { operation, table, primaryKey, data, relations } = await req.json();

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
