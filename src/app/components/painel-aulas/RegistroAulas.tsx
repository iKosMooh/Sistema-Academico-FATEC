import { useEffect, useState } from "react";

interface Aula {
  idAula?: number | string;
  dataAula?: string;
  descricao?: string;
  turma?: {
    nomeTurma?: string;
  };
  idTurma?: number | string;
  materia?: {
    nomeMateria?: string;
  };
  idMateria?: number | string;
}

export function RegistroAulas() {
  const [aulas, setAulas] = useState<Aula[]>([]);

  useEffect(() => {
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "aula",
        relations: { turma: true, materia: true },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setAulas(result.data);
      });
  }, []);

  return (
    <div>
      <h2 className="font-semibold mb-2">Registro de Aulas Ministradas / Frequência</h2>
      <div className="bg-white rounded shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Data</th>
              <th>Título</th>
              <th>Turma</th>
              <th>Disciplina</th>
            </tr>
          </thead>
          <tbody>
            {aulas.map((a) => (
              <tr key={a.idAula}>
                <td>{a.dataAula ? new Date(a.dataAula).toLocaleString("pt-BR") : "-"}</td>
                <td>{a.descricao}</td>
                <td>{a.turma?.nomeTurma || a.idTurma}</td>
                <td>{a.materia?.nomeMateria || a.idMateria}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
