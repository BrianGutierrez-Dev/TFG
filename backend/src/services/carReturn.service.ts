import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { CarCondition, FuelLevel } from '@prisma/client';

export async function getAll() {
  return prisma.carReturn.findMany({
    include: {
      contract: {
        include: {
          client: { select: { id: true, name: true, dni: true } },
          car: { select: { id: true, licensePlate: true, brand: true, model: true } },
        },
      },
      employee: { select: { id: true, name: true } },
    },
    orderBy: { returnDate: 'desc' },
  });
}

export async function getById(id: number) {
  const carReturn = await prisma.carReturn.findUnique({
    where: { id },
    include: {
      contract: {
        include: {
          client: true,
          car: true,
        },
      },
      employee: { select: { id: true, name: true } },
    },
  });
  if (!carReturn) throw new AppError(404, 'Registro de devolución no encontrado');
  return carReturn;
}

export async function create(
  employeeId: number,
  data: {
    contractId: number;
    returnDate?: string;
    onTime: boolean;
    condition: CarCondition;
    fuelLevel?: FuelLevel;
    damagesFound: boolean;
    damageDescription?: string;
    notes?: string;
  }
) {
  const contract = await prisma.rentalContract.findUnique({
    where: { id: data.contractId },
    include: { client: true, carReturn: true },
  });

  if (!contract) throw new AppError(404, 'Contrato no encontrado');
  if (contract.carReturn) throw new AppError(409, 'Este contrato ya tiene un registro de devolución');
  if (contract.status === 'CANCELLED') throw new AppError(400, 'El contrato está cancelado');
  if (contract.status === 'COMPLETED') throw new AppError(400, 'El contrato ya está completado');

  const returnDate = data.returnDate ? new Date(data.returnDate) : new Date();
  const isOnTime = returnDate <= contract.endDate;

  const carReturn = await prisma.carReturn.create({
    data: {
      contractId: data.contractId,
      employeeId,
      returnDate,
      onTime: isOnTime,
      condition: data.condition,
      fuelLevel: data.fuelLevel,
      damagesFound: data.damagesFound,
      damageDescription: data.damageDescription,
      notes: data.notes,
    },
    include: {
      contract: { include: { client: true, car: true } },
      employee: { select: { id: true, name: true } },
    },
  });

  // Cerrar el contrato automáticamente
  await prisma.rentalContract.update({
    where: { id: data.contractId },
    data: { status: 'COMPLETED' },
  });

  // Si hay daños o devolución tardía, crear incidencia automáticamente
  const incidentPromises: Promise<unknown>[] = [];

  if (!isOnTime) {
    incidentPromises.push(
      prisma.incident.create({
        data: {
          clientId: contract.clientId,
          contractId: data.contractId,
          type: 'LATE_RETURN',
          description: `Devolución tardía. Fecha acordada: ${contract.endDate.toLocaleDateString()}. Devuelto: ${returnDate.toLocaleDateString()}.`,
          severity: 'MEDIUM',
        },
      })
    );
  }

  if (data.damagesFound && data.damageDescription) {
    incidentPromises.push(
      prisma.incident.create({
        data: {
          clientId: contract.clientId,
          contractId: data.contractId,
          type: 'DAMAGE',
          description: data.damageDescription,
          severity: 'HIGH',
        },
      })
    );
  }

  if (incidentPromises.length > 0) {
    await Promise.all(incidentPromises);
    // Marcar al cliente si acumula incidencias graves
    await evaluateBlacklist(contract.clientId);
  }

  return carReturn;
}

async function evaluateBlacklist(clientId: number) {
  const unresolvedHighSeverity = await prisma.incident.count({
    where: {
      clientId,
      resolved: false,
      severity: { in: ['HIGH', 'CRITICAL'] },
    },
  });

  if (unresolvedHighSeverity >= 2) {
    await prisma.client.update({
      where: { id: clientId },
      data: { isBlacklisted: true },
    });
  }
}
