// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'], // Reduzir logs para melhor performance
    transactionOptions: {
      timeout: 60000, // 60 segundos para transações
      maxWait: 60000, // 60 segundos de espera máxima
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
// src/lib/prisma.ts