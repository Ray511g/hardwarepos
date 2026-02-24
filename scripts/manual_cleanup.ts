import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up integrity test data...');

    try {
        const delStudents = await prisma.student.deleteMany({
            where: {
                OR: [
                    { firstName: { contains: 'Integrity' } },
                    { lastName: { contains: 'Test' } }
                ]
            }
        });
        console.log(`Deleted ${delStudents.count} students.`);

        const delTeachers = await prisma.teacher.deleteMany({
            where: {
                firstName: 'Teacher',
                lastName: { contains: 'Integrity' }
            }
        });
        console.log(`Deleted ${delTeachers.count} teachers.`);

        const delUsers = await prisma.user.deleteMany({
            where: {
                OR: [
                    { username: { contains: 'limited' } },
                    { email: { contains: 'limited' } }
                ]
            }
        });
        console.log(`Deleted ${delUsers.count} test users.`);
    } catch (e) {
        console.error(e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
