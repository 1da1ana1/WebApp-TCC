import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from '../services/app.service';
import { TeachersModule } from './teachers/teachers.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { RequestsModule } from './requests/requests.module';
import { StudentsModule } from './students/students.module';
import { KeywordsModule } from './keywords/keywords.module';
import { OrientationsModule } from './orientations/orientations.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { SemestersModule } from './semesters/semesters.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TeachersModule,
    RequestsModule,
    StudentsModule,
    KeywordsModule,
    OrientationsModule,
    VacanciesModule,
    SemestersModule,
    NotificationsModule,
    ReportsModule,
    LogsModule,
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
