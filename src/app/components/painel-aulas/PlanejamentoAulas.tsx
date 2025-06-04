import { useAppContext } from "./AppContext";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface Aula {
  idAula: number;
  titulo: string;
  dataAula: string;
  horario: string;
  duracao: string;
  status: "prevista" | "ministrada" | "pendente" | "adiada";
  conteudo: string;
}

function getDaysOfMonth(year: number, month: number) {
  const days: Date[] = [];
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function PlanejamentoAulas() {
  const { turma } = useAppContext();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth());
  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    if (turma) {
      fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "get",
          table: "aula",
          relations: { materia: true, turma: true },
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setAulas(
              (result.data as Array<{
                idAula: number;
                descricao?: string | null;
                dataAula: string;
                idTurma: number;
                idMateria: number;
                aulaConcluida?: boolean;
                presencasAplicadas?: boolean;
                observacoes?: string | null;
                materia?: { nomeMateria?: string };
                duracaoMinutos?: number;
                horario?: string;
              }>)
                .filter((a) => String(a.idTurma) === turma.id)
                .map((a) => ({
                  idAula: a.idAula,
                  titulo: a.materia?.nomeMateria || a.descricao || "Aula",
                  dataAula: a.dataAula,
                  horario: a.horario || a.dataAula?.slice(11, 16) || "",
                  duracao: a.duracaoMinutos
                    ? `${a.duracaoMinutos} min`
                    : "—",
                  status: a.aulaConcluida
                    ? "ministrada"
                    : a.presencasAplicadas
                    ? "pendente"
                    : "prevista",
                  conteudo: a.observacoes || "",
                }))
            );
          }
        });
    } else {
      setAulas([]);
    }
  }, [turma, mesAtual]);

  // Dias do mês atual
  const daysOfMonth = getDaysOfMonth(anoAtual, mesAtual);

  // Descobre o dia da semana do primeiro dia do mês (0=domingo)
  const firstDayWeek = daysOfMonth[0]?.getDay() ?? 0;

  // Preenche os dias vazios antes do primeiro dia do mês
  const emptyDays = Array.from({ length: firstDayWeek });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button
          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setMesAtual((m) => (m === 0 ? 11 : m - 1))}
        >
          {"<"}
        </button>
        <div className="text-lg font-bold">
          {meses[mesAtual]} {anoAtual}
        </div>
        <button
          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setMesAtual((m) => (m === 11 ? 0 : m + 1))}
        >
          {">"}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs bg-gray-100 rounded-t">
        <div className="text-center font-semibold py-1">Dom</div>
        <div className="text-center font-semibold py-1">Seg</div>
        <div className="text-center font-semibold py-1">Ter</div>
        <div className="text-center font-semibold py-1">Qua</div>
        <div className="text-center font-semibold py-1">Qui</div>
        <div className="text-center font-semibold py-1">Sex</div>
        <div className="text-center font-semibold py-1">Sáb</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs bg-white rounded-b shadow p-2">
        {emptyDays.map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}
        {daysOfMonth.map((date) => {
          const dataStr = format(date, "yyyy-MM-dd");
          const aulasDoDia = aulas.filter(
            (a) => a.dataAula.slice(0, 10) === dataStr
          );
          return (
            <div
              key={dataStr}
              className="min-h-[48px] border rounded flex flex-col items-center justify-start p-1 relative group cursor-pointer transition-all duration-150"
              style={{ zIndex: 1 }}
            >
              <span className="text-gray-500">{date.getDate()}</span>
              {aulasDoDia.map((a) => (
                <span
                  key={a.idAula}
                  className="mt-1 px-1 py-0.5 rounded text-xs text-white bg-blue-700 w-full text-center truncate"
                  title={a.titulo + " " + a.horario}
                >
                  {a.titulo} {a.horario}
                </span>
              ))}
              {/* Tooltip customizado */}
              {aulasDoDia.length > 0 && (
                <div
                  className="pointer-events-none absolute left-1/2 top-0 z-50 hidden group-hover:flex flex-col min-w-[180px] max-w-xs bg-white border border-blue-400 shadow-xl rounded p-3 text-xs text-gray-900 transition-all duration-150"
                  style={{
                    transform: "translate(-50%, -110%) scale(1.08)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    minHeight: "60px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  <div className="font-semibold text-blue-700 mb-1">
                    {format(date, "dd/MM/yyyy")}
                  </div>
                  {aulasDoDia.map((a) => (
                    <div key={a.idAula} className="mb-2 last:mb-0">
                      <div className="font-bold">{a.titulo}</div>
                      <div className="text-gray-700">
                        Horário: {a.horario}
                        {a.duracao && <> | Duração: {a.duracao}</>}
                      </div>
                      {a.conteudo && (
                        <div className="mt-1 whitespace-pre-line break-words">
                          {a.conteudo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Exibe o tooltip ao passar o mouse */}
              <style jsx>{`
                .group:hover > .group-hover\\:flex {
                  display: flex !important;
                }
              `}</style>
            </div>
          );
        })}
      </div>
    </div>
  );
}
