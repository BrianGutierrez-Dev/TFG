import 'dotenv/config';
import app from './app';
import { ENV } from './config/env';
import prisma from './prisma/client';

async function main() {
  await prisma.$connect();
  console.log('Conectado a la base de datos');

  app.listen(ENV.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${ENV.PORT}`);
  });
}

main().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
