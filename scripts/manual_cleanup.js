const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up integrity test data...');

    // Delete students with firstName 'Integrity' or 'Integrity-Updated'
    const delStudents = await prisma.student.deleteMany({
        where: {
            OR: [
                { firstName: { contains: 'Integrity' } },
                { lastName: { contains: 'Test' } }
            ]
        }
    });
    console.log(`Deleted ${delStudents.count} students.`);

    // Delete teachers with firstName 'Teacher' and lastName 'Integrity'
    const delTeachers = await prisma.teacher.deleteMany({
        where: {
            firstName: 'Teacher',
            lastName: 'Integrity'
        }
    });
    console.log(`Deleted ${delTeachers.count} teachers.`);

    // Delete test users
    const delUsers = await prisma.user.deleteMany({
        where: {
            OR: [
                { username: { contains: 'limited' } },
                { email: { contains: 'limited' } }
            ]
        }
    });
    console.log(`Deleted ${delUsers.count} test users.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
