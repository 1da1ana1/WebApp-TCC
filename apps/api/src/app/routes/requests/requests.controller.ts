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
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('Requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Criar solicitação de orientação' })
    @ApiBody({ type: CreateRequestDto })
    @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso' })
    @ApiResponse({ status: 400, description: 'Erro de validação' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    async createRequest(@Request() req: { user: { sub: number } }, @Body() createRequestDto: CreateRequestDto) {
        const userIdLogado = req.user.sub;
        return this.requestsService.createRequest(userIdLogado, createRequestDto.teacherId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({ summary: 'Listar solicitações do usuário autenticado' })
    @ApiResponse({ status: 200, description: 'Solicitações retornadas com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    async getUserRequests(@Request() req: { user: { sub: number } }) {
        const userIdLogado = req.user.sub;
        return this.requestsService.getUserRequests(userIdLogado);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/respond')
    @ApiOperation({ summary: 'Responder solicitação (ACCEPTED/REJECTED)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateRequestResponseDto })
    @ApiResponse({ status: 200, description: 'Solicitação respondida com sucesso' })
    @ApiResponse({ status: 400, description: 'Erro de validação' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso negado' })
    @ApiResponse({ status: 404, description: 'Solicitação não encontrada' })
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