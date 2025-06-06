import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { ZodError } from 'zod';
import { UploadAtestadoSchema } from '@/lib/schemas';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File;
    const dadosString = formData.get('dados') as string;

    if (!arquivo || !dadosString) {
      return NextResponse.json({ 
        success: false, 
        error: 'Arquivo e dados são obrigatórios' 
      }, { status: 400 });
    }

    const dados = JSON.parse(dadosString);
    
    // Validar dados com schema corrigido
    const { idAluno, dataInicio, dataFim, motivo, aulasAfetadas, observacoes, idTurma } =
      UploadAtestadoSchema.parse(dados);

    if (!arquivo) {
      return NextResponse.json({ 
        success: false, 
        error: 'Arquivo é obrigatório' 
      }, { status: 400 });
    }

    // Verificar se o aluno existe
    const aluno = await prisma.alunos.findUnique({
      where: { idAluno }
    });

    if (!aluno) {
      return NextResponse.json({ 
        success: false, 
        error: 'Aluno não encontrado' 
      }, { status: 404 });
    }

    // Verificar se o aluno pertence à turma (se fornecida)
    if (idTurma) {
      const pertenceTurma = await prisma.turmaAluno.findFirst({
        where: {
          idAluno,
          idTurma
        }
      });

      if (!pertenceTurma) {
        return NextResponse.json({ 
          success: false, 
          error: 'Aluno não pertence à turma selecionada' 
        }, { status: 400 });
      }
    }

    // Verificar se todas as aulas existem e pertencem à turma (se fornecida)
    for (const idAula of aulasAfetadas) {
      const whereClause: { idAula: number; idTurma?: number } = { idAula };
      if (idTurma) {
        whereClause.idTurma = idTurma;
      }

      const aula = await prisma.aula.findFirst({
        where: whereClause
      });

      if (!aula) {
        return NextResponse.json({ 
          success: false, 
          error: `Aula ${idAula} não encontrada ou não pertence à turma selecionada` 
        }, { status: 400 });
      }
    }

    // Criar diretório para upload se não existir
    const uploadDir = path.join(process.cwd(), 'uploads', 'atestados');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Diretório já existe ou erro ao criar
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = arquivo.name.split('.').pop();
    const nomeArquivo = `atestado_${idAluno}_${timestamp}.${extension}`;
    const caminhoArquivo = path.join(uploadDir, nomeArquivo);

    // Salvar arquivo
    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(caminhoArquivo, buffer);

    // Criar registro do atestado
    const atestado = await prisma.atestadosMedicos.create({
      data: {
        idAluno,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        motivo: motivo.trim(),
        arquivoPath: `/uploads/atestados/${nomeArquivo}`,
        observacoes: observacoes || null,
        status: 'Pendente'
      }
    });

    // Criar registros de aulas justificadas
    const aulasJustificadas = aulasAfetadas.map(idAula => ({
      idAtestado: atestado.idAtestado,
      idAula
    }));

    await prisma.atestadoAulas.createMany({
      data: aulasJustificadas
    });

    return NextResponse.json({
      success: true,
      data: { idAtestado: atestado.idAtestado },
      message: 'Atestado enviado com sucesso'
    });

  } catch (error: unknown) {
    console.error('Erro ao processar atestado:', error);
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: `Dados inválidos: ${error.issues.map((i) => i.message).join(', ')}`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idAluno = searchParams.get('idAluno');

    if (!idAluno) {
      return NextResponse.json({
        success: false,
        error: 'ID do aluno é obrigatório'
      }, { status: 400 });
    }

    const atestados = await prisma.atestadosMedicos.findMany({
      where: { idAluno: parseInt(idAluno) },
      include: {
        aulasJustificadas: {
          include: {
            aula: {
              include: {
                materia: true
              }
            }
          }
        }
      },
      orderBy: { dataEnvio: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: atestados
    });

  } catch (error) {
    console.error('Erro ao buscar atestados:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}