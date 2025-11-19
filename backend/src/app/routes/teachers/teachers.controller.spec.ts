import { Test, TestingModule } from '@nestjs/testing';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { NotFoundException } from '@nestjs/common';

describe('TeachersController', () => {
  let controller: TeachersController;
  let service: TeachersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        {
          provide: TeachersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TeachersController>(TeachersController);
    service = module.get<TeachersService>(TeachersService);
  });

  it('should return all teachers', async () => {
    const mock = [
      { id: 1, name: 'A', email: 'a@test.com' },
      { id: 2, name: 'B', email: 'b@test.com' },
    ];

    (service.findAll as jest.Mock).mockResolvedValue(mock);

    const result = await controller.findAll();
    expect(result).toEqual(mock);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one teacher', async () => {
    const mock = { id: 1, name: 'A', email: 'a@test.com' };

    (service.findOne as jest.Mock).mockResolvedValue(mock);

    const result = await controller.findOne('1');
    expect(result).toEqual(mock);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundException when teacher is not found', async () => {
    (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());

    await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
  });
});
