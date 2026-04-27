import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Criar um Aluno
  const aluno = await prisma.user.upsert({
    where: { email: 'aluno@unicamp.br' },
    update: {},
    create: {
      name: 'João Aluno',
      email: 'aluno@unicamp.br',
      password: passwordHash,
      typeUser: 'STUDENT',
      student: {
        create: { ra: '111111' }
      }
    },
  });

  // 2. Criar um Professor
  const professor = await prisma.user.upsert({
    where: { email: 'professor@unicamp.br' },
    update: {},
    create: {
      name: 'Carlos Docente',
      email: 'professor@unicamp.br',
      password: passwordHash,
      typeUser: 'TEACHER',
      teacher: {
        create: { lattesLink: 'http://lattes...123' }
      }
    },
  });

  // 3. Criar um Coordenador (Que também é professor na regra de negócio)
  const coordenador = await prisma.user.upsert({
    where: { email: 'coord@unicamp.br' },
    update: {},
    create: {
      name: 'Maria Coordenadora',
      email: 'coord@unicamp.br',
      password: passwordHash,
      typeUser: 'COORDINATOR',
      teacher: {
        create: {
          isCoordinator: true,
          coordinator: { create: {} }
        }
      }
    },
  });

  console.log('✅ Usuários de teste criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });