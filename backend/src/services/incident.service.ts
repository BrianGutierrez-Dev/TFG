import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { IncidentType, Severity } from '@prisma/client';

const incidentInclude = {
  client: { select: { id: true, name: true, dni: true } },
  contract: {
    select: {
      id: true,
      car: { select: { id: true, licensePlate: true, brand: true, model: true } },
    },
  },
};

export async function getAll(filters?: {
  clientId?: number;
  type?: IncidentType;
  resolved?: boolean;
}) {
  return prisma.incident.findMany({
    where: filters,
    include: incidentInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getById(id: number) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: incidentInclude,
  });
  if (!incident) throw new AppError(404, 'Incidencia no encontrada');
  return incident;
}

export async function create(data: {
  clientId: number;
  contractId?: number;
  type: IncidentType;
  description: string;
  severity?: Severity;
}) {
  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) throw new AppError(404, 'Cliente no encontrado');

  const incident = await prisma.incident.create({ data, include: incidentInclude });

  // Re-evaluar lista negra
  const unresolvedHigh = await prisma.incident.count({
    where: {
      clientId: data.clientId,
      resolved: false,
      severity: { in: ['HIGH', 'CRITICAL'] },
    },
  });
  if (unresolvedHigh >= 2) {
    await prisma.client.update({
      where: { id: data.clientId },
      data: { isBlacklisted: true },
    });
  }

  return incident;
}

export async function update(
  id: number,
  data: Partial<{ description: string; severity: Severity; resolved: boolean }>
) {
  await getById(id);
  const updateData: Record<string, unknown> = { ...data };
  if (data.resolved === true) updateData.resolvedAt = new Date();
  if (data.resolved === false) updateData.resolvedAt = null;
  return prisma.incident.update({ where: { id }, data: updateData, include: incidentInclude });
}

export async function resolve(id: number) {
  await getById(id);

  return prisma.incident.update({
    where: { id },
    data: { resolved: true, resolvedAt: new Date() },
    include: incidentInclude,
  });
}

export async function remove(id: number) {
  await getById(id);
  await prisma.incident.delete({ where: { id } });
}
