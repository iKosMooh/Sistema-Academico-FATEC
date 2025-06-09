import { z } from 'zod';

// =========================
// ENUMS DO PRISMA - ATUALIZADO
// =========================
export const StatusMatriculaEnum = z.enum(['Ativa', 'Trancada', 'Cancelada']);
export const TipoUsuarioEnum = z.enum(['Admin', 'Coordenador', 'Professor', 'Aluno']);
export const StatusAtestadoEnum = z.enum(['Pendente', 'Aprovado', 'Rejeitado', 'Analisando']);

// =========================
// SCHEMAS BASE DAS TABELAS (Baseado no schema.prisma exato)
// =========================

// Schema para Alunos
export const AlunosSchema = z.object({
  idAluno: z.number().int().positive().optional(),
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  sobrenome: z.string().min(1, 'Sobrenome é obrigatório').max(150, 'Sobrenome muito longo'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  rg: z.string().min(1, 'RG é obrigatório').max(12, 'RG muito longo'),
  nomeMae: z.string().min(1, 'Nome da mãe é obrigatório').max(160, 'Nome muito longo'),
  nomePai: z.string().max(160, 'Nome muito longo').optional().nullable(),
  dataNasc: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  fotoPath: z.string().max(255, 'Path muito longo').optional().nullable(),
  descricao: z.string().optional().nullable(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para Enderecos
export const EnderecosSchema = z.object({
  idEndereco: z.number().int().positive().optional(),
  idAluno: z.number().int().positive(),
  cep: z.string().max(9, 'CEP inválido'),
  rua: z.string().min(1, 'Rua é obrigatória').max(255, 'Rua muito longa'),
  cidade: z.string().min(1, 'Cidade é obrigatória').max(100, 'Cidade muito longa'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  numero: z.string().min(1, 'Número é obrigatório').max(10, 'Número muito longo'),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para ContatoAluno
export const ContatoAlunoSchema = z.object({
  idContato: z.number().int().positive().optional(),
  idAluno: z.number().int().positive(),
  nomeTel1: z.string().min(1, 'Nome do telefone 1 é obrigatório').max(45, 'Nome muito longo'),
  tel1: z.string().min(1, 'Telefone 1 é obrigatório').max(20, 'Telefone muito longo'),
  nomeTel2: z.string().max(45, 'Nome muito longo').optional().nullable(),
  tel2: z.string().max(20, 'Telefone muito longo').optional().nullable(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para Curso
export const CursoSchema = z.object({
  idCurso: z.number().int().positive().optional(),
  nomeCurso: z.string().min(1, 'Nome do curso é obrigatório').max(255, 'Nome muito longo'),
  cargaHorariaTotal: z.number().int().positive(),
  descricao: z.string().optional().nullable(),
  docsPath: z.string().max(255, 'Path muito longo').optional().nullable(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para Materias
export const MateriasSchema = z.object({
  idMateria: z.number().int().positive().optional(),
  nomeMateria: z.string().min(1, 'Nome da matéria é obrigatório').max(180, 'Nome muito longo'),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para CursoMaterias (chave composta)
export const CursoMateriasSchema = z.object({
  idCurso: z.number().int().positive(),
  idMateria: z.number().int().positive(),
  cargaHoraria: z.number().int().positive(),
});

// Schema para Professores
export const ProfessoresSchema = z.object({
  idProfessor: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  sobrenome: z.string().min(1, 'Sobrenome é obrigatório').max(150, 'Sobrenome muito longo'),
  rg: z.string().min(1, 'RG é obrigatório').max(12, 'RG muito longo'),
  dataNasc: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  cargo: z.string().min(1, 'Cargo é obrigatório').max(100, 'Cargo muito longo'),
  fotoPath: z.string().max(255, 'Path muito longo').optional().nullable(),
  docsPath: z.string().max(255, 'Path muito longo').optional().nullable(),
  descricao: z.string().optional().nullable(),
  tel: z.string().max(20, 'Telefone muito longo').optional().nullable(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para Turmas
export const TurmasSchema = z.object({
  idTurma: z.number().int().positive().optional(),
  idCurso: z.number().int().positive(),
  nomeTurma: z.string().min(1, 'Nome da turma é obrigatório').max(100, 'Nome muito longo'),
  anoLetivo: z.number().int().min(2020).max(2030),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para TurmaAluno (chave composta)
export const TurmaAlunoSchema = z.object({
  idTurma: z.number().int().positive(),
  idAluno: z.number().int().positive(),
  statusMatricula: StatusMatriculaEnum.default('Ativa'),
  created_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para Aula (tabela mapeada como "Aulas")
export const AulaSchema = z.object({
  idAula: z.number().int().positive().optional(),
  idTurma: z.number().int().positive(),
  idMateria: z.number().int().positive(),
  dataAula: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  horario: z.string().optional().nullable(),
  duracaoMinutos: z.number().int().positive().optional().nullable(),
  aulaConcluida: z.boolean().default(false),
  presencasAplicadas: z.boolean().default(false),
  observacoes: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  planejamento: z.string().optional().nullable(),
  metodologia: z.string().optional().nullable(),
  conteudoMinistrado: z.string().optional().nullable(),
  metodologiaAplicada: z.string().optional().nullable(),
  observacoesAula: z.string().optional().nullable(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para DocsAula (tabela mapeada como "DocsAulas")
export const DocsAulaSchema = z.object({
  idDocAula: z.number().int().positive().optional(),
  idAula: z.number().int().positive(),
  src: z.string().min(1, 'Caminho do arquivo é obrigatório'),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para Presencas
export const PresencasSchema = z.object({
  idPresenca: z.number().int().positive().optional(),
  idAula: z.number().int().positive(),
  idAluno: z.number().int().positive(),
  idProfessor: z.string().min(11, 'CPF do professor inválido').max(14, 'CPF inválido'),
  presente: z.boolean(),
  justificativa: z.string().optional().nullable(),
  dataRegistro: z.union([z.string(), z.date()]).optional(),
});

// Schema para HistoricoEscolar
export const HistoricoEscolarSchema = z.object({
  idHistorico: z.number().int().positive().optional(),
  idAluno: z.number().int().positive(),
  idCurso: z.number().int().positive(),
  idMateria: z.number().int().positive(),
  nota: z.number().min(0).max(10).default(0),
  frequencia: z.number().min(0).max(100).default(0),
  created_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para Usuarios
export const UsuariosSchema = z.object({
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  senhaHash: z.string().min(1, 'Hash da senha é obrigatório').max(255),
  tipo: TipoUsuarioEnum,
  created_at: z.union([z.string(), z.date()]).optional(),
});

// Schema para Log
export const LogSchema = z.object({
  idLog: z.number().int().positive().optional(),
  action: z.string().min(1, 'Ação é obrigatória'),
  dateTime: z.union([z.string(), z.date()]).optional(),
});

// Schema para DiasNaoLetivos
export const DiasNaoLetivosSchema = z.object({
  id: z.number().int().positive().optional(),
  data: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  descricao: z.string().max(255, 'Descrição muito longa').optional().nullable(),
});

// Schema para Notas
export const NotasSchema = z.object({
  idNota: z.number().int().positive().optional(),
  nome: z.string().min(1, 'Nome da avaliação é obrigatório').max(100, 'Nome muito longo'),
  idAluno: z.number().int().positive(),
  idMateria: z.number().int().positive(),
  idTurma: z.number().int().positive(),
  idProfessor: z.string().min(11, 'CPF do professor inválido').max(14, 'CPF inválido'),
  valorNota: z.union([
    z.number().min(0, 'Nota deve ser maior ou igual a 0').max(10, 'Nota deve ser menor ou igual a 10'),
    z.string().transform(val => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Valor da nota inválido');
      return num;
    }),
    z.object({}).transform(val => {
      // Trata objetos Decimal do Prisma
      if (val && typeof val === 'object' && 'toString' in val) {
        const num = parseFloat(val.toString());
        if (isNaN(num)) throw new Error('Valor da nota inválido');
        return num;
      }
      throw new Error('Tipo de valor da nota não suportado');
    })
  ]).refine(val => val >= 0 && val <= 10, 'Nota deve estar entre 0 e 10'),
  dataLancamento: z.union([z.string(), z.date()]).optional(),
  tipoAvaliacao: z.string().min(1, 'Tipo de avaliação é obrigatório').max(50, 'Tipo muito longo'),
  observacoes: z.string().optional().nullable(),
});

// Schema para aulas recorrentes
export const AulasRecorrentesSchema = z.object({
  idMateria: z.union([z.string(), z.number()]).transform(val => Number(val)),
  idTurma: z.union([z.string(), z.number()]).transform(val => Number(val)),
  diaSemana: z.union([
    z.string().min(1, 'Dia da semana é obrigatório'),
    z.number().min(0).max(6)
  ]),
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  duracaoMinutos: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => val > 0, 'Duração deve ser maior que 0'),
  dataInicial: z.string().transform(val => {
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error('Data inicial inválida');
    return date;
  }),
  dataFinal: z.string().transform(val => {
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error('Data final inválida');
    return date;
  }),
  listaExcecoes: z.array(z.string()).default([]).transform(arr => 
    arr.map(d => {
      const date = new Date(d);
      if (isNaN(date.getTime())) throw new Error(`Data de exceção inválida: ${d}`);
      return date.toISOString().slice(0, 10);
    })
  ),
}).refine(data => data.dataInicial <= data.dataFinal, {
  message: 'Data inicial deve ser anterior ou igual à data final',
  path: ['dataFinal']
});

// =========================
// SCHEMAS COM RELACIONAMENTOS
// =========================

// Schema para Turma com relacionamentos (mantido para compatibilidade)
export const TurmaSchema = TurmasSchema.extend({
  curso: z.object({
    nomeCurso: z.string()
  }).optional()
});

// Schema para dados de formulário de turma
export const TurmaFormSchema = z.object({
  nomeTurma: z.string().min(1, 'Nome da turma é obrigatório'),
  anoLetivo: z.union([
    z.string().regex(/^\d{4}$/, 'Ano deve ter 4 dígitos'),
    z.number().min(2020).max(2030)
  ]).transform(val => Number(val)),
  idCurso: z.number().min(1, 'Curso é obrigatório'),
});

// Schema para formulário de usuário
export const CreateUserSchema = z.object({
  cpf: z.string().min(11).max(14),
  senha: z.string().min(4),
  tipo: TipoUsuarioEnum
});

// Schema para upload de arquivos
export const UploadArquivoSchema = z.object({
  idAula: z.union([z.string(), z.number()]).transform(val => Number(val)),
  tipo: z.enum(['planejamento', 'materiais']),
});

// Schema para registro de presença
export const RegistroPresencaSchema = z.object({
  idAula: z.union([z.string(), z.number()]).transform(val => Number(val)),
  presencas: z.array(z.object({
    idAluno: z.union([z.string(), z.number()]).transform(val => Number(val)),
    presente: z.boolean(),
    justificativa: z.string().optional(),
  })),
  conteudoMinistrado: z.string().optional(),
  observacoesAula: z.string().optional(),
  metodologiaAplicada: z.string().optional(),
  idProfessor: z.string().min(11, 'CPF do professor é obrigatório').max(14)
});

// Schema para AtestadosMedicos
export const AtestadosMedicosSchema = z.object({
  idAtestado: z.number().int().positive().optional(),
  idAluno: z.number().int().positive(),
  dataInicio: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  dataFim: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  motivo: z.string().min(1, 'Motivo é obrigatório').max(255, 'Motivo muito longo'),
  arquivoPath: z.string().min(1, 'Arquivo é obrigatório').max(500, 'Path muito longo'),
  dataEnvio: z.union([z.string(), z.date()]).optional(),
  status: StatusAtestadoEnum.default('Pendente'),
  observacoes: z.string().optional().nullable(),
  avaliadoPor: z.string().min(11).max(14).optional().nullable(),
  dataAvaliacao: z.union([z.string(), z.date()]).optional().nullable(),
  justificativaRejeicao: z.string().optional().nullable(),
}).refine(data => data.dataInicio <= data.dataFim, {
  message: 'Data de início deve ser anterior ou igual à data de fim',
  path: ['dataFim']
});

// Schema para AtestadoAulas
export const AtestadoAulasSchema = z.object({
  idAtestado: z.number().int().positive(),
  idAula: z.number().int().positive(),
  aplicado: z.boolean().default(false),
  dataAplicacao: z.union([z.string(), z.date()]).optional().nullable(),
});

// Schema para envio de atestado (formulário) - CORRIGIDO
export const EnvioAtestadoSchema = z.object({
  idAluno: z.number().int().positive(),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  motivo: z.string().min(1, 'Motivo é obrigatório').max(255, 'Motivo muito longo'), // Reduzido de 5 para 1
  aulasAfetadas: z.array(z.number().int().positive()).min(1, 'Selecione pelo menos uma aula'),
  observacoes: z.string().optional(),
  idTurma: z.number().int().positive().optional(), // Adicionar idTurma como opcional
}).refine(data => new Date(data.dataInicio) <= new Date(data.dataFim), {
  message: 'Data de início deve ser anterior ou igual à data de fim',
  path: ['dataFim']
});

// Schema específico para upload de atestado (usado na API)
export const UploadAtestadoSchema = z.object({
  idAluno: z.number().int().positive(),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  motivo: z.string().min(1, 'Motivo é obrigatório').max(255, 'Motivo muito longo'),
  aulasAfetadas: z.array(z.number().int().positive()).min(1, 'Selecione pelo menos uma aula'),
  observacoes: z.string().optional().nullable(),
  idTurma: z.number().int().positive().optional(),
});

// =========================
// NOVOS ENUMS PARA PRÉ-CADASTRO
// =========================
export const StatusPreCadastroEnum = z.enum(['Pendente', 'EmAnalise', 'Aprovado', 'Rejeitado', 'DocumentacaoIncompleta']);
export const TipoDocumentoEnum = z.enum(['Foto3x4', 'RG', 'CPF', 'ComprovanteResidencia', 'HistoricoEscolar', 'CertidaoNascimento', 'CertidaoCasamento', 'ComprovanteRenda', 'Outros']);

// =========================
// SCHEMAS PARA PRÉ-CADASTRO - MELHORADOS
// =========================

// Schema para validação de CPF
const CPFSchema = z.string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(11, 'CPF deve ter 11 dígitos')
  .regex(/^\d{11}$/, 'CPF deve conter apenas números')
  .refine((cpf) => {
    // Validação básica de CPF
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
  }, 'CPF inválido');

// Schema para validação de email melhorado
const EmailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .refine((email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }, 'Formato de email inválido');

// Schema para telefone brasileiro
const TelefoneSchema = z.string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone muito longo')
  .regex(/^[\d\s\(\)\-\+]*$/, 'Formato de telefone inválido');

// Schema para CEP brasileiro
const CEPSchema = z.string()
  .regex(/^\d{5}-?\d{3}$/, 'CEP deve ter formato 00000-000 ou 00000000')
  .transform((cep) => cep.replace(/\D/g, ''));

// Schema melhorado para PreCadastro
export const PreCadastroSchema = z.object({
  idPreCadastro: z.number().int().positive().optional(),
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  sobrenome: z.string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(150, 'Sobrenome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),
  cpf: CPFSchema,
  rg: z.string()
    .min(7, 'RG deve ter pelo menos 7 dígitos')
    .max(12, 'RG muito longo')
    .regex(/^\d+$/, 'RG deve conter apenas números'),
  nomeMae: z.string()
    .min(5, 'Nome da mãe deve ter pelo menos 5 caracteres')
    .max(160, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  nomePai: z.string()
    .max(160, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Nome deve conter apenas letras')
    .optional()
    .nullable(),
  dataNasc: z.union([z.string(), z.date()])
    .transform(val => new Date(val))
    .refine((date) => {
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
      return date >= minDate && date <= maxDate;
    }, 'Data de nascimento deve estar entre 14 e 100 anos atrás'),
  email: EmailSchema,
  telefone: TelefoneSchema,
  telefoneResponsavel: TelefoneSchema.optional().nullable(),
  nomeResponsavel: z.string()
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Nome deve conter apenas letras')
    .optional()
    .nullable(),
  
  // Endereço com validações específicas
  cep: CEPSchema,
  rua: z.string()
    .min(5, 'Rua deve ter pelo menos 5 caracteres')
    .max(255, 'Rua muito longa'),
  cidade: z.string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade muito longa')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Cidade deve conter apenas letras'),
  uf: z.string()
    .length(2, 'UF deve ter exatamente 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'UF deve conter apenas letras maiúsculas')
    .refine((uf) => {
      const ufsValidas = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
      return ufsValidas.includes(uf);
    }, 'UF inválida'),
  numero: z.string()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número muito longo'),
  complemento: z.string()
    .max(100, 'Complemento muito longo')
    .optional()
    .nullable(),
  
  // Curso
  idCursoDesejado: z.number()
    .int()
    .positive('Selecione um curso válido'),
  
  // Status e dados de controle
  status: StatusPreCadastroEnum.default('Pendente'),
  dataEnvio: z.union([z.string(), z.date()]).optional(),
  dataAvaliacao: z.union([z.string(), z.date()]).optional().nullable(),
  avaliadoPor: z.string().min(11).max(14).optional().nullable(),
  observacoes: z.string().max(1000, 'Observações muito longas').optional().nullable(),
  motivoRejeicao: z.string().max(1000, 'Motivo muito longo').optional().nullable(),
});

// Schema para formulário de pré-cadastro (frontend) - MELHORADO
export const PreCadastroFormSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')
    .transform(name => name.trim().replace(/\s+/g, ' ')),
  sobrenome: z.string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(150, 'Sobrenome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras')
    .transform(name => name.trim().replace(/\s+/g, ' ')),
  cpf: CPFSchema,
  rg: z.string()
    .min(7, 'RG deve ter pelo menos 7 dígitos')
    .max(12, 'RG muito longo')
    .regex(/^\d+$/, 'RG deve conter apenas números'),
  nomeMae: z.string()
    .min(5, 'Nome da mãe deve ter pelo menos 5 caracteres')
    .max(160, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')
    .transform(name => name.trim().replace(/\s+/g, ' ')),
  nomePai: z.string()
    .max(160, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Nome deve conter apenas letras')
    .optional()
    .transform(val => val ? val.trim().replace(/\s+/g, ' ') : undefined),
  dataNasc: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((date) => {
      const inputDate = new Date(date);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
      return inputDate >= minDate && inputDate <= maxDate;
    }, 'Idade deve estar entre 14 e 100 anos'),
  email: EmailSchema,
  telefone: TelefoneSchema,
  telefoneResponsavel: TelefoneSchema.optional(),
  nomeResponsavel: z.string()
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Nome deve conter apenas letras')
    .optional()
    .transform(val => val ? val.trim().replace(/\s+/g, ' ') : undefined),
  
  // Endereço
  cep: CEPSchema,
  rua: z.string()
    .min(5, 'Rua deve ter pelo menos 5 caracteres')
    .max(255, 'Rua muito longa')
    .transform(val => val.trim()),
  cidade: z.string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade muito longa')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Cidade deve conter apenas letras')
    .transform(val => val.trim()),
  uf: z.string()
    .length(2, 'UF deve ter exatamente 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'UF deve conter apenas letras maiúsculas')
    .refine((uf) => {
      const ufsValidas = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
      return ufsValidas.includes(uf);
    }, 'UF inválida'),
  numero: z.string()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número muito longo'),
  complemento: z.string()
    .max(100, 'Complemento muito longo')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  // Curso
  idCursoDesejado: z.number()
    .int()
    .positive('Selecione um curso válido'),
})
.superRefine((data, ctx) => {
  // Validação condicional: telefoneResponsavel obrigatório se menor de 18 anos
  const idade = (() => {
    const nascimento = new Date(data.dataNasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  })();

  if (idade < 18) {
    if (!data.telefoneResponsavel || data.telefoneResponsavel.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['telefoneResponsavel'],
        message: 'Se você é menor de 18 anos, o telefone do responsável é obrigatório e deve ter pelo menos 10 dígitos.',
      });
    }
  }
});

// Schema para DocumentosPreCadastro - MELHORADO
export const DocumentosPreCadastroSchema = z.object({
  idDocumento: z.number().int().positive().optional(),
  idPreCadastro: z.number().int().positive(),
  tipoDocumento: TipoDocumentoEnum,
  nomeArquivo: z.string()
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome muito longo')
    .refine((name) => {
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
      const extension = name.toLowerCase().substring(name.lastIndexOf('.'));
      return allowedExtensions.includes(extension);
    }, 'Tipo de arquivo não permitido'),
  caminhoArquivo: z.string()
    .min(1, 'Caminho do arquivo é obrigatório')
    .max(500, 'Caminho muito longo'),
  tamanhoArquivo: z.number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, 'Arquivo muito grande (máximo 5MB)'),
  dataUpload: z.union([z.string(), z.date()]).optional(),
});

// Schema para avaliação de pré-cadastro - MELHORADO
export const AvaliacaoPreCadastroSchema = z.object({
  idPreCadastro: z.number().int().positive(),
  status: z.enum(['Aprovado', 'Rejeitado', 'DocumentacaoIncompleta']),
  observacoes: z.string()
    .max(1000, 'Observações muito longas')
    .optional(),
  motivoRejeicao: z.string()
    .max(1000, 'Motivo muito longo')
    .optional(),
  avaliadoPor: z.string().min(11).max(14),
}).refine((data) => {
  if (data.status === 'Rejeitado' && !data.motivoRejeicao?.trim()) {
    return false;
  }
  return true;
}, {
  message: 'Motivo da rejeição é obrigatório quando o status é "Rejeitado"',
  path: ['motivoRejeicao']
});

// Schema para upload de documentos
export const UploadDocumentosSchema = z.object({
  idPreCadastro: z.number().int().positive(),
  documentos: z.array(z.object({
    file: z.instanceof(File)
      .refine((file) => file.size <= 5 * 1024 * 1024, 'Arquivo muito grande (máximo 5MB)')
      .refine((file) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                             'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        return allowedTypes.includes(file.type);
      }, 'Tipo de arquivo não permitido'),
    tipo: TipoDocumentoEnum,
  })).min(1, 'Pelo menos um documento é obrigatório'),
});

// =========================
// SCHEMAS PARA PRÉ-CADASTRO - REMOVIDO (duplicado acima)
// =========================

// Esta seção foi removida para evitar duplicação de schemas
// Os schemas de pré-cadastro já estão definidos na seção anterior com validações melhoradas

// =========================
// TIPOS TYPESCRIPT DERIVADOS - CORRIGIDOS
// =========================

export type AlunosData = z.infer<typeof AlunosSchema>;
export type EnderecosData = z.infer<typeof EnderecosSchema>;
export type ContatoAlunoData = z.infer<typeof ContatoAlunoSchema>;
export type CursoData = z.infer<typeof CursoSchema>;
export type MateriasData = z.infer<typeof MateriasSchema>;
export type CursoMateriasData = z.infer<typeof CursoMateriasSchema>;
export type ProfessoresData = z.infer<typeof ProfessoresSchema>;
export type TurmasData = z.infer<typeof TurmasSchema>;
export type TurmaAlunoData = z.infer<typeof TurmaAlunoSchema>;
export type AulaData = z.infer<typeof AulaSchema>;
export type DocsAulaData = z.infer<typeof DocsAulaSchema>;
export type PresencasData = z.infer<typeof PresencasSchema>;
export type HistoricoEscolarData = z.infer<typeof HistoricoEscolarSchema>;
export type UsuariosData = z.infer<typeof UsuariosSchema>;
export type LogData = z.infer<typeof LogSchema>;
export type DiasNaoLetivosData = z.infer<typeof DiasNaoLetivosSchema>;
export type NotasData = z.infer<typeof NotasSchema>;
export type AtestadosMedicosData = z.infer<typeof AtestadosMedicosSchema>;
export type AtestadoAulasData = z.infer<typeof AtestadoAulasSchema>;
export type EnvioAtestadoData = z.infer<typeof EnvioAtestadoSchema>;

// Novos tipos para pré-cadastro
export type PreCadastroData = z.infer<typeof PreCadastroSchema>;
export type DocumentosPreCadastroData = z.infer<typeof DocumentosPreCadastroSchema>;
export type PreCadastroFormData = z.infer<typeof PreCadastroFormSchema>;
export type AvaliacaoPreCadastroData = z.infer<typeof AvaliacaoPreCadastroSchema>;
export type StatusPreCadastro = z.infer<typeof StatusPreCadastroEnum>;
export type TipoDocumento = z.infer<typeof TipoDocumentoEnum>;

// Tipos para formulários (mantidos para compatibilidade)
export type TurmaData = z.infer<typeof TurmaSchema>;
export type TurmaFormData = z.infer<typeof TurmaFormSchema>;
export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type UploadArquivoData = z.infer<typeof UploadArquivoSchema>;
export type RegistroPresencaData = z.infer<typeof RegistroPresencaSchema>;
export type UploadAtestadoData = z.infer<typeof UploadAtestadoSchema>;

// Schema para resposta da API
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Tipos de enum
export type StatusMatricula = z.infer<typeof StatusMatriculaEnum>;
export type TipoUsuario = z.infer<typeof TipoUsuarioEnum>;
export type StatusAtestado = z.infer<typeof StatusAtestadoEnum>;

// =========================
// HIERARQUIA DE PERMISSÕES
// =========================
export const USER_HIERARCHY = {
  Admin: 4,
  Coordenador: 3,
  Professor: 2,
  Aluno: 1
} as const;

export type UserRole = keyof typeof USER_HIERARCHY;

// Função para verificar se um usuário tem permissão para acessar um nível
export function hasPermission(userType: TipoUsuario, requiredLevel: TipoUsuario): boolean {
  return USER_HIERARCHY[userType] >= USER_HIERARCHY[requiredLevel];
}

// Função para obter todos os níveis que um usuário pode acessar
export function getAccessibleLevels(userType: TipoUsuario): TipoUsuario[] {
  const userLevel = USER_HIERARCHY[userType];
  return Object.entries(USER_HIERARCHY)
    .filter(([, level]) => level <= userLevel)
    .map(([role]) => role as TipoUsuario);
}

// =========================
// MAPEAMENTO DE TABELAS CORRETO
// =========================

// Mapeamento baseado no schema.prisma real
export const TABLE_MAPPING = {
  // API names -> Prisma model names (EXATO do schema.prisma)
  'alunos': 'alunos',
  'Alunos': 'alunos',
  'enderecos': 'enderecos', 
  'Enderecos': 'enderecos',
  'contatoAluno': 'contatoAluno',
  'ContatoAluno': 'contatoAluno',
  'curso': 'curso',
  'Curso': 'curso',
  'materias': 'materias',
  'Materias': 'materias',
  'cursoMaterias': 'cursoMaterias',
  'CursoMaterias': 'cursoMaterias',
  'professores': 'professores',
  'Professores': 'professores',
  'turmas': 'turmas',
  'Turmas': 'turmas',
  'turmaAluno': 'turmaAluno',
  'TurmaAluno': 'turmaAluno',
  'aula': 'aula',      // Model name: Aula, mapped to table: Aula
  'aulas': 'aula',     // Model name: Aula, mapped to table: Aula
  'Aula': 'aula',      // Model name: Aula, mapped to table: Aula
  'Aulas': 'aula',     // Model name: Aula, mapped to table: Aula
  'docsAula': 'docsAula',    // Model name: DocsAula, mapped to table: DocsAulas
  'DocsAula': 'docsAula',    // Model name: DocsAula, mapped to table: DocsAulas
  'presencas': 'presencas',
  'Presencas': 'presencas',
  'historicoEscolar': 'historicoEscolar',
  'HistoricoEscolar': 'historicoEscolar',
  'usuarios': 'usuarios',
  'Usuarios': 'usuarios',
  'log': 'log',
  'Log': 'log',
  'diasNaoLetivos': 'diasNaoLetivos',
  'DiasNaoLetivos': 'diasNaoLetivos',
  'notas': 'notas',
  'Notas': 'notas',
  'atestadosMedicos': 'atestadosMedicos',
  'AtestadosMedicos': 'atestadosMedicos',
  'atestadoAulas': 'atestadoAulas',
  'AtestadoAulas': 'atestadoAulas',
  'preCadastro': 'preCadastro',
  'PreCadastro': 'preCadastro',
  'documentosPreCadastro': 'documentosPreCadastro',
  'DocumentosPreCadastro': 'documentosPreCadastro',
} as const;

// Atualizar mapeamento de schemas
export const SCHEMA_MAPPING = {
  alunos: AlunosSchema,
  enderecos: EnderecosSchema,
  contatoAluno: ContatoAlunoSchema,
  curso: CursoSchema,
  materias: MateriasSchema,
  cursoMaterias: CursoMateriasSchema,
  professores: ProfessoresSchema,
  turmas: TurmasSchema,
  turmaAluno: TurmaAlunoSchema,
  aula: AulaSchema,
  docsAula: DocsAulaSchema,
  presencas: PresencasSchema,
  historicoEscolar: HistoricoEscolarSchema,
  usuarios: UsuariosSchema,
  log: LogSchema,
  diasNaoLetivos: DiasNaoLetivosSchema,
  notas: NotasSchema,
  atestadosMedicos: AtestadosMedicosSchema,
  atestadoAulas: AtestadoAulasSchema,
  preCadastro: PreCadastroSchema,
  documentosPreCadastro: DocumentosPreCadastroSchema,
} as const;

// =========================
// FUNÇÕES UTILITÁRIAS
// =========================

export function getPrismaTableName(apiTableName: string): string {
  return TABLE_MAPPING[apiTableName as keyof typeof TABLE_MAPPING] || apiTableName;
}

export function getSchemaForTable(tableName: string) {
  const normalizedName = getPrismaTableName(tableName);
  return SCHEMA_MAPPING[normalizedName as keyof typeof SCHEMA_MAPPING];
}

export function validatePayload(tableName: string, data: unknown) {
  const schema = getSchemaForTable(tableName);
  if (!schema) {
    throw new Error(`Schema não encontrado para a tabela: ${tableName}`);
  }
  return schema.parse(data);
}

// Função específica para validar dados de aula
export function validateAulaData(data: unknown) {
  return AulaSchema.parse(data);
}

// Função específica para validar CursoMaterias
export function validateCursoMateriasData(data: unknown) {
  return CursoMateriasSchema.parse(data);
}

// Função para validar relacionamentos específicos
export function validateWithRelations(tableName: string, data: unknown) {
  const schema = getSchemaForTable(tableName);
  if (!schema) {
    throw new Error(`Schema não encontrado para: ${tableName}`);
  }
  return schema.parse(data);
}

// Validação específica para operações CRUD
export function validateCrudPayload(payload: {
  operation: string;
  table: string;
  data?: unknown;
  where?: unknown;
}) {
  const CrudPayloadSchema = z.object({
    operation: z.enum(['get', 'insert', 'update', 'delete', 'upsert']),
    table: z.string(),
    primaryKey: z.string().optional(),
    data: z.record(z.unknown()).optional(),
    relations: z.record(z.union([z.boolean(), z.object({})])).optional(),
    where: z.record(z.unknown()).optional(),
  });

  return CrudPayloadSchema.parse(payload);
}

// Adicionar tipo específico para aulas recorrentes
export type AulasRecorrentesData = z.infer<typeof AulasRecorrentesSchema>;

// Schema para dados do dashboard da turma
export const TurmaDashboardSchema = z.object({
  turma: z.object({
    idTurma: z.number(),
    nomeTurma: z.string(),
    anoLetivo: z.number(),
    curso: z.object({
      nomeCurso: z.string(),
      cargaHorariaTotal: z.number()
    })
  }),
  estatisticas: z.object({
    totalAlunos: z.number(),
    totalAulas: z.number(),
    aulasMinistradas: z.number(),
    mediaGeralTurma: z.number(),
    frequenciaMedia: z.number()
  }),
  graficos: z.object({
    mediaNotas: z.array(z.object({
      materia: z.string(), // Mudança: agora é matéria ao invés de aluno
      media: z.number(),
      totalNotas: z.number()
    })),
    frequenciaPorMateria: z.array(z.object({
      materia: z.string(),
      frequencia: z.number()
    }))
  })
});

export type TurmaDashboardData = z.infer<typeof TurmaDashboardSchema>;
