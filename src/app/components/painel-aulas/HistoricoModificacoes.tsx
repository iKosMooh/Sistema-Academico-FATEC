import { useEffect, useState } from "react";

type Log = {
  idLog: number;
  dateTime?: string;
  action: string;
};

export function HistoricoModificacoes() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "log",
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setLogs(result.data);
      });
  }, []);

  return (
    <div>
      <h2 className="font-semibold mb-2">Histórico de Modificações & Versionamento</h2>
      <div className="bg-white rounded shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.idLog}>
                <td>{log.dateTime ? new Date(log.dateTime).toLocaleString("pt-BR") : "-"}</td>
                <td>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
