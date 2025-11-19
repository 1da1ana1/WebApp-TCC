import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class TeachersService {
  async findAll() {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true, 
      },
    });

    return teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.user.name,
      email: teacher.user.email,
      lattesLink: teacher.lattesLink,
      isCoordinator: teacher.isCoordinator,
    }));
  }
}
