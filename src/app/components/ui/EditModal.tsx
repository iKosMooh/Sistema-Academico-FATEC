// src/app/components/ui/EditModal.tsx
import { useEffect, useState, FormEvent } from "react";

interface EditModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  data: T | null;
  onSave: (updatedData: T) => void;
  fields: (keyof T)[];
}

export function EditModal<T extends { [key: string]: any }>(
  {
    isOpen,
    onClose,
    data,
    onSave,
    fields,
  }: EditModalProps<T>
) {
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (isOpen && data) {
      const initialValues: { [key: string]: any } = {};
      fields.forEach((key) => {
        const value = (data as any)[key];
        initialValues[key as string] =
          value !== null && value !== undefined ? String(value) : "";
      });
      setFormValues(initialValues);
    }
    if (!isOpen) {
      setFormValues({});
    }
  }, [isOpen, data, fields]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const updatedData: any = { ...data };
    fields.forEach((key) => {
      const originalValue = (data as any)[key];
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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        backgroundColor: '#fff'
      }}>
        <div>
          <h2>Editar Registro</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {fields.map((key) => {
            const value = formValues[key as string] ?? "";
            let inputType = "text";
            const keyLower = String(key).toLowerCase();
            if (keyLower.includes("email")) {
              inputType = "email";
            } else if (typeof (data as any)[key] === "number" || keyLower.includes("id")) {
              inputType = keyLower.includes("cpf") || keyLower.includes("id") ? "text" : "number";
            } else if (keyLower.includes("telefone")) {
              inputType = "tel";
            } else if (keyLower.includes("senha")) {
              inputType = "password";
            }

            const isPrimary = key === fields[0];

            return (
              <div key={String(key)}>
                <label htmlFor={String(key)}>{String(key)}</label>
                <input
                  id={String(key)}
                  type={inputType}
                  value={value}
                  onChange={(e) => handleChange(String(key), e.target.value)}
                  disabled={isPrimary}
                />
              </div>
            );
          })}

          <div>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}