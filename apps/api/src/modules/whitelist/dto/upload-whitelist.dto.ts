import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Corpo aceito por `POST /whitelist/upload` quando o CSV NÃO vem como
 * arquivo multipart (`file`), mas sim embutido no JSON.
 *
 * `content` aceita duas formas, detectadas automaticamente pelo service:
 *   - CSV em texto puro ("email,role\naluno@x.com,Student");
 *   - CSV codificado em base64 (com ou sem prefixo data URI).
 *
 * O `ValidationPipe` global usa `whitelist: true`, então só o campo
 * declarado aqui sobrevive — daí a necessidade deste DTO explícito para
 * o caminho base64 funcionar.
 */
export class UploadWhitelistDto {
  @ApiPropertyOptional({
    description:
      'CSV em texto puro OU codificado em base64 (alternativa ao upload multipart do campo `file`).',
    example: 'email,role\naluno@ft.unicamp.br,Student\nprofa@ft.unicamp.br,Teacher',
  })
  @IsOptional()
  @IsString()
  content?: string;
}
