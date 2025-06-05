// src\app\api\crud\route.ts
import { NextResponse } from 'next/server';
import { handleCrud } from '@/lib/crudService';
import { z } from 'zod';

// Schema de validação para payload
const requestSchema = z.object({
  operation: z.enum(['get', 'insert', 'update', 'delete', 'upsert']),
  table: z.string(),
  primaryKey: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  relations: z.record(z.union([z.boolean(), z.object({})])).optional(),
  where: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Valida o payload
    const validatedData = requestSchema.safeParse(payload);
    if (!validatedData.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payload inválido',
        details: validatedData.error.issues
      }, { status: 400 });
    }

    // Executa operação CRUD através do service
    const result = await handleCrud(payload);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro na operação:', error);
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 });
  }
}
