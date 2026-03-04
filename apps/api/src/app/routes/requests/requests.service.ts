import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class RequestsService {
    constructor(private prisma: PrismaService) { }

    async createRequest(userId: number, teacherId: number) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
        });

        if (!student) {
            throw new BadRequestException('Apenas alunos podem fazer solicitações.');
        }

        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
        });

        if (!teacher) {
            throw new NotFoundException('Professor não encontrado.');
        }

        const pendingRequest = await this.prisma.request.findFirst({
            where: {
                studentId: student.id,
                status: 'PENDING',
            },
        });

        if (pendingRequest) {
            throw new BadRequestException('Você já possui uma solicitação pendente com um professor.');
        }

        return this.prisma.request.create({
            data: {
                studentId: student.id,
                teacherId,
                status: 'PENDING',
            },
        });
    }

    async getUserRequests(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true, teacher: true },
        });

        if (!user) {
            return [];
        }

        if (user.typeUser === 'STUDENT' && user.student) {
            return this.prisma.request.findMany({
                where: { studentId: user.student.id },
                include: { teacher: { include: { user: true } } },
                orderBy: { sendDate: 'desc' },
            });
        }

        if ((user.typeUser === 'TEACHER' || user.typeUser === 'COORDINATOR') && user.teacher) {
            return this.prisma.request.findMany({
                where: { teacherId: user.teacher.id },
                include: { student: { include: { user: true } } },
                orderBy: { sendDate: 'desc' },
            });
        }

        return [];
    }

    async respondRequest(
        userId: number,
        requestId: number,
        status: string,
        denialJustification?: string,
    ) {
        const teacherUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { teacher: true },
        });

        if (!teacherUser || !teacherUser.teacher) {
            throw new ForbiddenException('Apenas professores podem responder a solicitações.');
        }

        const request = await this.prisma.request.findUnique({
            where: { id: requestId },
        });

        if (!request || request.teacherId !== teacherUser.teacher.id) {
            throw new NotFoundException('Solicitação não encontrada ou não pertence a você.');
        }

        if (request.status !== 'PENDING') {
            throw new BadRequestException('Esta solicitação já foi respondida.');
        }

        if (status === 'REJECTED' && !denialJustification) {
            throw new BadRequestException('Uma justificativa é obrigatória ao recusar uma solicitação.');
        }

        const updatedRequest = await this.prisma.request.update({
            where: { id: requestId },
            data: {
                status,
                denialJustification: status === 'REJECTED' ? denialJustification : null,
                responseDate: new Date(),
            },
        });

        if (status === 'ACCEPTED') {
            await this.prisma.orientation.create({
                data: {
                    status: 'ACTIVE',
                    startDate: new Date(),
                    supervisorId: teacherUser.teacher.id,
                    students: {
                        connect: { id: request.studentId },
                    },
                },
            });
        }

        return updatedRequest;
    }
}