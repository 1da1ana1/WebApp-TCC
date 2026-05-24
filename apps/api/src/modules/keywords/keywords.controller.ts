import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { KeywordsService } from './keywords.service';
import { UpdateUserKeywordsDto } from './dto/update-user-keywords.dto';

@ApiTags('Keywords')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('keywords')
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas as keywords (ordem alfabética)',
    description:
      'Vocabulário controlado: criação só via seed de banco, não há POST público.',
  })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAll() {
    return this.keywordsService.findAll();
  }

  @Put('me')
  @ApiOperation({
    summary: 'Substituir as keywords do usuário autenticado (máximo 5)',
  })
  @ApiBody({ type: UpdateUserKeywordsDto })
  @ApiResponse({ status: 200, description: 'Keywords vinculadas com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Mais de 5 IDs, ID duplicado ou ID inexistente',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  setMyKeywords(
    @Request() req: { user: { sub: number } },
    @Body() dto: UpdateUserKeywordsDto,
  ) {
    return this.keywordsService.setUserKeywords(req.user.sub, dto.keywordIds);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar keywords vinculadas a um usuário' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Keywords retornadas com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.keywordsService.findByUserId(userId);
  }
}