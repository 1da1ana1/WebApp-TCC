import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeachersModule } from './modules/teachers/teachers.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RequestsModule } from './modules/requests/requests.module';
import { StudentsModule } from './modules/students/students.module';
import { KeywordsModule } from './modules/keywords/keywords.module';
import { OrientationsModule } from './modules/orientations/orientations.module';
import { VacanciesModule } from './modules/vacancies/vacancies.module';
import { SemestersModule } from './modules/semesters/semesters.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LogsModule } from './modules/logs/logs.module';
import { ContestationsModule } from './modules/contestations/contestations.module';

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
    ContestationsModule,
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
