'use client';

import React, { useState, useEffect } from 'react';
import { PreCadastroData, StatusPreCadastro, TipoDocumento, AvaliacaoPreCadastroSchema } from '@/lib/schemas';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { isValidCPF, formatCPF, formatRG } from '@/utils/cpf-rg';

interface PreCadastroCompleto extends PreCadastroData {
  idPreCadastro: number;
  curso?: {
    nomeCurso: string;
  };
  documentos?: {
    tipoDocumento: TipoDocumento;
    nomeArquivo: string;
    caminhoArquivo: string;
    tamanhoArquivo: number;
  }[];
  avaliador?: {
    nome: string;
    sobrenome: string;
  };
}

type AvaliacaoPreCadastrosProps = Record<string, never>;

export function AvaliacaoPreCadastros({}: AvaliacaoPreCadastrosProps) {
  const { data: session } = useSession();
  const [preCadastros, setPreCadastros] = useState<PreCadastroCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);
  // Filtro começa como vazio (nenhum filtro aplicado)
  const [filtroStatus, setFiltroStatus] = useState<StatusPreCadastro | 'Todos' | ''>('');
  const [preCadastroSelecionado, setPreCadastroSelecionado] = useState<PreCadastroCompleto | null>(null);
  const [modalAvaliacao, setModalAvaliacao] = useState(false);
  const [statusAvaliacao, setStatusAvaliacao] = useState<'Aprovado' | 'Rejeitado' | 'DocumentacaoIncompleta'>('Aprovado');
  const [observacoes, setObservacoes] = useState('');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [processando, setProcessando] = useState(false);

  // Novo: Modal de detalhes do pré-cadastro
  const [modalDetalhes, setModalDetalhes] = useState(false);

  // Estado para controle do motivo direto na lista
  const [motivoRejeicaoInline, setMotivoRejeicaoInline] = useState<{ [id: number]: string }>({});

  // CPF do responsável pela avaliação (usuário logado), validado e formatado
  let cpfResponsavel = session?.user?.cpf || '';
  cpfResponsavel = isValidCPF(cpfResponsavel) ? formatCPF(cpfResponsavel) : '';

  // Carregar todos os pré-cadastros ao montar o componente (sem filtro)
  useEffect(() => {
    carregarPreCadastros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quando filtro for alterado (exceto vazio), faz nova busca
  useEffect(() => {
    if (filtroStatus && filtroStatus !== ('' as StatusPreCadastro | 'Todos' | '')) {
      carregarPreCadastros();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatus]);

  const carregarPreCadastros = async () => {
    try {
      setCarregando(true);
      let url = '/api/pre-cadastro';
      // Só aplica filtro se filtroStatus não for vazio e não for 'Todos'
      if (
        filtroStatus &&
        filtroStatus !== ('' as StatusPreCadastro | 'Todos' | '') &&
        filtroStatus !== ('Todos' as StatusPreCadastro | 'Todos' | '')
      ) {
        url = `/api/pre-cadastro?status=${encodeURIComponent(filtroStatus)}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        let lista: PreCadastroCompleto[] = [];
        if (Array.isArray(result)) {
          lista = result;
        } else if (result && Array.isArray(result.data)) {
          lista = result.data;
        } else {
          lista = [];
        }
        setPreCadastros(lista);
      } else {
        const errorText = await response.text();
        console.error('Erro ao carregar pré-cadastros:', errorText);
        setPreCadastros([]);
      }
    } catch (error) {
      console.error('Erro ao carregar pré-cadastros:', error);
      setPreCadastros([]);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalAvaliacao = (preCadastro: PreCadastroCompleto) => {
    setPreCadastroSelecionado(preCadastro);
    setStatusAvaliacao('Aprovado');
    setObservacoes('');
    setMotivoRejeicao('');
    setModalAvaliacao(true);
  };

  // Função de avaliação (usando zod para validar antes de enviar)
  const avaliarPreCadastro = async () => {
    if (!preCadastroSelecionado) return;

    try {
      setProcessando(true);

      // Usa o CPF do usuário logado como responsável (validado e formatado)
      const avaliadoPor = cpfResponsavel;

      if (!avaliadoPor) {
        alert('CPF do responsável pela avaliação é inválido ou não encontrado na sessão.');
        setProcessando(false);
        return;
      }

      const payload: {
        idPreCadastro: number;
        status: 'Aprovado' | 'Rejeitado' | 'DocumentacaoIncompleta';
        observacoes?: string;
        avaliadoPor: string;
        motivoRejeicao?: string;
      } = {
        idPreCadastro: preCadastroSelecionado.idPreCadastro,
        status: statusAvaliacao,
        observacoes: observacoes || undefined,
        avaliadoPor,
        ...(statusAvaliacao === 'Rejeitado' && { motivoRejeicao }),
      };

      // Validação: para aprovação, motivo não é obrigatório; para rejeição, é obrigatório
      try {
        AvaliacaoPreCadastroSchema.parse(payload);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const msg = error.errors.map((err: z.ZodIssue) => {
            if (err.path.includes('avaliadoPor')) {
              return 'O campo CPF do responsável pela avaliação deve conter no mínimo 11 caracteres (CPF válido).';
            }
            return err.message;
          }).join('\n');
          alert(msg);
          setProcessando(false);
          return;
        }
        throw error;
      }

      const response = await fetch('/api/pre-cadastro/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (statusAvaliacao === 'Aprovado') {
          await criarUsuarioEAluno(preCadastroSelecionado);
        }
        setModalAvaliacao(false);
        await carregarPreCadastros();
        alert('Avaliação registrada com sucesso!');
      } else {
        const error = await response.text();
        alert(`Erro ao avaliar: ${error}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(error.errors.map((err: z.ZodIssue) => {
          if (err.path.includes('avaliadoPor')) {
            return 'O campo CPF do responsável pela avaliação deve conter no mínimo 11 caracteres (CPF válido).';
          }
          return err.message;
        }).join('\n'));
      } else {
        console.error('Erro ao avaliar pré-cadastro:', error);
        alert('Erro interno. Tente novamente.');
      }
    } finally {
      setProcessando(false);
    }
  };

  /**
   * Cria usuário e aluno no sistema.
   * - Cria usuário (se não existir) via /api/usuarios
   * - Cria aluno (se não existir) via /api/alunos/insert (formData)
   * - Cria endereço e contato (opcional)
   * Retorna um objeto detalhando o que foi criado.
   */
  const criarUsuarioEAluno = async (preCadastro: PreCadastroCompleto) => {
    const cpfBanco = isValidCPF(preCadastro.cpf) ? formatCPF(preCadastro.cpf) : preCadastro.cpf;
    const resultado: {
      usuarioCriado: boolean;
      alunoCriado: boolean;
      enderecoCriado: boolean;
      contatoCriado: boolean;
      erros: string[];
    } = {
      usuarioCriado: false,
      alunoCriado: false,
      enderecoCriado: false,
      contatoCriado: false,
      erros: [],
    };

    // 1. Criação do usuário
    try {
      // O endpoint /api/usuarios/{cpf} espera o CPF SEM formatação (apenas números)
      const cpfNumeros = formatCPF(cpfBanco);

      // Checa se usuário já existe ANTES de tentar criar (para evitar erro de constraint no insert do aluno)
      const usuarioCheck = await fetch(`/api/usuarios/${cpfNumeros}`);
      if (usuarioCheck.ok) {
        resultado.usuarioCriado = false; // Já existe
      } else {
        const usuarioPayload = {
          cpf: cpfNumeros,
          senha: cpfNumeros, // senha padrão igual ao CPF (sem formatação)
          tipo: 'Aluno',
        };
        // Cria usuário apenas se não existir
        const usuarioResp = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuarioPayload),
        });
        // 200 = criado, 409 = já existe (tratado como sucesso)
        if (usuarioResp.ok || usuarioResp.status === 409) {
          resultado.usuarioCriado = true;
        } else {
          const msg = await usuarioResp.text();
          resultado.erros.push('Erro ao criar usuário: ' + msg);
          throw new Error('Erro ao criar usuário: ' + msg);
        }
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      resultado.erros.push('Erro ao criar usuário: ' + errorMsg);
      throw new Error('Erro ao criar usuário: ' + errorMsg);
    }

    // 2. Criação do aluno
    try {
      // O endpoint /api/alunos/get-delete?cpf= espera o CPF SEM formatação (apenas números)
      const cpfNumeros = formatCPF(cpfBanco);

      const alunoCheck = await fetch(`/api/alunos/get-delete?cpf=${encodeURIComponent(cpfNumeros)}`);
      let alunoExiste = false;
      if (alunoCheck.ok) {
        const alunos = await alunoCheck.json();
        if (Array.isArray(alunos)) {
          alunoExiste = alunos.some((aluno: { cpf: string }) => aluno.cpf === cpfNumeros);
        }
      }
      if (alunoExiste) {
        resultado.alunoCriado = false; // Já existe
      } else {
        // Monta formData para envio correto
        const formData = new FormData();
        formData.append('nome', preCadastro.nome);
        formData.append('sobrenome', preCadastro.sobrenome);
        formData.append('cpf', cpfNumeros);
        formData.append('rg', formatRG(preCadastro.rg));
        formData.append('nomeMae', preCadastro.nomeMae);
        formData.append('dataNasc', typeof preCadastro.dataNasc === 'string' ? preCadastro.dataNasc : new Date(preCadastro.dataNasc).toISOString().slice(0, 10));
        formData.append('descricao', 'Cadastro automático via aprovação de pré-cadastro');
        // Campos opcionais
        if (preCadastro.nomePai) formData.append('nomePai', preCadastro.nomePai);
        // Contato obrigatório
        formData.append('nomeTel1', preCadastro.nomeResponsavel || preCadastro.nomeMae || preCadastro.nome);
        formData.append('tel1', preCadastro.telefone);
        // Contato opcional
        if (preCadastro.nomeResponsavel) formData.append('nomeTel2', preCadastro.nomeResponsavel);
        if (preCadastro.telefoneResponsavel) formData.append('tel2', preCadastro.telefoneResponsavel);

        // Checagem dos campos obrigatórios antes do envio
        const obrigatorios = [
          { campo: 'nome', valor: preCadastro.nome },
          { campo: 'sobrenome', valor: preCadastro.sobrenome },
          { campo: 'cpf', valor: cpfNumeros },
          { campo: 'rg', valor: formatRG(preCadastro.rg) },
          { campo: 'nomeMae', valor: preCadastro.nomeMae },
          { campo: 'dataNasc', valor: preCadastro.dataNasc },
          { campo: 'nomeTel1', valor: preCadastro.nomeResponsavel || preCadastro.nomeMae || preCadastro.nome },
          { campo: 'tel1', valor: preCadastro.telefone }
        ];
        const faltando = obrigatorios.filter(o => !o.valor || (typeof o.valor === 'string' && o.valor.trim() === '')).map(o => o.campo);

        if (faltando.length > 0) {
          resultado.erros.push('Faltam os seguintes campos obrigatórios para criar o aluno: ' + faltando.join(', '));
          throw new Error('Faltam os seguintes campos obrigatórios para criar o aluno: ' + faltando.join(', '));
        }

        const alunoResp = await fetch('/api/alunos/insert', {
          method: 'POST',
          body: formData,
        });
        if (alunoResp.ok) {
          resultado.alunoCriado = true;
        } else {
          let msg = '';
          try {
            msg = await alunoResp.text();
          } catch {
            msg = alunoResp.statusText || 'Erro desconhecido';
          }
          resultado.erros.push('Erro ao criar aluno: ' + msg);
          throw new Error('Erro ao criar aluno: ' + msg);
        }
      }
    } catch (e: unknown) {
      let errorMsg = '';
      if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: string }).message === 'string') {
        errorMsg = (e as { message: string }).message;
        resultado.erros.push('Erro ao criar aluno: ' + errorMsg);
        // Se faltar campos obrigatórios, retorna erro detalhado
        if (errorMsg.includes('Faltam os seguintes campos obrigatórios')) {
          alert(errorMsg);
        }
        throw new Error('Erro ao criar aluno: ' + errorMsg);
      } else {
        resultado.erros.push('Erro ao criar aluno: ' + String(e));
        throw new Error('Erro ao criar aluno: ' + String(e));
      }
    }

    // 3. Criação do endereço (opcional)
    try {
      const enderecoPayload = {
        cpf: formatCPF(cpfBanco),
        cep: preCadastro.cep,
        rua: preCadastro.rua,
        cidade: preCadastro.cidade,
        uf: preCadastro.uf,
        numero: preCadastro.numero,
        complemento: preCadastro.complemento,
      };
      const enderecoResp = await fetch('/api/enderecos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enderecoPayload),
      });
      resultado.enderecoCriado = enderecoResp.ok;
      if (!enderecoResp.ok && enderecoResp.status !== 404) {
        const msg = await enderecoResp.text();
        resultado.erros.push('Erro ao criar endereço: ' + msg);
      }
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: string }).message === 'string') {
        resultado.erros.push('Erro ao criar endereço: ' + (e as { message: string }).message);
      } else {
        resultado.erros.push('Erro ao criar endereço: ' + String(e));
      }
    }

    // 4. Criação do contato (opcional)
    try {
      const contatoPayload = {
        cpf: formatCPF(cpfBanco),
        nomeTel1: preCadastro.nomeResponsavel || preCadastro.nomeMae || preCadastro.nome,
        tel1: preCadastro.telefone,
        nomeTel2: preCadastro.nomeResponsavel || undefined,
        tel2: preCadastro.telefoneResponsavel || undefined,
      };
      const contatoResp = await fetch('/api/contatoAluno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contatoPayload),
      });
      resultado.contatoCriado = contatoResp.ok;
      if (!contatoResp.ok && contatoResp.status !== 404) {
        const msg = await contatoResp.text();
        resultado.erros.push('Erro ao criar contato: ' + msg);
      }
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: string }).message === 'string') {
        resultado.erros.push('Erro ao criar contato: ' + (e as { message: string }).message);
      } else {
        resultado.erros.push('Erro ao criar contato: ' + String(e));
      }
    }

    // Só retorna sucesso se aluno foi criado corretamente
    if (!resultado.alunoCriado && resultado.erros.length > 0) {
      throw new Error('Não foi possível criar o cadastro completo do aluno: ' + resultado.erros.join('; '));
    }

    // Retorna o resultado detalhado para debug
    return resultado;
  };

  const formatarData = (data: string | Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: StatusPreCadastro) => {
    const colors = {
      Pendente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      EmAnalise: 'bg-blue-100 text-blue-800 border-blue-300',
      Aprovado: 'bg-green-100 text-green-800 border-green-300',
      Rejeitado: 'bg-red-100 text-red-800 border-red-300',
      DocumentacaoIncompleta: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const abrirModalDetalhes = (preCadastro: PreCadastroCompleto) => {
    setPreCadastroSelecionado(preCadastro);
    setModalDetalhes(true);
  };

  // Abrir o arquivo específico do aluno ao clicar
  const abrirArquivoAluno = (cpf: string, nomeArquivo: string) => {
    // Remove máscara do CPF se houver
    window.open(`/pastas/alunos/${formatCPF(cpf)}/${nomeArquivo}`, '_blank');
  };

  // Aprovação direta na lista (usando zod)
  const aprovarDireto = async (preCadastro: PreCadastroCompleto) => {
    setProcessando(true);
    try {
      const avaliadoPor = cpfResponsavel;
      if (!avaliadoPor) {
        alert('CPF do responsável pela avaliação é inválido ou não encontrado na sessão.');
        setProcessando(false);
        return;
      }
      // Sempre use o CPF formatado para todas as operações (busca e criação)
      const cpfBanco = isValidCPF(preCadastro.cpf) ? formatCPF(preCadastro.cpf) : preCadastro.cpf;
      const payload = {
        idPreCadastro: preCadastro.idPreCadastro,
        status: 'Aprovado',
        avaliadoPor,
        observacoes: undefined,
      };
      AvaliacaoPreCadastroSchema.parse(payload);

      // Verifica se já existe aluno e usuário antes de aprovar
      let usuarioCheckOk = false;
      let alunoCheckOk = false;
      try {
        const usuarioCheck = await fetch(`/api/usuarios/${cpfBanco}`);
        usuarioCheckOk = usuarioCheck.ok;
      } catch {
        usuarioCheckOk = false;
      }
      try {
        // Corrigido: endpoint correto para buscar aluno por CPF
        const alunoCheck = await fetch(`/api/alunos/get-delete?cpf=${encodeURIComponent(cpfBanco)}`);
        if (alunoCheck.ok) {
          const alunos = await alunoCheck.json();
          alunoCheckOk = Array.isArray(alunos) && alunos.some((a: { cpf: string }) => a.cpf === cpfBanco);
        } else {
          alunoCheckOk = false;
        }
      } catch {
        alunoCheckOk = false;
      }

      // Se não existe aluno e usuário, cria tudo antes de aprovar
      if (!usuarioCheckOk || !alunoCheckOk) {
        try {
          await criarUsuarioEAluno(preCadastro);
        } catch {
          alert('Não foi possível criar o cadastro completo do aluno. O pré-cadastro NÃO será aprovado.');
          setProcessando(false);
          return;
        }
      }

      let response;
      try {
        response = await fetch('/api/pre-cadastro/avaliar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        alert('Erro ao acessar a API de avaliação de pré-cadastro.');
        setProcessando(false);
        return;
      }

      if (response.ok) {
        carregarPreCadastros();
        alert('Pré-cadastro aprovado com sucesso!');
      } else {
        // Trata erro de já avaliado como mensagem amigável
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          // Ignore error when reading response text
        }
        // Se o aluno não existe, não mostra "Aluno já aprovado", apenas tenta criar normalmente
        if (errorText.includes('já foi avaliado')) {
          if (!usuarioCheckOk || !alunoCheckOk) {
            try {
              await criarUsuarioEAluno(preCadastro);
              alert('Pré-cadastro aprovado e aluno cadastrado no sistema.');
            } catch {
              alert('Pré-cadastro já aprovado, mas não foi possível criar o cadastro completo do aluno.');
            }
          } else {
            alert('Aluno já aprovado.');
          }
        } else {
          alert(`Erro ao aprovar: ${errorText || response.statusText}`);
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(error.errors.map((err: z.ZodIssue) => {
          if (err.path.includes('avaliadoPor')) {
            return 'O campo CPF do responsável pela avaliação deve conter no mínimo 11 caracteres (CPF válido).';
          }
          return err.message;
        }).join('\n'));
      } else {
        alert('Erro interno. Tente novamente.');
      }
    } finally {
      setProcessando(false);
    }
  };

  // Reprovação direta na lista (usando zod)
  const reprovarDireto = async (preCadastro: PreCadastroCompleto) => {
    if (!motivoRejeicaoInline[preCadastro.idPreCadastro] || motivoRejeicaoInline[preCadastro.idPreCadastro].trim().length < 3) {
      alert('Informe o motivo da rejeição.');
      return;
    }
    setProcessando(true);
    try {
      const avaliadoPor = cpfResponsavel;
      if (!avaliadoPor) {
        alert('CPF do responsável pela avaliação é inválido ou não encontrado na sessão.');
        setProcessando(false);
        return;
      }
      const payload = {
        idPreCadastro: preCadastro.idPreCadastro,
        status: 'Rejeitado',
        motivoRejeicao: motivoRejeicaoInline[preCadastro.idPreCadastro],
        avaliadoPor,
      };
      AvaliacaoPreCadastroSchema.parse(payload);

      const response = await fetch('/api/pre-cadastro/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setMotivoRejeicaoInline((prev) => ({ ...prev, [preCadastro.idPreCadastro]: '' }));
        carregarPreCadastros();
        alert('Pré-cadastro reprovado!');
      } else {
        const error = await response.text();
        alert(`Erro ao reprovar: ${error}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(error.errors.map((err: z.ZodIssue) => {
          if (err.path.includes('avaliadoPor')) {
            return 'O campo CPF do responsável pela avaliação deve conter no mínimo 11 caracteres (CPF válido).';
          }
          return err.message;
        }).join('\n'));
      } else {
        alert('Erro interno. Tente novamente.');
      }
    } finally {
      setProcessando(false);
    }
  };

  // Filtro: opção "Selecione um filtro" desabilitada, e só permite selecionar após carregamento inicial
  const statusFiltroOptions: { value: StatusPreCadastro | 'Todos' | ''; label: string; disabled?: boolean }[] = [
    { value: '', label: 'Selecione um filtro', disabled: true },
    { value: 'Todos', label: 'Todos' },
    { value: 'EmAnalise', label: 'Em Análise' },
    { value: 'Aprovado', label: 'Aprovado' },
    { value: 'Rejeitado', label: 'Rejeitado' },
    { value: 'DocumentacaoIncompleta', label: 'Doc. Incompleta' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 bg-gray-100 p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900">Avaliação de Pré-Cadastros</h2>
        <div className="flex items-center gap-6">
          <span className="text-base text-blue-900 font-semibold bg-blue-100 px-4 py-2 rounded-lg border border-blue-200">
            Seu CPF: {cpfResponsavel || 'Não encontrado'}
          </span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusPreCadastro | 'Todos' | '')}
            className="px-4 py-2 border bg-white text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
          >
            {statusFiltroOptions.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={carregarPreCadastros}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base"
          >
            Atualizar
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="text-center py-16">
          <div className="text-gray-500 text-xl">Carregando...</div>
        </div>
      ) : preCadastros.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-500 text-xl">
            Nenhum pré-cadastro encontrado para o filtro selecionado.
          </div>
        </div>
      ) : (
        <div className="grid gap-8">
          {preCadastros.map((preCadastro) => (
            <div
              key={preCadastro.idPreCadastro}
              className="bg-gray-100 rounded-2xl p-8 shadow-lg border border-gray-300"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {preCadastro.nome} {preCadastro.sobrenome}
                  </h3>
                  <div className="text-base text-gray-600">
                    CPF: {isValidCPF(preCadastro.cpf) ? formatCPF(preCadastro.cpf) : preCadastro.cpf}
                  </div>
                  <div className="text-base text-gray-600 break-all max-w-xs md:max-w-sm">
                    Email: {preCadastro.email}
                  </div>
                  <div className="text-base text-gray-600">Curso: {preCadastro.curso?.nomeCurso}</div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-base font-medium border ${getStatusColor(preCadastro.status)}`}>
                    {preCadastro.status}
                  </span>
                  <div className="text-base text-gray-500 mt-2">
                    Enviado em: {formatarData(preCadastro.dataEnvio || new Date())}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-white rounded-xl p-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Dados Pessoais</h4>
                  <div className="text-base text-gray-600 space-y-1">
                    <p>RG: {formatRG(preCadastro.rg)}</p>
                    <p>Data Nasc.: {formatarData(preCadastro.dataNasc)}</p>
                    <p>Mãe: {preCadastro.nomeMae}</p>
                    {preCadastro.nomePai && <p>Pai: {preCadastro.nomePai}</p>}
                    <p>Telefone: {preCadastro.telefone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Endereço</h4>
                  <div className="text-base text-gray-600 space-y-1">
                    <p>{preCadastro.rua}, {preCadastro.numero}</p>
                    {preCadastro.complemento && <p>{preCadastro.complemento}</p>}
                    <p>{preCadastro.cidade} - {preCadastro.uf}</p>
                    <p>CEP: {preCadastro.cep}</p>
                  </div>
                </div>
              </div>
              {preCadastro.documentos && preCadastro.documentos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Documentos Enviados</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {preCadastro.documentos.map((doc, index) => (
                      <button
                        key={index}
                        onClick={() => abrirArquivoAluno(preCadastro.cpf, doc.nomeArquivo)}
                        className="p-3 border border-gray-300 text-white rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="text-base font-medium text-gray-300">{doc.tipoDocumento}</div>
                        <div className="text-sm text-white truncate">{doc.nomeArquivo}</div>
                        <div className="text-sm text-gray-200">
                          {(doc.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {preCadastro.observacoes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Observações</h4>
                  <p className="text-base text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {preCadastro.observacoes}
                  </p>
                </div>
              )}
              {preCadastro.motivoRejeicao && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Motivo da Rejeição</h4>
                  <p className="text-base text-gray-900 bg-white p-4 rounded-lg border border-gray-200">
                    {preCadastro.motivoRejeicao}
                  </p>
                </div>
              )}
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    <button
                      type="button"
                      disabled={processando}
                      onClick={() => aprovarDireto(preCadastro)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-base"
                    >
                      ✓ Aprovar
                    </button>
                    <input
                      type="text"
                      placeholder="Motivo da rejeição"
                      value={motivoRejeicaoInline[preCadastro.idPreCadastro] || ''}
                      onChange={e =>
                        setMotivoRejeicaoInline(prev => ({
                          ...prev,
                          [preCadastro.idPreCadastro]: e.target.value,
                        }))
                      }
                      className="border border-gray-300 text-gray-900 bg-white rounded px-3 py-2 text-base w-60"
                      disabled={processando}
                    />
                    <button
                      type="button"
                      disabled={processando}
                      onClick={() => reprovarDireto(preCadastro)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-base"
                    >
                      ✗ Reprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirModalAvaliacao(preCadastro)}
                      className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-base"
                    >
                      Avaliação Completa
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 mt-2 md:mt-0">
                  <button
                    onClick={() => abrirModalDetalhes(preCadastro)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base"
                  >
                    👁️ Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalDetalhes && preCadastroSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalhes do Pré-Cadastro
            </h3>
            <div className="mb-4">
              <div className="font-bold text-gray-700 mb-2">
                {preCadastroSelecionado.nome} {preCadastroSelecionado.sobrenome}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>CPF: {preCadastroSelecionado.cpf}</div>
                <div>RG: {formatRG(preCadastroSelecionado.rg)}</div>
                <div>Data Nasc.: {formatarData(preCadastroSelecionado.dataNasc)}</div>
                <div>Email: {preCadastroSelecionado.email}</div>
                <div>Telefone: {preCadastroSelecionado.telefone}</div>
                {preCadastroSelecionado.telefoneResponsavel && (
                  <div>Tel. Responsável: {preCadastroSelecionado.telefoneResponsavel}</div>
                )}
                <div>Mãe: {preCadastroSelecionado.nomeMae}</div>
                {preCadastroSelecionado.nomePai && <div>Pai: {preCadastroSelecionado.nomePai}</div>}
                {preCadastroSelecionado.nomeResponsavel && <div>Responsável: {preCadastroSelecionado.nomeResponsavel}</div>}
                <div>Curso: {preCadastroSelecionado.curso?.nomeCurso}</div>
                <div>Endereço: {preCadastroSelecionado.rua}, {preCadastroSelecionado.numero} {preCadastroSelecionado.complemento && `- ${preCadastroSelecionado.complemento}`}, {preCadastroSelecionado.cidade} - {preCadastroSelecionado.uf}, CEP: {preCadastroSelecionado.cep}</div>
                <div>Status: <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(preCadastroSelecionado.status)}`}>{preCadastroSelecionado.status}</span></div>
                <div>Enviado em: {formatarData(preCadastroSelecionado.dataEnvio || new Date())}</div>
              </div>
            </div>
            {preCadastroSelecionado.documentos && preCadastroSelecionado.documentos.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Documentos Enviados</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {preCadastroSelecionado.documentos.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => abrirArquivoAluno(preCadastroSelecionado.cpf, doc.nomeArquivo)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="text-sm font-medium text-gray-300">{doc.tipoDocumento}</div>
                      <div className="text-xs text-white truncate">{doc.nomeArquivo}</div>
                      <div className="text-xs text-gray-200">
                        {(doc.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {preCadastroSelecionado.observacoes && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Observações</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {preCadastroSelecionado.observacoes}
                </p>
              </div>
            )}
            {preCadastroSelecionado.motivoRejeicao && (
              <div className="mb-4">
                <h4 className="font-semibold text-red-900 mb-2">Motivo da Rejeição</h4>
                <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                  {preCadastroSelecionado.motivoRejeicao}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalDetalhes(false)}
                className="px-4 py-2 border border-gray-300 text-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              {preCadastroSelecionado.status === 'Pendente' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setModalDetalhes(false);
                      setStatusAvaliacao('Aprovado');
                      setObservacoes('');
                      setMotivoRejeicao('');
                      setModalAvaliacao(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✓ Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalDetalhes(false);
                      setStatusAvaliacao('Rejeitado');
                      setObservacoes('');
                      setMotivoRejeicao('');
                      setModalAvaliacao(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ✗ Reprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalDetalhes(false);
                      abrirModalAvaliacao(preCadastroSelecionado);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Avaliação Completa
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Avaliação */}
      {modalAvaliacao && preCadastroSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Avaliar Pré-Cadastro
            </h3>
            <p className="text-gray-600 mb-4">
              {preCadastroSelecionado.nome} {preCadastroSelecionado.sobrenome}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status da Avaliação
                </label>
                <select
                  value={statusAvaliacao}
                  onChange={(e) => setStatusAvaliacao(e.target.value as 'Aprovado' | 'Rejeitado' | 'DocumentacaoIncompleta')}
                  className="w-full px-3 py-2 border bg-white text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Aprovado">Aprovado</option>
                  <option value="Rejeitado">Rejeitado</option>
                  <option value="DocumentacaoIncompleta">Documentação Incompleta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border text-gray-900 bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações adicionais..."
                />
              </div>

              {statusAvaliacao === 'Rejeitado' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo da Rejeição *
                  </label>
                  <textarea
                    value={motivoRejeicao}
                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Explique o motivo da rejeição..."
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalAvaliacao(false)}
                className="px-4 py-2 border border-gray-300 text-white rounded-lg hover:bg-gray-50 transition-colors"
                disabled={processando}
              >
                Cancelar
              </button>
              <button
                onClick={avaliarPreCadastro}
                disabled={processando || (statusAvaliacao === 'Rejeitado' && !motivoRejeicao.trim())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {processando ? 'Processando...' : 'Confirmar Avaliação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

