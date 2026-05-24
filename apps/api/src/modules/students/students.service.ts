import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const students = await this.prisma.student.findMany({
      select: {
        id: true,
        ra: true,
        user: {
          select: {
            name: true,
            keywords: {
              select: { keyword: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    return students.map((s) => ({
      id: s.id,
      name: s.user.name,
      ra: s.ra,
      avatar: null,
      keywords: s.user.keywords.map((uk) => uk.keyword),
    }));
  }

  async findMe(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        ra: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            keywords: {
              select: { keyword: { select: { id: true, name: true } } },
            },
          },
        },
        requests: {
          select: {
            id: true,
            sendDate: true,
            responseDate: true,
            status: true,
            denialJustification: true,
            teacher: {
              select: {
                id: true,
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          orderBy: { sendDate: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(
        'Aluno não encontrado para o usuário autenticado.',
      );
    }

    return {
      id: student.id,
      ra: student.ra,
      avatar: null,
      user: student.user,
      keywords: student.user.keywords.map((uk) => uk.keyword),
      requests: student.requests,
    };
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        ra: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            keywords: {
              select: { keyword: { select: { id: true, name: true } } },
            },
          },
        },
        requests: {
          select: {
            id: true,
            sendDate: true,
            responseDate: true,
            status: true,
            teacher: {
              select: {
                id: true,
                user: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { sendDate: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Aluno ${id} não encontrado.`);
    }

    return {
      id: student.id,
      ra: student.ra,
      avatar: null,
      user: student.user,
      keywords: student.user.keywords.map((uk) => uk.keyword),
      requests: student.requests,
    };
  }
}