import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const AvaliacaoSchema = z.object({
  idAtestado: z.number().int().positive(),
  status: z.enum(['Aprovado', 'Rejeitado']),
  avaliadoPor: z.string().min(11).max(14),
  justificativaRejeicao: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idAtestado, status, avaliadoPor, justificativaRejeicao } = AvaliacaoSchema.parse(body);

    // Verificar se o professor existe
    const professor = await prisma.professores.findUnique({
      where: { idProfessor: avaliadoPor }
    });

    if (!professor) {
      return NextResponse.json({
        success: false,
        error: 'Professor não encontrado'
      }, { status: 404 });
    }

    // Verificar se o atestado existe e está pendente
    const atestado = await prisma.atestadosMedicos.findUnique({
      where: { idAtestado },
      include: {
        aulasJustificadas: {
          include: {
            aula: true
          }
        }
      }
    });

    if (!atestado) {
      return NextResponse.json({
        success: false,
        error: 'Atestado não encontrado'
      }, { status: 404 });
    }

    if (atestado.status !== 'Pendente') {
      return NextResponse.json({
        success: false,
        error: 'Atestado já foi avaliado'
      }, { status: 400 });
    }

    // Atualizar o atestado
    const atestadoAtualizado = await prisma.atestadosMedicos.update({
      where: { idAtestado },
      data: {
        status,
        avaliadoPor,
        dataAvaliacao: new Date(),
        justificativaRejeicao: status === 'Rejeitado' ? justificativaRejeicao : null
      }
    });

    // Se aprovado, aplicar justificativas nas presenças
    if (status === 'Aprovado') {
      for (const aulaJustificada of atestado.aulasJustificadas) {
        // Verificar se já existe registro de presença
        const presencaExistente = await prisma.presencas.findFirst({
          where: {
            idAula: aulaJustificada.idAula,
            idAluno: atestado.idAluno
          }
        });

        if (presencaExistente) {
          // Atualizar presença existente para presente com justificativa
          await prisma.presencas.update({
            where: { idPresenca: presencaExistente.idPresenca },
            data: {
              presente: true,
              justificativa: `Atestado médico aprovado - ${atestado.motivo}`
            }
          });
        } else {
          // Criar novo registro de presença justificada
          await prisma.presencas.create({
            data: {
              idAula: aulaJustificada.idAula,
              idAluno: atestado.idAluno,
              idProfessor: avaliadoPor,
              presente: true,
              justificativa: `Atestado médico aprovado - ${atestado.motivo}`,
              dataRegistro: new Date()
            }
          });
        }

        // Marcar como aplicado na tabela AtestadoAulas
        await prisma.atestadoAulas.update({
          where: {
            idAtestado_idAula: {
              idAtestado,
              idAula: aulaJustificada.idAula
            }
          },
          data: {
            aplicado: true,
            dataAplicacao: new Date()
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { 
        idAtestado: atestadoAtualizado.idAtestado,
        status: atestadoAtualizado.status
      },
      message: `Atestado ${status.toLowerCase()} com sucesso`
    });

  } catch (error: unknown) {
    console.error('Erro ao avaliar atestado:', error);
    
    if (error instanceof z.ZodError) {
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
