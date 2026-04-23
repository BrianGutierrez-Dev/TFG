import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { ContractStatus } from '@prisma/client';

const contractInclude = {
  client: { select: { id: true, name: true, dni: true, isBlacklisted: true } },
  car: { select: { id: true, licensePlate: true, brand: true, model: true, year: true } },
  carReturn: true,
  incidents: true,
};

export async function getAll(filters?: { status?: ContractStatus; clientId?: number; carId?: number }) {
  return prisma.rentalContract.findMany({
    where: filters,
    include: contractInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getById(id: number) {
  const contract = await prisma.rentalContract.findUnique({
    where: { id },
    include: contractInclude,
  });
  if (!contract) throw new AppError(404, 'Contrato no encontrado');
  return contract;
}

export async function create(data: {
  clientId: number;
  carId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  notes?: string;
}) {
  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) throw new AppError(404, 'Cliente no encontrado');
  if (client.isBlacklisted) throw new AppError(403, 'El cliente está en lista negra y no puede crear nuevos contratos');

  const car = await prisma.car.findUnique({ where: { id: data.carId } });
  if (!car) throw new AppError(404, 'Vehículo no encontrado');

  const overlap = await prisma.rentalContract.findFirst({
    where: {
      carId: data.carId,
      status: { in: ['ACTIVE', 'OVERDUE'] },
    },
  });
  if (overlap) throw new AppError(409, 'El vehículo ya tiene un contrato activo o vencido sin cerrar');

  return prisma.rentalContract.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
    include: contractInclude,
  });
}

export async function updateStatus(id: number, status: ContractStatus) {
  await getById(id);
  return prisma.rentalContract.update({
    where: { id },
    data: { status },
    include: contractInclude,
  });
}

export async function update(
  id: number,
  data: Partial<{
    startDate: string;
    endDate: string;
    totalPrice: number;
    notes: string;
    status: ContractStatus;
  }>
) {
  await getById(id);
  const updateData: Record<string, unknown> = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  return prisma.rentalContract.update({
    where: { id },
    data: updateData,
    include: contractInclude,
  });
}

export async function markOverdue() {
  const now = new Date();
  const result = await prisma.rentalContract.updateMany({
    where: { status: 'ACTIVE', endDate: { lt: now } },
    data: { status: 'OVERDUE' },
  });
  return { updated: result.count };
}
