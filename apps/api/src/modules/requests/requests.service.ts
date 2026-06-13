import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RequestsService {
    constructor(
        private prisma: PrismaService,
        private notifications: NotificationsService,
    ) { }

    async createRequest(userId: number, teacherId: number) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
            include: { user: true },
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

        const created = await this.prisma.request.create({
            data: {
                studentId: student.id,
                teacherId,
                status: 'PENDING',
            },
        });

        // Notifica o docente sobre a nova solicitação (best-effort).
        await this.notifications.notify({
            userId: teacher.userId,
            type: 'NEW_REQUEST',
            title: 'Nova solicitação de orientação',
            body: `${student.user?.name ?? 'Um aluno'} solicitou você como orientador.`,
            link: '/perfil/docente',
        });

        return created;
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

    async getRequestsByUserId(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true, teacher: true },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        // O usuário pode aparecer como ALUNO (studentId) ou PROFESSOR (teacherId).
        const orConditions: { studentId?: number; teacherId?: number }[] = [];
        if (user.student) orConditions.push({ studentId: user.student.id });
        if (user.teacher) orConditions.push({ teacherId: user.teacher.id });

        // Nem aluno nem docente — não há solicitações vinculáveis.
        if (orConditions.length === 0) {
            return [];
        }

        // Reusa os mesmos includes do GET /requests padrão (ambos os lados).
        return this.prisma.request.findMany({
            where: { OR: orConditions },
            include: {
                student: { include: { user: true } },
                teacher: { include: { user: true } },
            },
            orderBy: { sendDate: 'desc' },
        });
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
            // Carimba o semestre ativo (se houver) para que a orientação possa
            // ser filtrada por semestre nas estatísticas do docente.
            const activeSemester = await this.prisma.semester.findFirst({
                where: { isActive: true },
            });

            await this.prisma.orientation.create({
                data: {
                    status: 'ACTIVE',
                    startDate: new Date(),
                    supervisorId: teacherUser.teacher.id,
                    semesterId: activeSemester?.id ?? undefined,
                    students: {
                        connect: { id: request.studentId },
                    },
                },
            });
        }

        // Notifica o aluno sobre a resposta (best-effort).
        const student = await this.prisma.student.findUnique({
            where: { id: request.studentId },
        });
        if (student) {
            await this.notifications.notify({
                userId: student.userId,
                type: 'REQUEST_RESPONSE',
                title: status === 'ACCEPTED' ? 'Solicitação aceita' : 'Solicitação recusada',
                body: `${teacherUser.name} ${status === 'ACCEPTED' ? 'aceitou' : 'recusou'} sua solicitação de orientação.`,
                link: '/perfil/aluno',
            });
        }

        return updatedRequest;
    }
}