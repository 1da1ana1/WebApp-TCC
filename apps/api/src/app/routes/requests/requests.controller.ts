import { Controller, Post, Body } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @Post()
    create(@Body() createRequestDto: CreateRequestDto) {
        return this.requestsService.create(createRequestDto);
    }
}