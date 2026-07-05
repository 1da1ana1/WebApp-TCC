import { ValidationPipe } from '@nestjs/common';

/**
 * Configuração ÚNICA do ValidationPipe, compartilhada entre o bootstrap
 * (`main.ts`) e os testes e2e. Centralizar evita o problema clássico de o
 * ambiente de teste validar/transformar diferente da produção.
 *
 * - `whitelist`: remove propriedades não declaradas nos DTOs (defesa contra
 *   over-posting).
 * - `transform`: instancia os DTOs e coage tipos primitivos (ex.: params/query
 *   numéricos), alinhando o comportamento ao que os testes já esperavam.
 */
export const buildValidationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    transform: true,
  });
