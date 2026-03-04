import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
    constructor(private prisma: PrismaService) { }

    async create(createRequestDto: CreateRequestDto) {
        return this.prisma.request.create({
            data: {
                studentId: createRequestDto.studentId,
                teacherId: createRequestDto.teacherId,
                status: 'pending', 
            },
        });
    }
}