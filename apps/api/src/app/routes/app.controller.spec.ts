import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { TeachersService } from '../services/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [TeachersService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "API is running!"', () => {
      expect(appController.getHello()).toBe('API is running!');
    });
  });
});
