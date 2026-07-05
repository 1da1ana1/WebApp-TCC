import { BadRequestException, Injectable } from '@nestjs/common';
import { WhitelistRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

/** Registro válido pronto para persistir. */
export interface WhitelistRecord {
  email: string;
  role: WhitelistRole;
}

/** Linha rejeitada na validação, com o motivo — usada no feedback ao usuário. */
export interface WhitelistRejection {
  line: number; // número da linha no arquivo original (1-based, conta o header)
  raw: string;
  reason: string;
}

export interface UploadWhitelistResult {
  success: boolean;
  importedCount: number;
  message: string;
  // Extras úteis para o toast do front detalhar o que aconteceu.
  skippedCount: number; // linhas inválidas ignoradas
  totalRows: number; // linhas de dados encontradas (sem header)
  rejections: WhitelistRejection[];
}

// Regex de e-mail deliberadamente simples e pragmática: cobre o formato
// local@dominio.tld sem espaços. Não tentamos validar RFC 5322 completa —
// e-mails institucionais da Unicamp são bem-comportados.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class WhitelistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fluxo completo do RF018: recebe o conteúdo bruto do CSV, faz o parse,
   * valida cada linha e persiste os registros válidos ignorando duplicatas.
   *
   * @param rawCsv  Conteúdo textual do CSV (já decodificado de base64/arquivo).
   */
  async importFromCsv(rawCsv: string): Promise<UploadWhitelistResult> {
    const { records, rejections, totalRows } = this.parseCsv(rawCsv);

    // Nenhuma linha válida → o arquivo é inútil. Falha explícita (400) para
    // o front mostrar "houve falha no arquivo" em vez de "0 importados".
    if (records.length === 0) {
      throw new BadRequestException(
        totalRows === 0
          ? 'O arquivo CSV está vazio ou não contém linhas de dados.'
          : 'Nenhuma linha válida encontrada. Verifique o formato: cada linha deve ser "email,role" com role igual a Student ou Teacher.',
      );
    }

    // Dedup DENTRO do próprio arquivo: `createMany` do Postgres estoura se o
    // mesmo email vier repetido no payload, mesmo com skipDuplicates (que só
    // cobre conflito com linhas já existentes no banco). Mantemos a 1ª
    // ocorrência de cada email.
    const seen = new Set<string>();
    const deduped = records.filter((r) => {
      if (seen.has(r.email)) return false;
      seen.add(r.email);
      return true;
    });

    const { count } = await this.prisma.whitelist.createMany({
      data: deduped,
      skipDuplicates: true, // ignora silenciosamente e-mails já cadastrados
    });

    const message = this.buildMessage(count, deduped.length, rejections.length);

    return {
      success: true,
      importedCount: count,
      skippedCount: rejections.length,
      totalRows,
      rejections,
      message,
    };
  }

  /**
   * Parser de CSV mínimo e sem dependências. Regras:
   *  - Separador: vírgula (`,`) ou ponto-e-vírgula (`;`) — detecta por linha.
   *  - Header opcional: se a 1ª linha contém "email", é tratada como cabeçalho
   *    e as colunas `email`/`role` são localizadas pelo nome. Sem header,
   *    assume a ordem `email,role`.
   *  - Ignora linhas em branco.
   */
  parseCsv(rawCsv: string): {
    records: WhitelistRecord[];
    rejections: WhitelistRejection[];
    totalRows: number;
  } {
    const records: WhitelistRecord[] = [];
    const rejections: WhitelistRejection[] = [];

    const lines = (rawCsv ?? '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .map((l, idx) => ({ text: l, lineNumber: idx + 1 }))
      .filter((l) => l.text.length > 0);

    if (lines.length === 0) {
      return { records, rejections, totalRows: 0 };
    }

    // Detecta e localiza as colunas a partir de um header opcional.
    let emailIdx = 0;
    let roleIdx = 1;
    let dataLines = lines;

    const firstCells = this.splitRow(lines[0].text);
    const looksLikeHeader = firstCells.some((c) =>
      /^"?email"?$/i.test(c.trim()),
    );
    if (looksLikeHeader) {
      const header = firstCells.map((c) => c.trim().replace(/^"|"$/g, '').toLowerCase());
      const foundEmail = header.indexOf('email');
      const foundRole = header.indexOf('role');
      emailIdx = foundEmail >= 0 ? foundEmail : 0;
      roleIdx = foundRole >= 0 ? foundRole : 1;
      dataLines = lines.slice(1);
    }

    for (const { text, lineNumber } of dataLines) {
      const cells = this.splitRow(text).map((c) =>
        c.trim().replace(/^"|"$/g, ''),
      );
      const email = (cells[emailIdx] ?? '').trim().toLowerCase();
      const roleRaw = (cells[roleIdx] ?? '').trim();

      if (!EMAIL_REGEX.test(email)) {
        rejections.push({
          line: lineNumber,
          raw: text,
          reason: `E-mail inválido: "${cells[emailIdx] ?? ''}".`,
        });
        continue;
      }

      const role = this.mapRole(roleRaw);
      if (role === null) {
        rejections.push({
          line: lineNumber,
          raw: text,
          reason: `Role inválida: "${roleRaw}". Use exatamente "Student" ou "Teacher".`,
        });
        continue;
      }

      records.push({ email, role });
    }

    return { records, rejections, totalRows: dataLines.length };
  }

  /**
   * Mapeia a string do CSV ('Student'/'Teacher', case-insensitive) para o
   * enum do Prisma. Retorna `null` quando não reconhece — o chamador trata
   * como linha inválida.
   */
  private mapRole(value: string): WhitelistRole | null {
    switch (value.trim().toLowerCase()) {
      case 'student':
        return WhitelistRole.STUDENT;
      case 'teacher':
        return WhitelistRole.TEACHER;
      default:
        return null;
    }
  }

  /** Split de uma linha por `,` ou `;` (o que aparecer primeiro). */
  private splitRow(line: string): string[] {
    const separator = line.includes(';') && !line.includes(',') ? ';' : ',';
    return line.split(separator);
  }

  private buildMessage(
    imported: number,
    validCount: number,
    invalidCount: number,
  ): string {
    const skippedDuplicates = validCount - imported;
    const parts = [`${imported} usuário(s) importado(s) com sucesso.`];
    if (skippedDuplicates > 0) {
      parts.push(`${skippedDuplicates} já existia(m) e foi(ram) ignorado(s).`);
    }
    if (invalidCount > 0) {
      parts.push(`${invalidCount} linha(s) inválida(s) descartada(s).`);
    }
    return parts.join(' ');
  }
}
