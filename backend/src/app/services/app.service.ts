import { Injectable } from '@nestjs/common';

@Injectable()
export class TeachersService {
  private mockTeachers = [
    { id: 1, name: "Mock Silva", email: "silva@teste.com" },
    { id: 2, name: "Mock Souza", email: "souza@teste.com" },
    { id: 3, name: "Mock Pereira", email: "pereira@teste.com" },
  ];

  findAll() {
    return this.mockTeachers;
  }

  findOne(id: string) {
    return this.mockTeachers.find(t => t.id === Number(id));
  }
}
