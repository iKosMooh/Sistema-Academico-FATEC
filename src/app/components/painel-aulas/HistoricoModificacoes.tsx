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
      <h2 className="font-semibold mb-2 text-gray-900">Histórico de Modificações & Versionamento</h2>
      <div className="bg-white rounded shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-gray-900">Data/Hora</th>
              <th className="text-gray-900">Ação</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.idLog}>
                <td className="text-gray-900">{log.dateTime ? new Date(log.dateTime).toLocaleString("pt-BR") : "-"}</td>
                <td className="text-gray-900">{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
