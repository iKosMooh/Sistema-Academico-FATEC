import { z } from 'zod';

// Schema para Turma baseado no schema Prisma correto
export const TurmaSchema = z.object({
  idTurma: z.number().optional(),
  nomeTurma: z.string().min(1, 'Nome da turma é obrigatório').max(100, 'Nome muito longo'),
  anoLetivo: z.number().min(2020).max(2030),
  idCurso: z.number().min(1, 'Curso é obrigatório'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  curso: z.object({
    nomeCurso: z.string()
  }).optional()
});

// Schema para Curso
export const CursoSchema = z.object({
  idCurso: z.number(),
  nomeCurso: z.string().min(1, 'Nome do curso é obrigatório'),
  cargaHorariaTotal: z.number(),
  descricao: z.string().nullable().optional(),
  docsPath: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema para dados de formulário de turma
export const TurmaFormSchema = z.object({
  nomeTurma: z.string().min(1, 'Nome da turma é obrigatório'),
  anoLetivo: z.string().regex(/^\d{4}$/, 'Ano deve ter 4 dígitos'),
  idCurso: z.number().min(1, 'Curso é obrigatório'),
});

// Schema para resposta da API
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  details: z.array(z.string()).optional(),
});

// Tipos TypeScript derivados dos schemas
export type TurmaData = z.infer<typeof TurmaSchema>;
export type CursoData = z.infer<typeof CursoSchema>;
export type TurmaFormData = z.infer<typeof TurmaFormSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Mapeamento de nomes de tabela para o Prisma
export const TABLE_MAPPING = {
  // Nomes da API -> Nomes do Prisma
  'turma': 'turmas',
  'turmas': 'turmas',
  'Turma': 'turmas',
  'Turmas': 'turmas',
  'curso': 'curso',
  'cursos': 'curso',
  'Curso': 'curso',
  'Cursos': 'curso',
  'materia': 'materias',
  'materias': 'materias',
  'Materia': 'materias',
  'Materias': 'materias',
  'aluno': 'alunos',
  'alunos': 'alunos',
  'Aluno': 'alunos',
  'Alunos': 'alunos',
} as const;

export function getPrismaTableName(apiTableName: string): string {
  return TABLE_MAPPING[apiTableName as keyof typeof TABLE_MAPPING] || apiTableName;
}
