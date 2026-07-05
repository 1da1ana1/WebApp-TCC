import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { UploadWhitelistDto } from './dto/upload-whitelist.dto';
import { WhitelistService } from './whitelist.service';

// Tipagem mínima do arquivo do multer sem depender de @types/multer.
interface UploadedCsv {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
  size?: number;
}

@ApiTags('Whitelist')
@ApiBearerAuth()
@Controller('whitelist')
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  /**
   * RF018 — Upload da lista de acesso (whitelist) via CSV.
   *
   * Restrito a COORDINATOR (JwtAuthGuard + RolesGuard → 403 para os demais).
   * Aceita o CSV de duas formas:
   *   - `multipart/form-data` no campo `file` (upload de arquivo); ou
   *   - JSON `{ content: "<csv em texto puro ou base64>" }`.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COORDINATOR')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Importar lista de acesso via CSV (RF018)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo .csv (colunas: email,role)',
        },
        content: {
          type: 'string',
          description: 'Alternativa: CSV em texto puro ou base64',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Importação concluída (ver importedCount)' })
  @ApiResponse({ status: 400, description: 'Arquivo ausente ou inválido' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso restrito a COORDINATOR' })
  async upload(
    @UploadedFile() file: UploadedCsv | undefined,
    @Body() body: UploadWhitelistDto,
  ) {
    const rawCsv = this.resolveCsv(file, body);
    return this.whitelistService.importFromCsv(rawCsv);
  }

  /**
   * Extrai o texto do CSV a partir do arquivo multipart OU do campo `content`
   * (texto puro ou base64). Lança 400 quando nada utilizável foi enviado.
   */
  private resolveCsv(
    file: UploadedCsv | undefined,
    body: UploadWhitelistDto,
  ): string {
    if (file?.buffer && file.buffer.length > 0) {
      // Rejeita extensões óbvias que não sejam CSV (defensivo, não confiável).
      const name = (file.originalname ?? '').toLowerCase();
      if (name && !name.endsWith('.csv')) {
        throw new BadRequestException('Apenas arquivos .csv são aceitos.');
      }
      return file.buffer.toString('utf-8');
    }

    const content = body?.content?.trim();
    if (content) {
      return this.maybeDecodeBase64(content);
    }

    throw new BadRequestException(
      'Nenhum CSV recebido. Envie o arquivo no campo "file" (multipart) ou o conteúdo em "content".',
    );
  }

  /**
   * Heurística: se `content` não parece um CSV (não tem vírgula/`;`/quebra de
   * linha) mas casa com o alfabeto base64, decodifica. Suporta prefixo data URI.
   */
  private maybeDecodeBase64(content: string): string {
    const stripped = content.replace(/^data:[^;]*;base64,/, '');
    const looksLikeCsv = /[,;\n\r]/.test(content);
    const looksLikeBase64 =
      !looksLikeCsv && /^[A-Za-z0-9+/=\s]+$/.test(stripped) && stripped.length > 0;

    if (looksLikeBase64) {
      try {
        return Buffer.from(stripped, 'base64').toString('utf-8');
      } catch {
        // Cai para tratar como texto puro se a decodificação falhar.
      }
    }
    return content;
  }
}
