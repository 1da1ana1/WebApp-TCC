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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('COORDINATOR')
    @Get('user/:userId')
    @ApiOperation({ summary: 'Listar solicitações de um usuário (coordenador)' })
    @ApiParam({ name: 'userId', type: Number })
    @ApiResponse({ status: 200, description: 'Solicitações retornadas com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso restrito a COORDINATOR' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
    async getRequestsByUser(@Param('userId', ParseIntPipe) userId: number) {
        return this.requestsService.getRequestsByUserId(userId);
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