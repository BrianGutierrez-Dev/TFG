import bcrypt from 'bcryptjs';
import prisma from './client';

async function main() {
  const hashed = await bcrypt.hash('admin1234', 10);

  await prisma.employee.upsert({
    where: { email: 'admin@taller.com' },
    update: {},
    create: {
      email: 'admin@taller.com',
      password: hashed,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('Seed completado: empleado admin@taller.com creado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
