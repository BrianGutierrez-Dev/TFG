import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';

export async function getAll(clientId?: number) {
  return prisma.car.findMany({
    where: clientId ? { clientId } : undefined,
    include: { client: { select: { id: true, name: true, dni: true } } },
    orderBy: { brand: 'asc' },
  });
}

export async function getById(id: number) {
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, dni: true } },
      contracts: { include: { carReturn: true }, orderBy: { createdAt: 'desc' } },
      maintenances: { orderBy: { date: 'desc' } },
      repairs: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!car) throw new AppError(404, 'Vehículo no encontrado');
  return car;
}

export async function create(data: {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  clientId: number;
}) {
  const exists = await prisma.car.findUnique({ where: { licensePlate: data.licensePlate } });
  if (exists) throw new AppError(409, 'Ya existe un vehículo con esa matrícula');

  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) throw new AppError(404, 'Cliente no encontrado');

  return prisma.car.create({ data });
}

export async function update(
  id: number,
  data: Partial<{
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    color: string | null;
    clientId: number;
  }>
) {
  const current = await getById(id);

  if (data.licensePlate && data.licensePlate !== current.licensePlate) {
    const exists = await prisma.car.findUnique({ where: { licensePlate: data.licensePlate } });
    if (exists) throw new AppError(409, 'Ya existe un vehículo con esa matrícula');
  }

  if (data.clientId !== undefined) {
    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) throw new AppError(404, 'Cliente no encontrado');
  }

  return prisma.car.update({ where: { id }, data });
}

export async function remove(id: number) {
  await getById(id);
  const related = await prisma.car.findUnique({
    where: { id },
    select: {
      _count: {
        select: {
          contracts: true,
          maintenances: true,
          repairs: true,
        },
      },
    },
  });

  const hasHistory = !!related && (
    related._count.contracts > 0
    || related._count.maintenances > 0
    || related._count.repairs > 0
  );

  if (hasHistory) {
    throw new AppError(
      409,
      'No se puede eliminar el vehículo porque tiene contratos, mantenimientos o reparaciones asociados'
    );
  }

  await prisma.car.delete({ where: { id } });
}
