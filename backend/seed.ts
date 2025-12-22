import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
        data: {
            name: 'Test Student',
            email: 'student@example.com',
            password: hashedPassword,
            typeUser: 'student',
        },
    });

    const student = await prisma.student.create({
        data: {
            userId: user.id,
            ra: '123456',
        },
    });

    const teacherUser = await prisma.user.create({
        data: {
            name: 'Teacher User',
            email: 'teacher@example.com',
            password: hashedPassword,
            typeUser: 'teacher',
        },
    });

    const teacher = await prisma.teacher.create({
        data: {
            userId: teacherUser.id,
        },
    });

    console.log('Created student:', student);
    console.log('Created teacher:', teacher);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });