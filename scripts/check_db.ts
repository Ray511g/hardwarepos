import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const students = await prisma.student.findMany();
    console.log('Students:', JSON.stringify(students, null, 2));
}

main().finally(() => prisma.$disconnect());
