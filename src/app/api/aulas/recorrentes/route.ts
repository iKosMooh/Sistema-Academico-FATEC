import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function getDayIndex(diaSemana: string | number): number {
  if (typeof diaSemana === "number") return diaSemana;
  const dias = [
    "domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"
  ];
  const idx = dias.findIndex(d => d.toLowerCase() === diaSemana.toLowerCase());
  return idx >= 0 ? idx : -1;
}

export async function POST(req: Request) {
  try {
    const {
      idMateria,
      idTurma,
      diaSemana,
      horaInicio,
      duracaoMinutos,
      dataInicial,
      dataFinal,
      listaExcecoes = [],
    } = await req.json();

    // Validações
    if (
      !idMateria ||
      !idTurma ||
      diaSemana === undefined ||
      !horaInicio ||
      !duracaoMinutos ||
      !dataInicial ||
      !dataFinal
    ) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }
    if (duracaoMinutos <= 0) {
      return NextResponse.json({ error: "Duração deve ser positiva." }, { status: 400 });
    }
    const idxSemana = getDayIndex(diaSemana);
    if (idxSemana < 0 || idxSemana > 6) {
      return NextResponse.json({ error: "Dia da semana inválido." }, { status: 400 });
    }
    const dtIni = new Date(dataInicial);
    const dtFim = new Date(dataFinal);
    if (isNaN(dtIni.getTime()) || isNaN(dtFim.getTime()) || dtIni > dtFim) {
      return NextResponse.json({ error: "Intervalo de datas inválido." }, { status: 400 });
    }
    // Monta set de exceções
    const excecoesSet = new Set(
      (listaExcecoes as string[]).map((d: string) => new Date(d).toISOString().slice(0, 10))
    );

    // Gera datas recorrentes
    const dataAtual = new Date(dtIni);
    while (dataAtual.getDay() !== idxSemana && dataAtual <= dtFim) {
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    type Criada = { id: number; data: string; horaInicio: string };
    type Pulada = { data: string; motivo: string };
    const criadas: Criada[] = [];
    const puladas: Pulada[] = [];
    while (dataAtual <= dtFim) {
      const dataStr = dataAtual.toISOString().slice(0, 10);
      if (excecoesSet.has(dataStr)) {
        puladas.push({ data: dataStr, motivo: "data excluída" });
      } else {
        // Verifica duplicidade
        const existe = await prisma.aula.findFirst({
          where: {
            idMateria: Number(idMateria),
            idTurma: Number(idTurma),
            dataAula: new Date(`${dataStr}T${horaInicio}:00.000Z`)
          }
        });
        if (existe) {
          puladas.push({ data: dataStr, motivo: "já existente" });
        } else {
          const aula = await prisma.aula.create({
            data: {
              idMateria: Number(idMateria),
              idTurma: Number(idTurma),
              dataAula: new Date(`${dataStr}T${horaInicio}:00.000Z`),
              duracaoMinutos,
              aulaConcluida: false,
              horario: horaInicio // Adiciona o campo obrigatório 'horario'
            }
          });
          criadas.push({ id: aula.idAula, data: dataStr, horaInicio });
        }
      }
      dataAtual.setDate(dataAtual.getDate() + 7);
    }
    return NextResponse.json({ criadas, puladas }, { status: 201 });
  } catch (error) {
    console.error("Erro detalhado ao agendar aulas:", error);
    return NextResponse.json({ error: "Erro ao agendar aulas. Verifique se a coluna 'duracaoMinutos' existe na tabela 'Aula' e rode as migrations do Prisma." }, { status: 500 });
  }
}
