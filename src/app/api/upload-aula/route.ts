import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivos = formData.getAll('arquivos') as File[];
    const idAula = formData.get('idAula') as string;
    const tipo = formData.get('tipo') as string; // 'planejamento' ou 'materiais'

    console.log('Upload request:', { idAula, tipo, arquivosCount: arquivos.length });

    if (!idAula || !arquivos.length) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Buscar informações da aula para criar estrutura de pastas
    const aula = await prisma.aula.findUnique({
      where: { idAula: parseInt(idAula) },
      include: { turma: true }
    });

    if (!aula) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 });
    }

    const baseDir = path.join(process.cwd(), 'uploads', 'turmas', `turma_${aula.idTurma}`, 'aulas', `aula_${idAula}`, tipo);
    
    // Criar diretório se não existir
    await mkdir(baseDir, { recursive: true });

    const arquivosSalvos = [];

    for (const arquivo of arquivos) {
      const bytes = await arquivo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const nomeArquivo = `${timestamp}_${arquivo.name}`;
      const caminhoArquivo = path.join(baseDir, nomeArquivo);

      await writeFile(caminhoArquivo, buffer);
      
      // Salvar referência no banco
      const docSalvo = await prisma.docsAula.create({
        data: {
          idAula: parseInt(idAula),
          src: path.join('turmas', `turma_${aula.idTurma}`, 'aulas', `aula_${idAula}`, tipo, nomeArquivo).replace(/\\/g, '/')
        }
      });

      arquivosSalvos.push(docSalvo);
    }

    console.log('Upload concluído:', arquivosSalvos);

    return NextResponse.json({ 
      success: true, 
      arquivos: arquivosSalvos,
      message: `${arquivos.length} arquivo(s) enviado(s) com sucesso`
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
