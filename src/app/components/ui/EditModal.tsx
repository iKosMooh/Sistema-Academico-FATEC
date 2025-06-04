// src/app/components/ui/EditModal.tsx
import { useEffect, useState, FormEvent } from "react";

interface EditModalProps<T> {
  data: T | null;
  onClose: () => void;
  onSave: (updatedData: T) => void;
  fields: (keyof T)[];
  isOpen: boolean;
  renderField?: (
    field: keyof T,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  ) => React.ReactNode;
}

// Função utilitária para mapear nomes de campos para labels amigáveis automaticamente
function autoLabel(field: string) {
  // Remove prefixos comuns e camelCase para Espaço
  const label = field
    .replace(/^id([A-Z])/, (_, c) => c) // idCurso -> Curso
    .replace(/([A-Z])/g, " $1")        // nomeTurma -> nome Turma
    .replace(/^./, (str) => str.toUpperCase()) // primeira letra maiúscula
    .trim();

  // Ajustes para nomes conhecidos
  if (label.toLowerCase() === "id") return "ID";
  if (label.toLowerCase() === "cpf") return "CPF";
  if (label.toLowerCase() === "rg") return "RG";
  if (label.toLowerCase() === "ano letivo") return "Ano Letivo";
  if (label.toLowerCase() === "nome turma") return "Nome da Turma";
  if (label.toLowerCase() === "nome curso") return "Nome do Curso";
  if (label.toLowerCase() === "carga horaria total") return "Carga Horária Total";
  if (label.toLowerCase() === "descricao") return "Descrição";
  if (label.toLowerCase() === "docs path") return "Caminho de Documentos";
  return label;
}

export function EditModal<T extends Record<string, unknown>>(
  { isOpen, onClose, data, onSave, fields, renderField }: EditModalProps<T>
) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && data) {
      const initialValues: Record<string, string> = {};
      fields.forEach((key) => {
        const raw = data[key];
        initialValues[key as string] =
          raw !== null && raw !== undefined ? String(raw) : "";
      });
      setFormValues(initialValues);
    }
    if (!isOpen) {
      setFormValues({});
    }
  }, [isOpen, data, fields]);

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const updatedData: Record<string, unknown> = { ...data } as Record<string, unknown>;

    fields.forEach((key) => {
      const originalValue = data[key];
      const newVal = formValues[key as string];
      if (typeof originalValue === "number") {
        updatedData[key as string] = Number(newVal);
      } else {
        updatedData[key as string] = newVal;
      }
    });

    onSave(updatedData as T);
    onClose();
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative max-w-lg w-full max-h-[90vh] bg-white rounded-lg shadow-lg overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Editar Registro</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {fields.map((key) => {
            const value = formValues[key as string] ?? "";

            // Permite customização do campo pelo parent
            if (renderField) {
              const custom = renderField(key, value, handleInputChange(String(key)));
              if (custom !== undefined) return custom;
            }

            let inputType = "text";
            const keyLower = String(key).toLowerCase();
            if (keyLower.includes("email")) {
              inputType = "email";
            } else if (
              typeof (data[key] as unknown) === "number" ||
              keyLower.includes("id")
            ) {
              inputType = keyLower.includes("cpf") || keyLower.includes("id")
                ? "text"
                : "number";
            } else if (
              keyLower.includes("telefone") ||
              keyLower.includes("tel")
            ) {
              inputType = "tel";
            } else if (keyLower.includes("senha")) {
              inputType = "password";
            }

            const isPrimary = key === fields[0];

            return (
              <div key={String(key)} className="mb-4">
                <label
                  htmlFor={String(key)}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {autoLabel(String(key))}
                </label>
                <input
                  id={String(key)}
                  type={inputType}
                  value={value}
                  onChange={handleInputChange(String(key))}
                  disabled={isPrimary}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            );
          })}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
