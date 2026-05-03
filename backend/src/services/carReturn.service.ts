import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';
import { CarCondition, FuelLevel, Prisma } from '@prisma/client';

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
  if (data.damagesFound && !data.damageDescription?.trim())
    throw new AppError(400, 'La descripción de daños es obligatoria cuando se indican daños');

  const returnDate = data.returnDate ? new Date(data.returnDate) : new Date();
  const isOnTime = returnDate <= contract.endDate;

  return prisma.$transaction(async (tx) => {
    const carReturn = await tx.carReturn.create({
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

    await tx.rentalContract.update({
      where: { id: data.contractId },
      data: { status: 'COMPLETED' },
    });

    const incidentPromises: Promise<unknown>[] = [];

    if (!isOnTime) {
      incidentPromises.push(
        tx.incident.create({
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
        tx.incident.create({
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
      await evaluateBlacklist(contract.clientId, tx);
    }

    return carReturn;
  });
}

async function evaluateBlacklist(clientId: number, tx: Prisma.TransactionClient) {
  const unresolvedHighSeverity = await tx.incident.count({
    where: {
      clientId,
      resolved: false,
      severity: { in: ['HIGH', 'CRITICAL'] },
    },
  });

  if (unresolvedHighSeverity >= 2) {
    await tx.client.update({
      where: { id: clientId },
      data: {
        isBlacklisted: true,
        blacklistReason: 'Blacklist automática: múltiples incidencias graves sin resolver',
        blacklistedAt: new Date(),
      },
    });
  }
}
