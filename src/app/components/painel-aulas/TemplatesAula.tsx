import { useEffect, useState } from "react";

interface Template {
  idMateria?: number;
  id?: number;
  nomeMateria?: string;
  nome?: string;
}

export function TemplatesAula() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetch("/api/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        table: "materias", // substitua por "templates" se existir
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setTemplates(result.data);
      });
  }, []);

  return (
    <div>
      <h2 className="font-semibold mb-2">Templates e Projetos de Aula</h2>
      <div className="bg-white rounded shadow p-4">
        <ul>
          {templates.map((tpl) => (
            <li key={tpl.idMateria || tpl.id}>
              <span className="font-bold">{tpl.nomeMateria || tpl.nome}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
