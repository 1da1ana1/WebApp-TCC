import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService, SEARCH_KEYWORD_PREFIX } from './logs.service';

/**
 * Interceptor global que captura "ações principais" automaticamente.
 *
 * Hoje registra apenas BUSCAS POR KEYWORD (GET /teachers?keywords=...) para
 * alimentar o "top keywords" do RF016. Como GET /teachers é público (sem
 * JwtAuthGuard), o passport não popula req.user — então decodificamos o
 * Bearer aqui para atribuir a busca ao usuário, quando autenticado.
 *
 * Princípios: roda só no sucesso (tap), é fire-and-forget e NUNCA quebra a
 * request — qualquer erro de logging é engolido. Começa simples e pode
 * evoluir para mapear outras ações (criar solicitação, responder, etc.).
 */
@Injectable()
export class LogsInterceptor implements NestInterceptor {
  constructor(
    private readonly logsService: LogsService,
    private readonly jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        try {
          this.maybeLogKeywordSearch(req);
        } catch {
          // Logging nunca deve afetar a resposta.
        }
      }),
    );
  }

  private maybeLogKeywordSearch(req: {
    method: string;
    path?: string;
    url?: string;
    query?: Record<string, unknown>;
    headers?: Record<string, unknown>;
  }) {
    if (req.method !== 'GET') return;

    const path = req.path ?? req.url ?? '';
    if (!path.startsWith('/teachers')) return;

    const keywordsRaw = req.query?.keywords;
    if (!keywordsRaw) return;

    const userId = this.extractUserId(req.headers?.authorization as string);
    if (!userId) return; // buscas anônimas não são atribuíveis (FK em userId)

    String(keywordsRaw)
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
      .forEach((kw) => {
        // fire-and-forget: erro de persistência não propaga.
        void this.logsService
          .record(userId, `${SEARCH_KEYWORD_PREFIX}${kw}`)
          .catch(() => undefined);
      });
  }

  private extractUserId(authHeader?: string): number | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
      const token = authHeader.slice('Bearer '.length);
      const payload = this.jwtService.verify(token);
      return typeof payload?.sub === 'number' ? payload.sub : null;
    } catch {
      return null;
    }
  }
}
