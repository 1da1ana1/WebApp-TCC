import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * Payload extraído do retorno de sucesso do SSO/CAS (RF019).
 *
 * Numa integração real com a Senha Única, estes campos viriam da validação
 * do ticket CAS no backend. Aqui eles chegam como query params do callback —
 * o e-mail é o que importa para casar com a `Whitelist`.
 */
export class SsoCallbackDto {
  @ApiProperty({ example: 'aluno@ft.unicamp.br', description: 'E-mail autenticado pelo SSO' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Maria Aluna', description: 'Nome retornado pelo SSO' })
  @IsOptional()
  @IsString()
  name?: string;
}
