import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { pageMeta, PaginationOptions } from '../utils/pagination';

export async function getAll(clientId?: number, pagination?: PaginationOptions) {
  const where = {
    isActive: true,
    ...(clientId ? { clientId } : {}),
    ...(pagination?.search ? {
      OR: [
        { licensePlate: { contains: pagination.search, mode: 'insensitive' as const } },
        { brand: { contains: pagination.search, mode: 'insensitive' as const } },
        { model: { contains: pagination.search, mode: 'insensitive' as const } },
        { color: { contains: pagination.search, mode: 'insensitive' as const } },
        { client: { name: { contains: pagination.search, mode: 'insensitive' as const } } },
      ],
    } : {}),
  };

  if (pagination?.page && pagination.limit) {
    const [items, total] = await prisma.$transaction([
      prisma.car.findMany({
        where,
        include: { client: { select: { id: true, name: true, dni: true } } },
        orderBy: { brand: 'asc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.car.count({ where }),
    ]);

    return { items, meta: pageMeta(total, pagination.page, pagination.limit) };
  }

  return prisma.car.findMany({
    where,
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
  if (!client.isActive) throw new AppError(400, 'No se puede asignar un vehículo a un cliente dado de baja');

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
    isActive: boolean;
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
    if (!client.isActive) throw new AppError(400, 'No se puede asignar un vehículo a un cliente dado de baja');
  }

  return prisma.car.update({ where: { id }, data });
}

export async function remove(id: number) {
  const car = await getById(id);
  if (!car.isActive) return;

  await prisma.car.update({
    where: { id },
    data: {
      isActive: false,
      deactivatedAt: new Date(),
    },
  });
}
