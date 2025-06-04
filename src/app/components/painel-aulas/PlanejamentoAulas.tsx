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
  aulaConcluida: boolean;
}

interface Feriado {
  id: number;
  data: string;
  descricao?: string;
}

export function PlanejamentoAulas({ reloadFlag }: { reloadFlag?: number }) {
  const { turma } = useAppContext();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth());
  const anoAtual = new Date().getFullYear();

  // Carrega aulas
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
            type AulaApi = Aula & { idTurma: string; materia?: { nomeMateria?: string }; descricao?: string; duracaoMinutos?: number; presencasAplicadas?: boolean; observacoes?: string; };
            setAulas(
              (result.data as AulaApi[])
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
                  aulaConcluida: !!a.aulaConcluida,
                }))
            );
          }
        });
    } else {
      setAulas([]);
    }
  }, [turma, mesAtual, reloadFlag]);
  // Carrega feriados
  useEffect(() => {
    fetch("/api/dias-nao-letivos", { method: "GET" })
      .then((res) => {
        if (res.ok) return res.text();
        if (res.status === 405) return "[]";
        return "[]";
      })
      .then((text) => {
        try {
          const result = JSON.parse(text);
          if (Array.isArray(result)) setFeriados(result);
          else setFeriados([]);
        } catch {
          setFeriados([]);
        }
      })
      .catch(() => setFeriados([]));
  }, [turma, mesAtual]);

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

  // Dias do mês atual
  const daysOfMonth = getDaysOfMonth(anoAtual, mesAtual);
  const firstDayWeek = daysOfMonth[0]?.getDay() ?? 0;
  const emptyDays = Array.from({ length: firstDayWeek });

  // Helper para saber se é feriado
  function getFeriado(dateStr: string) {
    return feriados.find((f: Feriado) => f.data.slice(0, 10) === dateStr);
  }
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button
          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-900"
          onClick={() => setMesAtual((m) => (m === 0 ? 11 : m - 1))}
        >
          {"<"}
        </button>
        <div className="text-lg font-bold text-gray-900">
          {meses[mesAtual]} {anoAtual}
        </div>
        <button
          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-900"
          onClick={() => setMesAtual((m) => (m === 11 ? 0 : m + 1))}
        >
          {">"}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs bg-gray-100 rounded-t">
        <div className="text-center font-semibold py-1 text-gray-900">Dom</div>
        <div className="text-center font-semibold py-1 text-gray-900">Seg</div>
        <div className="text-center font-semibold py-1 text-gray-900">Ter</div>
        <div className="text-center font-semibold py-1 text-gray-900">Qua</div>
        <div className="text-center font-semibold py-1 text-gray-900">Qui</div>
        <div className="text-center font-semibold py-1 text-gray-900">Sex</div>
        <div className="text-center font-semibold py-1 text-gray-900">Sáb</div>
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
          const feriado = getFeriado(dataStr);
          return (
            <div
              key={dataStr}
              className={`min-h-[48px] border rounded flex flex-col items-center justify-start p-1 relative group cursor-pointer transition-all duration-150
                ${feriado ? "bg-red-100 border-red-400" : ""}
              `}
              style={{ zIndex: 1 }}
            >
              <span
                className={`text-gray-900 ${feriado ? "text-red-700 font-bold" : ""}`}
              >
                {date.getDate()}
              </span>
              {/* Feriado visível */}
              {feriado && (
                <span className="block text-xs text-red-700 font-semibold mb-1">
                  {feriado.descricao || "Feriado"}
                </span>
              )}
              {aulasDoDia.map((a) => (
                <span
                  key={a.idAula}
                  className={`mt-1 px-1 py-0.5 rounded text-xs w-full text-center truncate
                    ${feriado || a.aulaConcluida ? "bg-red-600 text-white" : "bg-blue-700 text-white"}
                  `}
                  title={a.titulo + " " + a.horario}
                >
                  {a.titulo} {a.horario}
                </span>
              ))}
              {/* Tooltip customizado */}
              {(aulasDoDia.length > 0 || feriado) && (
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
                  <div
                    className={`font-semibold mb-1 ${
                      feriado ? "text-red-700" : "text-blue-700"
                    }`}
                  >
                    {format(date, "dd/MM/yyyy")}
                  </div>
                  {feriado && (
                    <div className="mb-2 text-red-700 font-semibold">
                      {feriado.descricao || "Feriado/Dia Não Letivo"}
                    </div>
                  )}
                  {aulasDoDia.map((a) => (
                    <div key={a.idAula} className="mb-2 last:mb-0">
                      <div className="font-bold text-gray-900">{a.titulo}</div>
                      <div className="text-gray-900">
                        Horário: {a.horario}
                        {a.duracao && <> | Duração: {a.duracao}</>}
                        {feriado || a.aulaConcluida ? (
                          <span className="ml-2 text-red-700 font-semibold">
                            (Cancelada)
                          </span>
                        ) : null}
                      </div>
                      {a.conteudo && (
                        <div className="mt-1 whitespace-pre-line break-words text-gray-900">
                          {a.conteudo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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