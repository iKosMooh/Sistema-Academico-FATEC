import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from 'zod';

// Schema de validação para aulas recorrentes
const AulasRecorrentesSchema = z.object({
  idMateria: z.union([z.string(), z.number()]).transform(val => Number(val)),
  idTurma: z.union([z.string(), z.number()]).transform(val => Number(val)),
  diaSemana: z.union([
    z.string().min(1, 'Dia da semana é obrigatório'),
    z.number().min(0).max(6)
  ]),
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  duracaoMinutos: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => val > 0, 'Duração deve ser maior que 0'),
  dataInicial: z.string().transform(val => {
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error('Data inicial inválida');
    return date;
  }),
  dataFinal: z.string().transform(val => {
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error('Data final inválida');
    return date;
  }),
  listaExcecoes: z.array(z.string()).default([]).transform(arr => 
    arr.map(d => {
      const date = new Date(d);
      if (isNaN(date.getTime())) throw new Error(`Data de exceção inválida: ${d}`);
      return date.toISOString().slice(0, 10);
    })
  ),
}).refine(data => data.dataInicial <= data.dataFinal, {
  message: 'Data inicial deve ser anterior ou igual à data final',
  path: ['dataFinal']
});

function getDayIndex(diaSemana: string | number): number {
  if (typeof diaSemana === "number") {
    return diaSemana >= 0 && diaSemana <= 6 ? diaSemana : -1;
  }
  const dias = [
    "domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"
  ];
  const idx = dias.findIndex(d => d.toLowerCase() === diaSemana.toLowerCase());
  return idx >= 0 ? idx : -1;
}

