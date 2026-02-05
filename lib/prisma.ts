import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pool?: Pool
}

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL missing')

const pool = globalForPrisma.pool ?? new Pool({ connectionString: url })
if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
export { prisma }