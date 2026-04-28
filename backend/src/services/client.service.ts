import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';

export async function getAll(filters?: { isBlacklisted?: boolean }) {
  return prisma.client.findMany({
    where: filters,
    include: {
      _count: { select: { incidents: true, contracts: true, cars: true } },
      ...(filters?.isBlacklisted === true
        ? { incidents: { orderBy: { createdAt: 'desc' } } }
        : {}),
    },
    orderBy: { name: 'asc' },
  });
}

export async function getById(id: number) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      cars: true,
      contracts: {
        include: { car: true, carReturn: true },
        orderBy: { createdAt: 'desc' },
      },
      incidents: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!client) throw new AppError(404, 'Cliente no encontrado');
  return client;
}

export async function create(data: {
  name: string;
  email: string;
  phone: string;
  dni: string;
  address?: string;
  notes?: string;
}) {
  const exists = await prisma.client.findFirst({
    where: { OR: [{ email: data.email }, { dni: data.dni }] },
  });
  if (exists) throw new AppError(409, 'Ya existe un cliente con ese email o DNI');

  return prisma.client.create({ data });
}

export async function update(
  id: number,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    dni: string;
    address: string;
    notes: string;
    isBlacklisted: boolean;
    blacklistReason: string;
  }>
) {
  await getById(id);

  const updateData: Record<string, unknown> = { ...data };

  if (data.isBlacklisted === true) {
    if (!data.blacklistReason?.trim())
      throw new AppError(400, 'La razón de la lista negra es obligatoria');
    updateData.blacklistedAt = new Date();
  } else if (data.isBlacklisted === false) {
    updateData.blacklistReason = null;
    updateData.blacklistedAt = null;
  }

  return prisma.client.update({ where: { id }, data: updateData });
}

export async function remove(id: number) {
  await getById(id);
  await prisma.client.delete({ where: { id } });
}

export async function getClientHistory(id: number) {
  await getById(id);
  return prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dni: true,
      address: true,
      isBlacklisted: true,
      incidents: { orderBy: { createdAt: 'desc' } },
      contracts: {
        orderBy: { createdAt: 'desc' },
        include: { car: true, carReturn: true, incidents: true },
      },
    },
  });
}
