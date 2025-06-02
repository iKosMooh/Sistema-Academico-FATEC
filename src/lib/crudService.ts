import { prisma } from '@/lib/prisma';

type Operation = 'insert' | 'get' | 'update' | 'delete';

interface CrudParams<TData = unknown> {
  operation: Operation;
  table: string;
  primaryKey?: string;
  data?: TData;
  relations?: Record<string, boolean>;
}

export async function handleCrud<TData = unknown>({
  operation,
  table,
  primaryKey,
  data,
  relations,
}: CrudParams<TData>) {
  // Acesso dinâmico ao modelo Prisma:
  type PrismaDelegate = {
    create?: (args: unknown) => Promise<unknown>;
    findMany?: (args?: unknown) => Promise<unknown>;
    update?: (args: unknown) => Promise<unknown>;
    delete?: (args: unknown) => Promise<unknown>;
    [key: string]: ((args?: unknown) => Promise<unknown>) | undefined;
  };
  const model = ((prisma as unknown) as Record<string, PrismaDelegate>)[table];
  if (!model) throw new Error(`Modelo ${table} não encontrado no Prisma.`);

  switch (operation) {
    case 'insert':
      if (!model.create) throw new Error('Método create não disponível no modelo.');
      return await model.create({ data });
    case 'get':
      if (!model.findMany) throw new Error('Método findMany não disponível no modelo.');
      return await model.findMany({
        include: relations || undefined,
      });
    case 'update':
      if (!primaryKey) throw new Error('Chave primária é obrigatória para atualização.');
      if (!data) throw new Error('Dados são obrigatórios para atualização.');
      if (!model.update) throw new Error('Método update não disponível no modelo.');
      return await model.update({
        where: { [primaryKey]: (data as Record<string, unknown>)[primaryKey] },
        data,
      });
    case 'delete':
      if (!primaryKey) throw new Error('Chave primária é obrigatória para exclusão.');
      if (!data) throw new Error('Dados são obrigatórios para exclusão.');
      if (!model.delete) throw new Error('Método delete não disponível no modelo.');
      return await model.delete({
        where: { [primaryKey]: (data as Record<string, unknown>)[primaryKey] },
      });
    default:
      throw new Error(`Operação ${operation} não suportada.`);
  }
}
