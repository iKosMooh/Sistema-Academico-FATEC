// lib/crudService.ts
import { prisma } from '@/lib/prisma';

/**
 * Função genérica para operações CRUD com Prisma.
 * Suporta inserção, consulta, atualização, exclusão e “pseudo-upsert” para presenças.
 */
export async function handleCrud({
  operation,
  table,
  primaryKey,
  data,
  relations,
}: {
  operation: string;
  table: string;
  primaryKey?: string | number;
  data?: Record<string, unknown>;
  relations?: Record<string, boolean>;
}) {
  // Acesso dinâmico ao modelo Prisma
  const model = prisma[table as keyof typeof prisma] as {
    create?: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    findMany?: (args?: { include?: Record<string, boolean>; where?: Record<string, unknown> }) => Promise<unknown>;
    findFirst?: (args?: { where?: Record<string, unknown> }) => Promise<Record<string, unknown> | null>;
    update?: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<unknown>;
    delete?: (args: { where: Record<string, unknown> }) => Promise<unknown>;
    upsert?: (args: { where: Record<string, unknown>; update: Record<string, unknown>; create: Record<string, unknown> }) => Promise<unknown>;
  };
  const modelName = table;

  if (!model || typeof model !== 'object') {
    throw new Error(`Modelo "${table}" não encontrado ou inválido no Prisma.`);
  }

  try {
    switch (operation) {
      case 'insert':
        if (typeof model.create !== 'function') {
          throw new Error('Método create não disponível no modelo.');
        }
        return await model.create({ data: data ?? {} });

      case 'get':
        if (typeof model.findMany !== 'function') {
          throw new Error('Método findMany não disponível no modelo.');
        }
        return await model.findMany({
          include: relations || undefined,
          where: data || undefined,
        });

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
        return await model.update({
          where: { [primaryKey as string]: data[primaryKey as string] },
          data,
        });

      case 'delete':
        // Suporte a chave composta em turmaAluno
        if (modelName === 'turmaAluno') {
          const { idTurma, idAluno } = data as { idTurma: number; idAluno: number };
          if (typeof model.delete !== 'function') {
            throw new Error('Método delete não disponível no modelo.');
          }
          return await model.delete({
            where: {
              idTurma_idAluno: { idTurma, idAluno },
            },
          });
        }
        // Exclusão genérica
        if (!primaryKey) {
          throw new Error('Chave primária é obrigatória para exclusão.');
        }
        if (!data) {
          throw new Error('Dados são obrigatórios para exclusão.');
        }
        if (typeof model.delete !== 'function') {
          throw new Error('Método delete não disponível no modelo.');
        }
        return await model.delete({
          where: { [primaryKey as string]: data[primaryKey as string] },
        });

      case 'upsert':
        if (!data) {
          throw new Error('Dados são obrigatórios para upsert.');
        }
        if (modelName === 'presencas') {
          // Garante que idProfessor está presente, senão lança erro detalhado
          const { idAula, idAluno, idProfessor, ...rest } = data as {
            idAula: number;
            idAluno: number;
            idProfessor?: string;
            [key: string]: unknown;
          };

          if (!idProfessor) {
            throw new Error('O campo idProfessor é obrigatório para registrar presença. Certifique-se de que o usuário logado está sendo enviado corretamente.');
          }

          if (typeof model.findFirst !== 'function') {
            throw new Error('Método findFirst não disponível no modelo Presencas.');
          }
          const existing = await model.findFirst({
            where: { idAula: Number(idAula), idAluno: Number(idAluno) },
          });

          if (existing && (existing as Record<string, unknown>).idPresenca) {
            const pkName = 'idPresenca';
            if (typeof model.update !== 'function') {
              throw new Error('Método update não disponível no modelo Presencas.');
            }
            return await model.update({
              where: { [pkName]: (existing as Record<string, unknown>)[pkName] },
              data: {
                idAula: Number(idAula),
                idAluno: Number(idAluno),
                idProfessor: String(idProfessor),
                ...rest,
              },
            });
          } else {
            if (typeof model.create !== 'function') {
              throw new Error('Método create não disponível no modelo Presencas.');
            }
            try {
              // Loga os dados que serão enviados ao Prisma para depuração
              console.log("Dados enviados ao Prisma (Presencas.create):", JSON.stringify({
                idAula: Number(idAula),
                idAluno: Number(idAluno),
                idProfessor: String(idProfessor),
                ...rest,
              }));

              // Checagem explícita dos ids referenciados antes de criar
              const [aula, aluno, professor] = await Promise.all([
                prisma.aula.findUnique?.({ where: { idAula: Number(idAula) } }),
                prisma.alunos.findUnique?.({ where: { idAluno: Number(idAluno) } }),
                prisma.professores.findUnique?.({ where: { idProfessor: String(idProfessor) } }),
              ]);
              console.log("Depuração FK Presencas:");
              console.log("Aula encontrada?", !!aula, aula);
              console.log("Aluno encontrado?", !!aluno, aluno);
              console.log("Professor encontrado?", !!professor, professor);

              if (!aula) {
                throw new Error(`Aula não encontrada para idAula=${idAula}.`);
              }
              if (!aluno) {
                throw new Error(`Aluno não encontrado para idAluno=${idAluno}.`);
              }
              if (!professor) {
                throw new Error(`Professor não encontrado para idProfessor=${idProfessor}.`);
              }

              return await model.create({
                data: {
                  idAula: Number(idAula),
                  idAluno: Number(idAluno),
                  idProfessor: String(idProfessor),
                  ...rest,
                },
              });
            } catch (err: unknown) {
              // Prisma erro de constraint
              if (
                typeof err === 'object' &&
                err !== null &&
                'code' in err &&
                (err as { code?: string }).code === 'P2003' &&
                'meta' in err &&
                (err as { meta?: { field_name?: string } }).meta &&
                (err as { meta: { field_name?: string } }).meta.field_name
              ) {
                const field = (err as { meta: { field_name: string } }).meta.field_name;
                console.error("Erro de constraint Prisma:", err);
                throw new Error(
                  `Violação de chave estrangeira em Presencas: campo "${field}". Verifique se o id existe na tabela referenciada.`
                );
              }
              // Loga o erro completo para depuração
              console.error("Erro Prisma Presencas.create:", err);
              throw err;
            }
          }
        }
        // Para outros modelos, faz upsert direto usando primaryKey
        if (!primaryKey) {
          throw new Error('Chave primária é obrigatória para upsert (modelos gerais).');
        }
        if (typeof model.upsert !== 'function') {
          throw new Error('Método upsert não disponível no modelo.');
        }
        return await model.upsert({
          where: { [primaryKey as string]: (data as Record<string, unknown>)[primaryKey as string] },
          update: data,
          create: data,
        });

      default:
        throw new Error(`Operação "${operation}" não suportada.`);
    }
  } catch (error: unknown) {
    // Depuração detalhada de erros Prisma
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2003' &&
      'meta' in error &&
      (error as { meta?: { field_name?: string } }).meta &&
      (error as { meta: { field_name?: string } }).meta.field_name
    ) {
      const fieldName = (error as { meta: { field_name: string } }).meta.field_name;
      console.error(`Erro de chave estrangeira: campo "${fieldName}" não encontrado na tabela referenciada.`);
    }
    throw error;
  }
}
