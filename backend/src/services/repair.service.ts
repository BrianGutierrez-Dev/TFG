import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { RepairStatus } from '@prisma/client';

const include = {
  car: { select: { id: true, licensePlate: true, brand: true, model: true } },
};

export async function getAll(filters?: { carId?: number; status?: RepairStatus }) {
  return prisma.repair.findMany({
    where: filters,
    include,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getById(id: number) {
  const repair = await prisma.repair.findUnique({ where: { id }, include });
  if (!repair) throw new AppError(404, 'Reparación no encontrada');
  return repair;
}

export async function create(data: {
  carId: number;
  description: string;
  cost: number;
  status?: RepairStatus;
  startDate?: string;
  endDate?: string;
}) {
  const car = await prisma.car.findUnique({ where: { id: data.carId } });
  if (!car) throw new AppError(404, 'Vehículo no encontrado');

  return prisma.repair.create({
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include,
  });
}

export async function update(
  id: number,
  data: Partial<{
    description: string;
    cost: number;
    status: RepairStatus;
    startDate: string;
    endDate: string;
  }>
) {
  await getById(id);
  const updateData: Record<string, unknown> = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  return prisma.repair.update({ where: { id }, data: updateData, include });
}

export async function remove(id: number) {
  await getById(id);
  await prisma.repair.delete({ where: { id } });
}
