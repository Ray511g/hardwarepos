import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// PostgreSQL Serverless Connection Pool Management
const realDbUrl = process.env.DATABASE_URL;
const dbUrl = realDbUrl || "postgresql://postgres:dummy@localhost:5432/dummy?schema=public";

export const dbConnected = !!realDbUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
       db: {
          url: dbUrl
       }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
