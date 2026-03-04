import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestResponseDto } from './dto/update-request-response.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createRequest(@Request() req: { user: { sub: number } }, @Body() createRequestDto: CreateRequestDto) {
        const userIdLogado = req.user.sub;
        return this.requestsService.createRequest(userIdLogado, createRequestDto.teacherId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserRequests(@Request() req: { user: { sub: number } }) {
        const userIdLogado = req.user.sub;
        return this.requestsService.getUserRequests(userIdLogado);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/respond')
    async respondRequest(
        @Request() req: { user: { sub: number } },
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateRequestResponseDto,
    ) {
        const userIdLogado = req.user.sub;
        return this.requestsService.respondRequest(
            userIdLogado,
            id,
            updateDto.status,
            updateDto.denialJustification,
        );
    }
}