// Função para verificar se a tabela Aulas existe no banco
async function verificarTabelaAulas(): Promise<boolean> {
  try {
    await prisma.aula.findFirst();
    return true;
  } catch (error) {
    console.warn('Tabela Aulas não existe no banco de dados:', error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validação com Zod
    const validatedData = AulasRecorrentesSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json({ 
        success: false,
        error: 'Dados inválidos',
        details: validatedData.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      }, { status: 400 });
    }

    const {
      idMateria,
      idTurma,
      diaSemana,
      horaInicio,
      duracaoMinutos,
      dataInicial,
      dataFinal,
      listaExcecoes,
    } = validatedData.data;

    // Verificar se a tabela Aulas existe
    const tabelaAulasExiste = await verificarTabelaAulas();
    
    if (!tabelaAulasExiste) {
      return NextResponse.json({ 
        success: false,
        error: 'Tabela Aulas não existe no banco de dados',
        details: [
          'Execute as migrations do Prisma para criar a tabela Aulas:',
          'npx prisma db push',
          'ou',
          'npx prisma migrate dev'
        ]
      }, { status: 503 });
    }

    // Verificar se a turma existe
    const turmaExiste = await prisma.turmas.findUnique({
      where: { idTurma }
    });

    if (!turmaExiste) {
      return NextResponse.json({ 
        success: false,
        error: `Turma com ID ${idTurma} não encontrada`
      }, { status: 404 });
    }

    // Verificar se a matéria existe
    const materiaExiste = await prisma.materias.findUnique({
      where: { idMateria }
    });

    if (!materiaExiste) {
      return NextResponse.json({ 
        success: false,
        error: `Matéria com ID ${idMateria} não encontrada`
      }, { status: 404 });
    }

    const idxSemana = getDayIndex(diaSemana);
    if (idxSemana < 0) {
      return NextResponse.json({ 
        success: false,
        error: "Dia da semana inválido. Use: domingo, segunda, terça, quarta, quinta, sexta, sábado ou 0-6"
      }, { status: 400 });
    }

    // Monta set de exceções
    const excecoesSet = new Set(listaExcecoes);

    // Gera datas recorrentes
    const dataAtual = new Date(dataInicial);
    while (dataAtual.getDay() !== idxSemana && dataAtual <= dataFinal) {
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    type Criada = { id: number; data: string; horaInicio: string };
    type Pulada = { data: string; motivo: string };
    const criadas: Criada[] = [];
    const puladas: Pulada[] = [];

    while (dataAtual <= dataFinal) {
      const dataStr = dataAtual.toISOString().slice(0, 10);
      
      if (excecoesSet.has(dataStr)) {
        puladas.push({ data: dataStr, motivo: "data excluída" });
      } else {
        try {
          // Verifica conflito de horário na turma (sobreposição de horários)
          const inicioNova = new Date(`${dataStr}T${horaInicio}:00.000Z`);
          const fimNova = new Date(inicioNova.getTime() + duracaoMinutos * 60000);

          // Busca todas as aulas da turma nesse dia com tratamento de erro
          let aulasMesmoDia: Array<{
            idAula: number;
            horario: string | null;
            duracaoMinutos: number | null;
          }> = [];
          try {
            aulasMesmoDia = await prisma.aula.findMany({
              where: {
                idTurma,
                dataAula: {
                  gte: new Date(`${dataStr}T00:00:00.000Z`),
                  lte: new Date(`${dataStr}T23:59:59.999Z`)
                }
              },
              select: {
                idAula: true,
                horario: true,
                duracaoMinutos: true
              }
            });
          } catch (findError) {
            console.error('Erro ao buscar aulas existentes:', findError);
            // Se não conseguir buscar, assume que não há conflitos
            aulasMesmoDia = [];
          }

          // Verifica se há sobreposição de horários
          const conflito = aulasMesmoDia.some(aula => {
            if (!aula.horario || !aula.duracaoMinutos) return false;
            
            try {
              const inicioExistente = new Date(`${dataStr}T${aula.horario}:00.000Z`);
              const fimExistente = new Date(inicioExistente.getTime() + aula.duracaoMinutos * 60000);
              
              // Sobreposição: início < fimOutro && fim > inícioOutro
              return inicioNova < fimExistente && fimNova > inicioExistente;
            } catch (dateError) {
              console.warn('Erro ao processar horário da aula existente:', dateError);
              return false;
            }
          });

          if (conflito) {
            puladas.push({ 
              data: dataStr, 
              motivo: "Conflito de horário com aula existente" 
            });
          } else {
            try {
              const aula = await prisma.aula.create({
                data: {
                  idMateria,
                  idTurma,
                  dataAula: inicioNova,
                  horario: horaInicio,
                  duracaoMinutos,
                  aulaConcluida: false,
                  presencasAplicadas: false
                }
              });
              criadas.push({ 
                id: aula.idAula, 
                data: dataStr, 
                horaInicio 
              });
            } catch (createError) {
              console.error(`Erro ao criar aula para ${dataStr}:`, createError);
              puladas.push({ 
                data: dataStr, 
                motivo: `Erro ao criar aula: ${createError instanceof Error ? createError.message : 'Erro desconhecido'}` 
              });
            }
          }
        } catch (aulaError) {
          console.error(`Erro geral ao processar aula para ${dataStr}:`, aulaError);
          puladas.push({ 
            data: dataStr, 
            motivo: `Erro ao processar aula: ${aulaError instanceof Error ? aulaError.message : 'Erro desconhecido'}` 
          });
        }
      }
      
      // Avança para próxima semana
      dataAtual.setDate(dataAtual.getDate() + 7);
    }

    return NextResponse.json({ 
      success: true,
      data: { criadas, puladas },
      message: `${criadas.length} aulas criadas, ${puladas.length} puladas`
    }, { status: 201 });

  } catch (error) {
    console.error("Erro detalhado ao agendar aulas:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        error: 'Dados de entrada inválidos',
        details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      }, { status: 400 });
    }

    // Tratamento específico para erro de tabela não encontrada
    if (error instanceof Error && error.message.includes('does not exist')) {
      return NextResponse.json({ 
        success: false,
        error: 'Tabela Aulas não existe no banco de dados',
        details: [
          'A tabela Aulas não foi encontrada no banco.',
          'Execute: npx prisma db push',
          'Ou execute: npx prisma migrate dev',
          'Para criar as tabelas necessárias.'
        ]
      }, { status: 503 });
    }

    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      details: 'Verifique se as tabelas existem e execute as migrations do Prisma se necessário'
    }, { status: 500 });
  }
}
