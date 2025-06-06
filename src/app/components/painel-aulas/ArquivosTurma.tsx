import { FC, useEffect, useRef, useState } from "react";
import { useAppContext } from "./AppContext";
import { DocumentIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

function getFileTypeIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "docx";
  if (["xls", "xlsx"].includes(ext)) return "xlsx";
  if (["ppt", "pptx"].includes(ext)) return "pptx";
  if (["zip", "rar", "7z"].includes(ext)) return "zip";
  if (["txt"].includes(ext)) return "txt";
  return "file";
}

interface Turma {
  id?: string | number;
  nomeTurma?: string;
  nome?: string;
  idCurso?: string | number;
  cursoId?: string | number;
  nomeCurso?: string;
  cursoNome?: string;
}

function getTurmaNome(turma: Turma) {
  return turma?.nomeTurma || turma?.nome || "";
}
function getCursoId(turma: Turma) {
  return turma?.idCurso || turma?.cursoId || "";
}
function getCursoNome(turma: Turma) {
  return turma?.nomeCurso || turma?.cursoNome || "";
}

export const ArquivosTurma: FC = () => {
  const { turma } = useAppContext();
  const [arquivosTurma, setArquivosTurma] = useState<{ name: string; url: string }[]>([]);
  const [arquivosCurso, setArquivosCurso] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Novo: controle do modal de confirmação
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    fileName: string;
    tipo: "turma" | "curso";
  }>({ open: false, fileName: "", tipo: "turma" });

  useEffect(() => {
    if (!turma || !getTurmaNome(turma) || !turma.id) {
      setArquivosTurma([]);
      setArquivosCurso([]);
      return;
    }
    const idTurmaNome = `id-${turma.id}${String(getTurmaNome(turma)).replace(/[\\/:*?"<>|]/g, "_")}`;
    fetch(`/api/arquivos?tipo=turma&id=${idTurmaNome}`)
      .then((res) => res.json())
      .then(setArquivosTurma);

    const cursoId = getCursoId(turma);
    const cursoNome = getCursoNome(turma);
    if (cursoId && cursoNome) {
      const idCursoNome = `id-${cursoId}${String(cursoNome).replace(/[\\/:*?"<>|]/g, "_")}`;
      fetch(`/api/arquivos?tipo=curso&id=${idCursoNome}`)
        .then((res) => res.json())
        .then(setArquivosCurso);
    }
  }, [turma]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0] || !turma || !getTurmaNome(turma) || !turma.id) return;
    setUploading(true);
    const file = fileInputRef.current.files[0];
    const idTurmaNome = `id-${turma.id}${String(getTurmaNome(turma)).replace(/[\\/:*?"<>|]/g, "_")}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", "turma");
    formData.append("id", idTurmaNome);

    await fetch("/api/arquivos", {
      method: "POST",
      body: formData,
    });
    fileInputRef.current.value = "";
    setUploading(false);
    fetch(`/api/arquivos?tipo=turma&id=${idTurmaNome}`)
      .then((res) => res.json())
      .then(setArquivosTurma);
  };

  const handleRemove = async (fileName: string, tipo: "turma" | "curso") => {
    setConfirmModal({ open: true, fileName, tipo });
  };

  const confirmRemove = async () => {
    const { fileName, tipo } = confirmModal;
    if (!turma || !getTurmaNome(turma) || !turma.id) {
      setConfirmModal({ open: false, fileName: "", tipo: "turma" });
      return;
    }
    let idNome = "";
    if (tipo === "turma") {
      idNome = `id-${turma.id}${String(getTurmaNome(turma)).replace(/[\\/:*?"<>|]/g, "_")}`;
    } else {
      const cursoId = getCursoId(turma);
      const cursoNome = getCursoNome(turma);
      if (!cursoId || !cursoNome) {
        setConfirmModal({ open: false, fileName: "", tipo: "turma" });
        return;
      }
      idNome = `id-${cursoId}${String(cursoNome).replace(/[\\/:*?"<>|]/g, "_")}`;
    }
    if (!idNome) {
      setConfirmModal({ open: false, fileName: "", tipo: "turma" });
      return;
    }
    await fetch(`/api/arquivos?tipo=${tipo}&id=${idNome}&file=${encodeURIComponent(fileName)}`, {
      method: "DELETE",
    });
    if (tipo === "turma") {
      fetch(`/api/arquivos?tipo=turma&id=${idNome}`)
        .then((res) => res.json())
        .then(setArquivosTurma);
    } else {
      fetch(`/api/arquivos?tipo=curso&id=${idNome}`)
        .then((res) => res.json())
        .then(setArquivosCurso);
    }
    setConfirmModal({ open: false, fileName: "", tipo: "turma" });
  };

  // Função para renderizar o preview do arquivo
  function renderFilePreview(file: { name: string; url: string }) {
    const type = getFileTypeIcon(file.name);
    if (type === "image") {
      // Use o componente <Image /> do next/image para imagens
      return (
        <Image
          src={file.url}
          alt={file.name}
          width={40}
          height={40}
          className="w-10 h-10 object-cover rounded border"
          // priority pode ser usado se desejar
        />
      );
    }
    if (file.name.toLowerCase() === "readme.md" || file.name.toLowerCase() === "redme.md") {
      // Ícone especial para README/REDME
      return (
        <span className="w-10 h-10 flex items-center justify-center text-yellow-600 font-bold bg-yellow-100 rounded">
          MD
        </span>
      );
    }
    if (type === "pdf") {
      return (
        <span className="w-10 h-10 flex items-center justify-center text-red-600">
          <DocumentIcon className="w-7 h-7" />
        </span>
      );
    }
    if (type === "docx") {
      return (
        <span className="w-10 h-10 flex items-center justify-center text-blue-700">
          <DocumentIcon className="w-7 h-7" />
        </span>
      );
    }
    if (type === "xlsx") {
      return (
        <span className="w-10 h-10 flex items-center justify-center text-green-700">
          <DocumentIcon className="w-7 h-7" />
        </span>
      );
    }
    if (type === "pptx") {
      return (
        <span className="w-10 h-10 flex items-center justify-center text-orange-500">
          <DocumentIcon className="w-7 h-7" />
        </span>
      );
    }
    if (type === "zip") {
      return (
        <span className="w-10 h-10 flex items-center justify-center text-gray-500">
          <DocumentIcon className="w-7 h-7" />
        </span>
      );
    }
    if (type === "txt") {
      return (
        <span className="w-10 h-10 flex items-center justify-center text-gray-700">
          <DocumentIcon className="w-7 h-7" />
        </span>
      );
    }
    // Default
    return (
      <span className="w-10 h-10 flex items-center justify-center text-gray-400">
        <DocumentIcon className="w-7 h-7" />
      </span>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow p-8 mb-12">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Arquivos da Turma</h2>
      <form onSubmit={handleUpload} className="mb-6 flex gap-3 bg-gray-300 rounded-xl p-6 shadow border border-gray-300">
        <input type="file" ref={fileInputRef} className="border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white" required />
        <button
          type="submit"
          className="bg-gray-800 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? "Enviando..." : "Anexar Arquivo"}
        </button>
      </form>
      <div>
        <h3 className="font-semibold mb-2 text-gray-900">Arquivos da Turma</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-2xl bg-white bg-opacity-60 shadow-sm">
            <thead>
              <tr>
                <th className="text-gray-900">Arquivo</th>
                <th className="text-gray-900">Nome</th>
                <th className="text-gray-900">Ação</th>
              </tr>
            </thead>
            <tbody>
              {arquivosTurma.length > 0 ? (
                arquivosTurma.map((arq, idx) => (
                  <tr key={arq.name}>
                    <td className={idx % 2 === 0 ? "bg-gray-200 text-center" : "bg-gray-50 text-center"}>
                      {renderFilePreview(arq)}
                    </td>
                    <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900 px-6 py-2" : "bg-gray-50 text-blue-900 px-6 py-2"}>
                      <a
                        href={`/api/uploads?path=${encodeURIComponent(arq.url.replace('/uploads/', ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {arq.url.split('/').pop()}
                      </a>
                    </td>
                    <td className={idx % 2 === 0 ? "bg-gray-200 text-center" : "bg-gray-50 text-center"}>
                      <button
                        className="ml-auto text-red-700 hover:bg-red-100 rounded p-1 px-3 py-1 font-semibold"
                        title="Remover arquivo"
                        onClick={() => handleRemove(arq.name, "turma")}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500 bg-gray-50 rounded-xl">
                    Nenhum arquivo enviado para esta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <hr className="my-4" />
        <h3 className="font-semibold mb-2 text-gray-900">Arquivos do Curso Relacionado</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-2xl bg-white bg-opacity-60 shadow-sm">
            <thead>
              <tr>
                <th className="text-gray-900">Arquivo</th>
                <th className="text-gray-900">Nome</th>
                <th className="text-gray-900">Ação</th>
              </tr>
            </thead>
            <tbody>
              {arquivosCurso.length > 0 ? (
                arquivosCurso.map((arq, idx) => (
                  <tr key={arq.name}>
                    <td className={idx % 2 === 0 ? "bg-gray-200 text-center" : "bg-gray-50 text-center"}>
                      {renderFilePreview(arq)}
                    </td>
                    <td className={idx % 2 === 0 ? "bg-gray-200 text-blue-900 px-6 py-2" : "bg-gray-50 text-blue-900 px-6 py-2"}>
                      <a
                        href={`/api/uploads?path=${encodeURIComponent(arq.url.replace('/uploads/', ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {arq.url.split('/').pop()}
                      </a>
                    </td>
                    <td className={idx % 2 === 0 ? "bg-gray-200 text-center" : "bg-gray-50 text-center"}>
                      <button
                        className="ml-auto text-red-700 hover:bg-red-100 rounded p-1 px-3 py-1 font-semibold"
                        title="Remover arquivo"
                        onClick={() => handleRemove(arq.name, "curso")}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500 bg-gray-50 rounded-xl">
                    Nenhum arquivo enviado para o curso.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal de confirmação de exclusão */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-xs w-full">
            <div className="mb-4 text-lg font-semibold text-gray-900">
              Deseja realmente excluir o arquivo{" "}
              <span className="font-bold">{confirmModal.fileName}</span>?
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-900"
                onClick={() => setConfirmModal({ open: false, fileName: "", tipo: "turma" })}
              >
                Não
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmRemove}
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
