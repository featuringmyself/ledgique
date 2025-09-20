import { PrismaClient } from '@prisma/client'

// Prisma configuration
export const prismaConfig = {
  // Database connection settings
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL 
  },
  
  // Generator settings
  generator: {
    provider: 'prisma-client-js',
    output: './generated/prisma-client'
  },
  
  // Prisma Client options
  client: {
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'],
    errorFormat: 'pretty'
  },
  
  // Connection pool settings
  connection: {
    connectionLimit: 10,
    poolTimeout: 20000,
    acquireTimeout: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 60000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  }
}

// Create Prisma Client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: prismaConfig.client.log,
  errorFormat: prismaConfig.client.errorFormat
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma