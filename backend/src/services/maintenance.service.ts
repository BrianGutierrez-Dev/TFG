import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';

const include = {
  car: { select: { id: true, licensePlate: true, brand: true, model: true } },
};

export async function getAll(carId?: number) {
  return prisma.maintenance.findMany({
    where: carId ? { carId } : undefined,
    include,
    orderBy: { date: 'desc' },
  });
}

export async function getById(id: number) {
  const m = await prisma.maintenance.findUnique({ where: { id }, include });
  if (!m) throw new AppError(404, 'Mantenimiento no encontrado');
  return m;
}

export async function create(data: {
  carId: number;
  type: string;
  description?: string;
  cost?: number;
  date: string;
  nextDueDate?: string;
}) {
  const car = await prisma.car.findUnique({ where: { id: data.carId } });
  if (!car) throw new AppError(404, 'Vehículo no encontrado');

  return prisma.maintenance.create({
    data: {
      ...data,
      date: new Date(data.date),
      nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
    },
    include,
  });
}

export async function update(
  id: number,
  data: Partial<{
    type: string;
    description: string | null;
    cost: number | null;
    date: string;
    nextDueDate: string | null;
  }>
) {
  await getById(id);
  const updateData: Record<string, unknown> = { ...data };
  if (data.date) updateData.date = new Date(data.date);
  if (data.nextDueDate) updateData.nextDueDate = new Date(data.nextDueDate);
  if (data.nextDueDate === null) updateData.nextDueDate = null;
  return prisma.maintenance.update({ where: { id }, data: updateData, include });
}

export async function remove(id: number) {
  await getById(id);
  await prisma.maintenance.delete({ where: { id } });
}
