import { Controller, Get } from '@nestjs/common';
import { TeachersService } from '../services/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: TeachersService) { }

}
