import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            keywords: {
              include: {
                keyword: true,
              },
            },
          },
        },
        vacancies: true,
      },
    });
  }

  async findOne(id: string) {
    const teacherId = Number(id);

    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            keywords: {
              include: {
                keyword: true,
              },
            },
          },
        },
        vacancies: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }
}
