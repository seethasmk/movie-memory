import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


// DB client for the app
const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL_POOLED! });
const globalForPrisma = globalThis as unknown as {prisma?: PrismaClient};
export const prisma = globalForPrisma.prisma ?? new PrismaClient({adapter});
if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;