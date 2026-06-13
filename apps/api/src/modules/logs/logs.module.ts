import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { LogsInterceptor } from './logs.interceptor';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [
    // O interceptor decodifica o Bearer manualmente (GET /teachers é público),
    // por isso precisa do JwtService com o mesmo segredo do AuthModule.
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [LogsController],
  providers: [
    LogsService,
    PrismaService,
    // Registro global do interceptor de auditoria (captura ações principais).
    { provide: APP_INTERCEPTOR, useClass: LogsInterceptor },
  ],
})
export class LogsModule {}
