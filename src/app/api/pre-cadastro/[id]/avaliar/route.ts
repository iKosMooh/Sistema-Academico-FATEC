import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AvaliacaoPreCadastroSchema } from '@/lib/schemas';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = AvaliacaoPreCadastroSchema.parse({
      ...body,
      idPreCadastro: parseInt(params.id)
    });

    // Verificar se o pré-cadastro existe
    const preCadastro = await prisma.preCadastro.findUnique({
      where: { idPreCadastro: data.idPreCadastro }
    });

    if (!preCadastro) {
      return NextResponse.json(
        { error: 'Pré-cadastro não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar status do pré-cadastro
    const preCadastroAtualizado = await prisma.preCadastro.update({
      where: { idPreCadastro: data.idPreCadastro },
      data: {
        status: data.status as 'Pendente' | 'Aprovado' | 'Rejeitado',
        observacoes: data.observacoes,
        motivoRejeicao: data.motivoRejeicao,
        avaliadoPor: data.avaliadoPor,
        dataAvaliacao: new Date()
      }
    });

    // Se aprovado, criar aluno automaticamente
    if (data.status === 'Aprovado') {
      try {
        // Verificar se já existe aluno com este CPF
        const alunoExistente = await prisma.alunos.findUnique({
          where: { cpf: preCadastro.cpf }
        });

        if (alunoExistente) {
          return NextResponse.json(
            { error: 'Aluno já existe no sistema' },
            { status: 400 }
          );
        }

        // Criar aluno
        const aluno = await prisma.alunos.create({
          data: {
            nome: preCadastro.nome,
            sobrenome: preCadastro.sobrenome,
            cpf: preCadastro.cpf,
            rg: preCadastro.rg,
            nomeMae: preCadastro.nomeMae,
            nomePai: preCadastro.nomePai,
            dataNasc: preCadastro.dataNasc,
            descricao: `Matrícula aprovada via pré-cadastro em ${new Date().toLocaleDateString()}`
          }
        });

        // Criar endereço
        await prisma.enderecos.create({
          data: {
            idAluno: aluno.idAluno,
            cep: preCadastro.cep,
            rua: preCadastro.rua,
            cidade: preCadastro.cidade,
            uf: preCadastro.uf,
            numero: preCadastro.numero
          }
        });

        // Criar contato
        await prisma.contatoAluno.create({
          data: {
            idAluno: aluno.idAluno,
            nomeTel1: 'Principal',
            tel1: preCadastro.telefone,
            nomeTel2: preCadastro.nomeResponsavel || null,
            tel2: preCadastro.telefoneResponsavel || null
          }
        });
        // Criar usuário
        const senhaTemporaria = Math.random().toString(36).slice(-8);
        const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

        await prisma.usuarios.create({
          data: {
            cpf: preCadastro.cpf,
            senhaHash,
            tipo: 'Aluno'
          }
        });

        // Log das credenciais (em produção, enviar por email)
        console.log(`Credenciais para ${preCadastro.nome}: CPF: ${preCadastro.cpf}, Senha: ${senhaTemporaria}`);

      } catch (error) {
        console.error('Erro ao criar aluno automaticamente:', error);
        return NextResponse.json(
          { error: 'Erro ao criar aluno no sistema' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      preCadastro: preCadastroAtualizado 
    });

  } catch (error) {
    console.error('Erro ao avaliar pré-cadastro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
