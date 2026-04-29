import 'dotenv/config';
import app from './app';
import { ENV } from './config/env';
import prisma from './prisma/client';
import { markOverdue } from './services/rental.service';

async function main() {
  await prisma.$connect();
  console.log('Conectado a la base de datos');
  const overdue = await markOverdue();
  if (overdue.updated > 0) {
    console.log(`Contratos marcados como vencidos al iniciar: ${overdue.updated}`);
  }

  app.listen(ENV.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${ENV.PORT}`);
  });
}

main().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
