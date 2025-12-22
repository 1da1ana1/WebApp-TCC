import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TeachersService } from '../services/app.service';
import { TeachersModule } from './teachers/teachers.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TeachersModule, PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [TeachersService],
})
export class AppModule { }
