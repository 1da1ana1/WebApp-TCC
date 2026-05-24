import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ListTeachersQueryDto } from './dto/list-teachers-query.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListTeachersQueryDto = {}) {
    const { name, keywords } = query;

    const userWhere: Prisma.UserWhereInput = {};

    if (name?.trim()) {
      userWhere.name = { contains: name.trim(), mode: 'insensitive' };
    }

    const keywordNames = keywords
      ?.split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywordNames?.length) {
      userWhere.keywords = {
        some: { keyword: { name: { in: keywordNames } } },
      };
    }

    const where: Prisma.TeacherWhereInput =
      Object.keys(userWhere).length > 0 ? { user: userWhere } : {};

    return this.prisma.teacher.findMany({
      where,
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
