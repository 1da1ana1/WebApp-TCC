import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TeachersService } from '../services/app.service';
import { TeachersModule } from './teachers/teachers.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { SolicitacoesModule } from './solicitacoes/solicitacoes.module';

@Module({
  imports: [TeachersModule, PrismaModule, AuthModule, SolicitacoesModule],
  controllers: [AppController],
  providers: [TeachersService],
})
export class AppModule { }
