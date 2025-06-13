"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PreCadastroSchema, type PreCadastroFormData, type TipoDocumento } from '@/lib/schemas';
import { isValidCPF, isValidRG, formatCPF, formatRG } from '@/utils/cpf-rg';

interface Curso {
  idCurso: number;
  nomeCurso: string;
  cargaHorariaTotal: number;
  descricao?: string;
}

interface ArquivoUpload {
  file: File;
  tipo: TipoDocumento;
  preview?: string;
}

const TIPOS_DOCUMENTO = [
  { value: 'Foto3x4', label: 'Foto 3x4', obrigatorio: true },
  { value: 'RG', label: 'RG (Frente e Verso)', obrigatorio: true },
  { value: 'CPF', label: 'CPF', obrigatorio: true },
  { value: 'ComprovanteResidencia', label: 'Comprovante de Residência', obrigatorio: false },
  { value: 'HistoricoEscolar', label: 'Histórico Escolar', obrigatorio: true },
  { value: 'CertidaoNascimento', label: 'Certidão de Nascimento', obrigatorio: false },
  { value: 'CertidaoCasamento', label: 'Certidão de Casamento', obrigatorio: false },
  { value: 'ComprovanteRenda', label: 'Comprovante de Renda', obrigatorio: false },
  { value: 'Outros', label: 'Outros Documentos', obrigatorio: false }
] as const;

const MAX_ARQUIVOS = 10;
const MAX_TAMANHO_ARQUIVO = 5 * 1024 * 1024; // 5MB

