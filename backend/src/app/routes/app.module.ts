import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TeachersService } from '../services/app.service';
import { TeachersModule } from './teachers/teachers.module';

@Module({
  imports: [TeachersModule],
  controllers: [AppController],
  providers: [TeachersService],
})
export class AppModule { }
