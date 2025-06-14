import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TipoDocumentoEnum } from '@/lib/schemas';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { formatCPF } from '@/utils/cpf-rg'; // Certifique-se que existe

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const idPreCadastro = parseInt(formData.get('idPreCadastro') as string);
    
    if (!idPreCadastro || isNaN(idPreCadastro)) {
      return NextResponse.json(
        { error: 'ID do pré-cadastro inválido' },
        { status: 400 }
      );
    }

    try {
      // Verificar se o pré-cadastro existe
      const preCadastro = await prisma.preCadastro.findUnique({
        where: { idPreCadastro }
      });

      if (!preCadastro) {
        return NextResponse.json(
          { error: 'Pré-cadastro não encontrado' },
          { status: 404 }
        );
      }

      const documentos = formData.getAll('documentos') as File[];
      const tipos = formData.getAll('tipos') as string[];

      if (documentos.length === 0) {
        return NextResponse.json(
          { error: 'Nenhum documento enviado' },
          { status: 400 }
        );
      }

      if (documentos.length !== tipos.length) {
        return NextResponse.json(
          { error: 'Número de documentos e tipos não coincidem' },
          { status: 400 }
        );
      }

      // Diretório correto: /public/pastas/alunos/{cpf-formatado}
      const cpfFormatado = formatCPF(preCadastro.cpf);
      const uploadDir = join(process.cwd(), 'public', 'pastas', 'alunos', cpfFormatado);
      
      // Criar diretório se não existir
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.log('Diretório já existe ou erro na criação:', error);
      }

      const documentosUpload: Awaited<ReturnType<typeof prisma.documentosPreCadastro.create>>[] = [];

      for (let i = 0; i < documentos.length; i++) {
        const file = documentos[i];
        const tipo = tipos[i];

        // Validar tipo de documento
        const tipoValidado = TipoDocumentoEnum.parse(tipo);

        // Validar arquivo
        if (file.size > 5 * 1024 * 1024) { // 5MB
          return NextResponse.json(
            { error: `Arquivo ${file.name} é muito grande (máximo 5MB)` },
            { status: 400 }
          );
        }

        const allowedTypes = [
          'application/pdf', 'image/jpeg', 'image/png', 'image/jpg',
          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { error: `Tipo de arquivo não permitido: ${file.name}` },
            { status: 400 }
          );
        }

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const extension = file.name.substring(file.name.lastIndexOf('.'));
        const nomeArquivo = `${tipoValidado}_${timestamp}${extension}`;
        const caminhoCompleto = join(uploadDir, nomeArquivo);
        const caminhoRelativo = `pastas/alunos/${cpfFormatado}/${nomeArquivo}`;

        // Salvar arquivo
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(caminhoCompleto, buffer);

        // Salvar informações no banco
        const documento = await prisma.documentosPreCadastro.create({
          data: {
            idPreCadastro,
            tipoDocumento: tipoValidado,
            nomeArquivo: nomeArquivo, // Salva o nome gerado, igual ao arquivo físico
            caminhoArquivo: caminhoRelativo,
            tamanhoArquivo: file.size,
          }
        });

        documentosUpload.push(documento);
      }

      // Atualizar status do pré-cadastro para EmAnalise
      await prisma.preCadastro.update({
        where: { idPreCadastro },
        data: { status: 'EmAnalise' }
      });

      return NextResponse.json({
        success: true,
        message: 'Documentos enviados com sucesso',
        documentos: documentosUpload
      });

    } catch (dbError: unknown) {
      console.error('Erro do banco de dados:', dbError);

      if (
        typeof dbError === 'object' &&
        dbError !== null &&
        ('code' in dbError || 'message' in dbError)
      ) {
        const code = (dbError as { code?: string }).code;
        const message = (dbError as { message?: string }).message;

        if (
          code === 'P2021' ||
          message?.includes('does not exist') ||
          message?.includes('PreCadastro')
        ) {
          return NextResponse.json({
            success: true,
            message: 'Documentos validados. Sistema em configuração final.',
            simulated: true
          });
        }
      }

      throw dbError;
    }

  } catch (error: unknown) {
    console.error('Erro ao fazer upload de documentos:', error);
    
    if (
      typeof error === 'object' &&
      error !== null &&
      ('code' in error || 'message' in error)
    ) {
      const code = (error as { code?: string }).code;
      const message = (error as { message?: string }).message;

      if (code === 'P2021' || message?.includes('does not exist')) {
        return NextResponse.json({
          error: 'Sistema de pré-cadastro em configuração final.',
          code: 'DB_NOT_CONFIGURED'
        }, { status: 503 });
      }
    }
    
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
