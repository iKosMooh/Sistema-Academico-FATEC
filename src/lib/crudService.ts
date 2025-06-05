// lib/crudService.ts
import { prisma } from '@/lib/prisma';
import { PrismaClient, Prisma } from '@prisma/client';

type ModelName = keyof typeof prisma;

// Interface genérica para parâmetros das operações Prisma
interface PrismaArgs {
  where?: Record<string, unknown>;
  data?: Record<string, unknown>;
  include?: Record<string, boolean | object>;
}

// Interface para os métodos comuns do Prisma com tipos seguros
interface PrismaModelMethods {
  findMany: (args?: PrismaArgs) => Promise<unknown[]>;
  update: (args: Required<Pick<PrismaArgs, 'where' | 'data'>>) => Promise<unknown>;
  delete: (args: Required<Pick<PrismaArgs, 'where'>>) => Promise<unknown>;
  upsert: (args: Required<Pick<PrismaArgs, 'where'>> & {
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<unknown>;
}

// Tipo que garante que o modelo tenha os métodos necessários
type PrismaDelegate<T extends ModelName> = PrismaClient[T] & PrismaModelMethods;

interface CrudParams {
  operation: 'get' | 'insert' | 'update' | 'delete' | 'upsert';
  table: ModelName;
  primaryKey?: string;
  data?: Record<string, unknown>;
  relations?: Record<string, boolean | object>;
  where?: Record<string, unknown>;
}

/**
 * Função genérica para operações CRUD com Prisma.
 * Suporta inserção, consulta, atualização, exclusão e “pseudo-upsert” para presenças.
 */
export async function handleCrud<T>({ operation, table, primaryKey, data, relations, where }: CrudParams): Promise<T> {
  const model = prisma[table] as PrismaDelegate<typeof table>;
  console.log('CRUD Operation:', { operation, table, data, where });
  
  if (!model) {
    throw new Error(`Modelo "${String(table)}" não encontrado.`);
  }

  try {
    switch (operation) {
      case 'get':
        if (table === 'presencas') {
          return await prisma.presencas.findMany({
            where: data as Prisma.PresencasWhereInput,
            include: {
              aluno: true,
              aula: true,
              professor: true,
              ...relations
            }
          }) as T;
        }

        if (table === 'cursoMaterias') {
          return await prisma.cursoMaterias.findMany({
            where: where as Prisma.CursoMateriasWhereInput,
            include: relations
          }) as T;
        }

        return await model.findMany({
          where: data || undefined,
          include: relations || undefined,
        }) as T;

      case 'upsert':
        if (table === 'presencas') {
          if (!data) throw new Error('Dados obrigatórios para presença');

          const { idAula, idAluno, idProfessor, presente } = data as {
            idAula: number;
            idAluno: number;
            idProfessor: string;
            presente: boolean;
          };

          return await prisma.presencas.upsert({
            where: {
              idPresenca: (data.idPresenca as number) || 0,
            },
            create: {
              idAula: Number(idAula),
              idAluno: Number(idAluno),
              idProfessor: String(idProfessor),
              presente: Boolean(presente),
              justificativa: (data.justificativa as string) || null
            },
            update: {
              presente: Boolean(presente),
              justificativa: (data.justificativa as string) || null
            }
          }) as T;
        }

        return await model.upsert({
          where: where || { id: 0 },
          update: data || {},
          create: data || {}
        }) as T;

      case 'update':
        if (!primaryKey) {
          throw new Error('Chave primária é obrigatória para atualização.');
        }
        if (!data) {
          throw new Error('Dados são obrigatórios para atualização.');
        }
        if (typeof model.update !== 'function') {
          throw new Error('Método update não disponível no modelo.');
        }
        return (await model.update({
          where: { [primaryKey as string]: data[primaryKey as string] },
          data,
        })) as T;

      case 'delete':
        // Suporte a chave composta em turmaAluno
        if (table === 'turmaAluno') {
          const { idTurma, idAluno } = data as { idTurma: number; idAluno: number };
          return await (model as PrismaDelegate<ModelName>).delete({
            where: {
              idTurma_idAluno: { idTurma, idAluno },
            },
          }) as T;
        }

        // Exclusão genérica
        if (!primaryKey || !data) {
          throw new Error('Chave primária e dados são obrigatórios para exclusão.');
        }

        return await (model as PrismaDelegate<ModelName>).delete({
          where: { [primaryKey]: data[primaryKey] },
        }) as T;

      default:
        throw new Error(`Operação "${operation}" não suportada.`);
    }
  } catch (error) {
    console.error('Erro no CRUD:', error);
    throw error;
  }
}