// Função para calcular idade
function calcularIdade(dataNasc: string | Date): number {
  const nascimento = new Date(dataNasc);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

export default function PreCadastroPage() {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [arquivos, setArquivos] = useState<ArquivoUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(PreCadastroSchema),
    mode: 'onChange'
  });

  // Buscar cursos disponíveis
  useEffect(() => {
    async function fetchCursos() {
      try {
        const response = await fetch('/api/cursos');
        if (response.ok) {
          const data = await response.json();
          setCursos(data);
        } else {
          throw new Error('Erro ao buscar cursos');
        }
      } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        setMensaje('Erro ao carregar cursos disponíveis');
      }
    }
    fetchCursos();
  }, []);

  // Buscar CEP
  const buscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setValue('rua', data.logradouro);
          setValue('cidade', data.localidade);
          setValue('uf', data.uf);
        } else {
          setMensaje('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setMensaje('Erro ao buscar CEP');
      }
    }
  };

  // Gerenciar upload de arquivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, tipo: TipoDocumento) => {
    const files = Array.from(event.target.files || []);
    
    if (arquivos.length + files.length > MAX_ARQUIVOS) {
      setMensaje(`Máximo de ${MAX_ARQUIVOS} arquivos permitidos`);
      return;
    }

    files.forEach(file => {
      if (file.size > MAX_TAMANHO_ARQUIVO) {
        setMensaje(`Arquivo ${file.name} é muito grande (máximo 5MB)`);
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                           'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(file.type)) {
        setMensaje(`Tipo de arquivo não permitido: ${file.name}`);
        return;
      }

      const novoArquivo: ArquivoUpload = { file, tipo };
      
      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          novoArquivo.preview = e.target?.result as string;
          setArquivos(prev => [...prev, novoArquivo]);
        };
        reader.readAsDataURL(file);
      } else {
        setArquivos(prev => [...prev, novoArquivo]);
      }
    });

    // Limpar input
    event.target.value = '';
  };

  const removerArquivo = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const proximaEtapa = async () => {
    let fieldsToValidate: (keyof PreCadastroFormData)[] = [];

    if (etapaAtual === 1) {
      fieldsToValidate = ['nome', 'sobrenome', 'cpf', 'rg', 'dataNasc', 'email', 'telefone', 'nomeMae'];
    } else if (etapaAtual === 2) {
      fieldsToValidate = ['cep', 'rua', 'cidade', 'uf', 'numero', 'idCursoDesejado'];
    }

    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && etapaAtual < 3) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const validarDocumentosObrigatorios = () => {
    const documentosObrigatorios = TIPOS_DOCUMENTO.filter(t => t.obrigatorio);
    const tiposEnviados = arquivos.map(a => a.tipo);
    
    for (const doc of documentosObrigatorios) {
      if (!tiposEnviados.includes(doc.value as TipoDocumento)) {
        setMensaje(`Documento obrigatório não enviado: ${doc.label}`);
        return false;
      }
    }
    return true;
  };

  // Adicione um log para depuração do submit
  const onSubmit: import("react-hook-form").SubmitHandler<PreCadastroFormData> = async (data) => {
    console.log("onSubmit chamado", data, arquivos);
    setMensaje(""); // Limpa mensagem anterior

    // Checagem dinâmica do telefone do responsável
    const idade = calcularIdade(data.dataNasc);
    if (idade < 18) {
      if (!data.telefoneResponsavel || data.telefoneResponsavel.length < 10) {
        setMensaje('Se você é menor de 18 anos, o telefone do responsável é obrigatório e deve ter pelo menos 10 dígitos.');
        return;
      }
    }

    if (arquivos.length === 0) {
      setMensaje('Envie pelo menos um documento.');
      return;
    }

    if (!validarDocumentosObrigatorios()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // NÃO limpe CPF e RG, envie com pontuação e valide usando cpf-rg.ts
      if (!isValidCPF(data.cpf)) {
        setMensaje('CPF inválido.');
        setIsSubmitting(false);
        return;
      }
      if (!isValidRG(data.rg)) {
        setMensaje('RG inválido.');
        setIsSubmitting(false);
        return;
      }

      // Formata o RG antes de enviar
      const rgFormatado = formatRG(data.rg);
      const cpfFormatado = formatCPF(data.cpf);

      // Mostra no console o valor do CPF e RG antes de enviar
      console.log('CPF enviado:', cpfFormatado); // Deve estar com pontuação
      console.log('RG enviado:', rgFormatado); // Deve estar com pontuação

      // Monta payload para o pré-cadastro (CPF e RG já formatados)
      const preCadastroPayload = {
        ...data,
        rg: rgFormatado,
      };

      // Primeiro, criar o pré-cadastro
      const preCadastroResponse = await fetch('/api/pre-cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preCadastroPayload)
      });

      if (!preCadastroResponse.ok) {
        const errorText = await preCadastroResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }

        // Tratamento específico para diferentes tipos de erro de banco
        if (
          errorData.error?.includes('does not exist') ||
          errorData.error?.includes('P2021') ||
          errorData.error?.includes('PreCadastro') ||
          preCadastroResponse.status === 500
        ) {
          setMensaje('O sistema está em configuração. Seu pré-cadastro NÃO foi enviado, mas seus dados foram validados. Entre em contato com a secretaria.');
          setEtapaAtual(4);
          setIsSubmitting(false);
          return;
        }

        setMensaje(errorData.error || 'Erro ao criar pré-cadastro.');
        setIsSubmitting(false);
        return;
      }

      const result = await preCadastroResponse.json();

      // Se não tem idPreCadastro, simular sucesso local
      if (!result.idPreCadastro) {
        setMensaje('O sistema está em configuração. Seu pré-cadastro NÃO foi enviado, mas seus dados foram validados. Entre em contato com a secretaria.');
        setEtapaAtual(4);
        setIsSubmitting(false);
        return;
      }

      // Se chegou aqui, o sistema está funcionando - continuar com upload
      const formData = new FormData();
      formData.append('idPreCadastro', result.idPreCadastro.toString());

      // Salva arquivos em public/alunos/cpf
      arquivos.forEach((arquivo) => {
        formData.append('documentos', arquivo.file);
        formData.append('tipos', arquivo.tipo);
      });

      const uploadResponse = await fetch('/api/pre-cadastro/documentos', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const uploadErrorText = await uploadResponse.text();
        setMensaje('Erro ao fazer upload dos documentos: ' + uploadErrorText);
        setIsSubmitting(false);
        return;
      }

      setMensaje('Pré-cadastro enviado com sucesso!');
      setEtapaAtual(4);

    } catch (error) {
      console.error('Erro ao enviar pré-cadastro:', error);
      setMensaje('Erro inesperado ao enviar pré-cadastro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressoEtapa = (etapaAtual / 4) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #faf5ff 100%)', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Pré-Cadastro de Matrícula
          </h1>
          <p style={{ color: '#6b7280' }}>
            Preencha seus dados e envie os documentos necessários
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Etapa {etapaAtual} de 4
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {Math.round(progressoEtapa)}% concluído
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${progressoEtapa}%`, 
                height: '100%', 
                backgroundColor: '#3b82f6', 
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Mensagem de feedback */}
        {mensaje && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: mensaje.includes('sucesso') ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${mensaje.includes('sucesso') ? '#10b981' : '#ef4444'}`,
            borderRadius: '8px',
            color: mensaje.includes('sucesso') ? '#065f46' : '#991b1b'
          }}>
            {mensaje}
          </div>
        )}

        <form
          onSubmit={handleSubmit(
            onSubmit,
            (formErrors) => {
              // Callback de erro do react-hook-form
              // Ajuste para mensagem mais clara
              if (formErrors.telefoneResponsavel) {
                setMensaje('Se você é menor de 18 anos, o telefone do responsável é obrigatório e deve ter pelo menos 10 dígitos.');
              } else {
                setMensaje('Preencha todos os campos obrigatórios corretamente.');
              }
              console.warn('Erros de validação:', formErrors);
            }
          )}
          className='bg-white shadow-md rounded-lg p-6'
        >
          {/* Etapa 1: Dados Pessoais */}
          {etapaAtual === 1 && (
            <div className="card bg-white shadow-md rounded-lg p-6">
              <div style={{ marginBottom: '1.5rem' }}>
                 <h2 className='text-gray-800' style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold' 
                  }}>
                    1
                  </div>
                  Dados Pessoais
                </h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div>
                  <label htmlFor="nome" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nome *</label>
                  <input
                    id="nome"
                    {...register('nome')}
                    placeholder="Digite seu nome"
                    style={{ width: '100%' }}
                  />
                  {errors.nome && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="sobrenome" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Sobrenome *</label>
                  <input
                    id="sobrenome"
                    {...register('sobrenome')}
                    placeholder="Digite seu sobrenome"
                    style={{ width: '100%' }}
                  />
                  {errors.sobrenome && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.sobrenome.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cpf" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>CPF *</label>
                  <input
                    id="cpf"
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      e.target.value = formatted;
                      setValue('cpf', e.target.value.replace(/\D/g, ''));
                    }}
                    onBlur={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      if (valor.length === 11) {
                        if (!isValidCPF(valor)) {
                          setError('cpf', { message: 'CPF inválido' });
                        } else {
                          clearErrors('cpf');
                        }
                      }
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    style={{ width: '100%' }}
                  />
                  {errors.cpf && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.cpf.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="rg" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>RG *</label>
                  <input
                    id="rg"
                    onChange={(e) => {
                      const formatted = formatRG(e.target.value);
                      e.target.value = formatted;
                      setValue('rg', e.target.value.replace(/\D/g, ''));
                    }}
                    onBlur={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      if (valor.length >= 7) {
                        if (!isValidRG(valor)) {
                          setError('rg', { message: 'RG inválido' });
                        } else {
                          clearErrors('rg');
                        }
                      }
                    }}
                    placeholder="00.000.000-0"
                    maxLength={12}
                    style={{ width: '100%' }}
                  />
                  {errors.rg && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.rg.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dataNasc" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Data de Nascimento *</label>
                  <input
                    id="dataNasc"
                    type="date"
                    {...register('dataNasc')}
                    style={{ width: '100%' }}
                  />
                  {errors.dataNasc && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.dataNasc.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email *</label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="seu@email.com"
                    style={{ width: '100%' }}
                  />
                  {errors.email && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="telefone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Telefone *</label>
                  <input
                    id="telefone"
                    {...register('telefone')}
                    placeholder="(11) 99999-9999"
                    style={{ width: '100%' }}
                  />
                  {errors.telefone && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.telefone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="nomeMae" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nome da Mãe *</label>
                  <input
                    id="nomeMae"
                    {...register('nomeMae')}
                    placeholder="Nome completo da mãe"
                    style={{ width: '100%' }}
                  />
                  {errors.nomeMae && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.nomeMae.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="nomePai" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nome do Pai</label>
                  <input
                    id="nomePai"
                    {...register('nomePai')}
                    placeholder="Nome completo do pai (opcional)"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label htmlFor="nomeResponsavel" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nome do Responsável</label>
                  <input
                    id="nomeResponsavel"
                    {...register('nomeResponsavel')}
                    placeholder="Se menor de idade"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label htmlFor="telefoneResponsavel" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Telefone do Responsável</label>
                  <input
                    id="telefoneResponsavel"
                    {...register('telefoneResponsavel')}
                    placeholder="(11) 99999-9999"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" onClick={proximaEtapa} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Próxima Etapa →
                </button>
              </div>
            </div>
          )}

          {/* Etapa 2: Endereço e Curso */}
          {etapaAtual === 2 && (
            <div className="card bg-white shadow-md rounded-lg p-6">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold' 
                  }}>
                    2
                  </div>
                  Endereço e Curso
                </h2>
              </div>

              {/* Endereço */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Endereço</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label htmlFor="cep" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>CEP *</label>
                    <input
                      id="cep"
                      {...register('cep')}
                      placeholder="00000-000"
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => buscarCEP(e.target.value)}
                      style={{ width: '100%' }}
                    />
                    {errors.cep && (
                      <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.cep.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="uf" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>UF *</label>
                    <input
                      id="uf"
                      {...register('uf')}
                      placeholder="SP"
                      maxLength={2}
                      style={{ width: '100%' }}
                    />
                    {errors.uf && (
                      <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.uf.message}</p>
                    )}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="rua" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Rua *</label>
                    <input
                      id="rua"
                      {...register('rua')}
                      placeholder="Nome da rua"
                      style={{ width: '100%' }}
                    />
                    {errors.rua && (
                      <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.rua.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="numero" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Número *</label>
                    <input
                      id="numero"
                      {...register('numero')}
                      placeholder="123"
                      style={{ width: '100%' }}
                    />
                    {errors.numero && (
                      <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.numero.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="complemento" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Complemento</label>
                    <input
                      id="complemento"
                      {...register('complemento')}
                      placeholder="Apto, Bloco, etc."
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="cidade" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Cidade *</label>
                    <input
                      id="cidade"
                      {...register('cidade')}
                      placeholder="Nome da cidade"
                      style={{ width: '100%' }}
                    />
                    {errors.cidade && (
                      <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.cidade.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Curso */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Curso Desejado</h3>
                <div>
                  <label htmlFor="idCursoDesejado" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Selecione o Curso *</label>
                  <select 
                    {...register('idCursoDesejado', { valueAsNumber: true })}
                    style={{ width: '100%' }}
                  >
                    <option value="">Selecione um curso</option>
                    {cursos.map((curso) => (
                      <option key={curso.idCurso} value={curso.idCurso}>
                        {curso.nomeCurso}
                      </option>
                    ))}
                  </select>
                  {errors.idCursoDesejado && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.idCursoDesejado.message}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button type="button" onClick={etapaAnterior} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ← Etapa Anterior
                </button>
                <button type="button" onClick={proximaEtapa} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Próxima Etapa →
                </button>
              </div>
            </div>
          )}

          {/* Etapa 3: Documentos */}
          {etapaAtual === 3 && (
            <div className="card bg-white shadow-md rounded-lg p-6">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.875rem', 
                    fontWeight: 'bold' 
                  }}>
                    3
                  </div>
                  Documentos Necessários
                </h2>
              </div>

              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#fef3c7', 
                border: '1px solid #f59e0b', 
                borderRadius: '8px', 
                marginBottom: '1.5rem' 
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
                  ⚠️ Envie até {MAX_ARQUIVOS} documentos (máximo 5MB cada). 
                  Formatos aceitos: PDF, JPG, PNG, DOC, DOCX.
                  <br />
                  <strong>Documentos obrigatórios:</strong> Foto 3x4, RG, CPF, Histórico Escolar.
                </p>
              </div>

              {/* Upload de Documentos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <div key={tipo.value} style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      {tipo.label}
                      {tipo.obrigatorio && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, tipo.value as TipoDocumento)}
                        style={{ flex: 1 }}
                      />
                      <span style={{ color: '#9ca3af' }}>📁</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lista de Arquivos Enviados */}
              {arquivos.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                    Documentos Enviados ({arquivos.length}/{MAX_ARQUIVOS})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {arquivos.map((arquivo, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '0.75rem', 
                        backgroundColor: '#f9fafb', 
                        borderRadius: '8px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: '#2563eb' }}>📄</span>
                          <div>
                            <p style={{ margin: 0, fontWeight: '500' }}>{arquivo.file.name}</p>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                              {TIPOS_DOCUMENTO.find(t => t.value === arquivo.tipo)?.label} - 
                              {(arquivo.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerArquivo(index)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            fontSize: '1.125rem',
                            padding: '0.25rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button type="button" onClick={etapaAnterior} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ← Etapa Anterior
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || arquivos.length === 0}
                  style={{
                    minWidth: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isSubmitting || arquivos.length === 0 ? 0.5 : 1,
                    pointerEvents: isSubmitting ? 'none' : 'auto',
                  }}
                  onClick={() => {
                    // Log para depuração do clique
                    console.log("Botão Finalizar Pré-Cadastro clicado");
                  }}
                >
                  {isSubmitting ? 'Enviando...' : 'Finalizar Pré-Cadastro'} ✓
                </button>
              </div>
            </div>
          )}

          {/* Etapa 4: Sucesso */}
          {etapaAtual === 4 && (
            <div className="card bg-white shadow-md rounded-lg p-6" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: mensaje.includes('sucesso') ? '#d1fae5' : '#e0f2fe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem'
              }}>
                ✓
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                {mensaje.includes('sucesso')
                  ? 'Pré-cadastro Enviado com Sucesso!'
                  : 'Dados Validados (Simulação)'}
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                {mensaje.includes('sucesso')
                  ? 'Seu pré-cadastro foi recebido e está sendo analisado. Você receberá um email com o resultado da avaliação em até 5 dias úteis.'
                  : 'O sistema está em configuração. Seu pré-cadastro NÃO foi enviado, mas seus dados foram validados. Entre em contato com a secretaria para finalizar sua matrícula.'}
              </p>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 'bold' }}>
                  Próximos passos:
                </p>
                {mensaje.includes('sucesso') ? (
                  <ul style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'left', display: 'inline-block', margin: '0.5rem 0' }}>
                    <li>• Nossa equipe analisará seus documentos</li>
                    <li>• Você receberá um email com o resultado</li>
                    <li>• Se aprovado, receberá suas credenciais de acesso</li>
                  </ul>
                ) : (
                  <ul style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'left', display: 'inline-block', margin: '0.5rem 0' }}>
                    <li>• Entre em contato conosco pelos canais oficiais</li>
                    <li>• Tenha seus documentos em mãos</li>
                    <li>• Aguarde contato da nossa equipe</li>
                    <li>• Informe que já preencheu o pré-cadastro online</li>
                  </ul>
                )}
              </div>
              {!mensaje.includes('sucesso') && (
                <div style={{
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  backgroundColor: '#e0f2fe',
                  border: '1px solid #0284c7',
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#0c4a6e', fontWeight: '600' }}>
                    📞 Contatos da Secretaria:<br />
                    • Telefone: (11) 3000-0000<br />
                    • Email: secretaria@fatec.sp.gov.br<br />
                    • Presencial: Segunda a Sexta, 8h às 17h<br />
                    • Mencione: &quot;Pré-cadastro online preenchido&quot;
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                style={{ minWidth: '120px' }}
              >
                Voltar ao Início
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
