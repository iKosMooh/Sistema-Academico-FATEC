import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Verifica sessão e autorização (somente Admin pode cadastrar)
    const session = await getServerSession(authOptions);
    if (!session || session.user.tipo !== 'Admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const cpf = formData.get('cpf')?.toString();
    const rg = formData.get('rg')?.toString();

    // Campos obrigatórios: cpf, rg, nome, sobrenome, nomeMae, dataNasc
    const obrigatorios = ['cpf', 'rg', 'nome', 'sobrenome', 'nomeMae', 'dataNasc'];
    const faltando: string[] = [];
    for (const campo of obrigatorios) {
      if (!formData.get(campo)) {
        faltando.push(campo);
      }
    }
    if (faltando.length) {
      return NextResponse.json(
        { error: `Campos obrigatórios ausentes: ${faltando.join(', ')}` },
        { status: 400 }
      );
    }

    // Verifica duplicidade de CPF e RG
    const existe = await prisma.alunos.findFirst({
      where: {
        OR: [
          { cpf },
          { rg }
        ]
      }
    });
    if (existe) {
      return NextResponse.json(
        { error: 'Já existe um aluno com este CPF ou RG' },
        { status: 400 }
      );
    }

    // Preparar upload de foto (opcional)
    const baseDir = path.join(process.cwd(), 'public', 'pastas', 'alunos');
    await fs.mkdir(baseDir, { recursive: true });
    // Após criar o registro, usaremos o idAluno para pasta, mas aqui criamos pasta genérica
    // Recebe arquivo de foto se existir
    let fotoPath: string | null = null;
    const fotoFile = formData.get('foto') as File | null;

    // Cria registro parcial para obter idAluno (sem fotoPath)
    const novoParcial = await prisma.alunos.create({
      data: {
        nome: formData.get('nome')!.toString(),
        sobrenome: formData.get('sobrenome')!.toString(),
        cpf: cpf!,
        rg: rg!,
        nomeMae: formData.get('nomeMae')!.toString(),
        nomePai: formData.get('nomePai')?.toString() || null,
        dataNasc: new Date(formData.get('dataNasc')!.toString()),
        descricao: formData.get('descricao')?.toString() || null,
        // fotoPath será atualizado após salvar arquivo
      }
    });

    const idAluno = novoParcial.idAluno;
    const pastaAluno = path.join(baseDir, String(idAluno));
    await fs.mkdir(pastaAluno, { recursive: true });

    if (fotoFile) {
      const buffer = Buffer.from(await fotoFile.arrayBuffer());
      const ext = path.extname(fotoFile.name) || '.png';
      const filename = `foto${ext}`;
      await fs.writeFile(path.join(pastaAluno, filename), buffer);
      fotoPath = `/pastas/alunos/${idAluno}/${filename}`;
    }

    // Atualiza registro com caminho de foto (caso haja)
    const alunoCompleto = await prisma.alunos.update({
      where: { idAluno },
      data: { fotoPath }
    });

    return NextResponse.json(alunoCompleto);
  } catch (err: any) {
    console.error('🔥 Erro em /api/alunos/insert:', err);
    const message = err.message || 'Erro interno no servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
