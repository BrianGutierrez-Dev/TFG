import bcrypt from 'bcryptjs';
import prisma from './client';

const DAY_MS = 86_400_000;

function dateFromToday(offsetDays: number) {
  return new Date(Date.now() + offsetDays * DAY_MS);
}

async function clearDatabase() {
  await prisma.$transaction([
    prisma.carReturn.deleteMany(),
    prisma.incident.deleteMany(),
    prisma.repair.deleteMany(),
    prisma.maintenance.deleteMany(),
    prisma.rentalContract.deleteMany(),
    prisma.car.deleteMany(),
    prisma.client.deleteMany(),
    prisma.employee.deleteMany(),
  ]);
}

async function main() {
  await clearDatabase();

  const adminHash = await bcrypt.hash('admin1234', 10);
  const employeeHash = await bcrypt.hash('emp1234', 10);

  const employeesData = [
    { email: 'admin@taller.com', password: adminHash, name: 'Administrador', role: 'ADMIN' as const },
    ...Array.from({ length: 19 }, (_, i) => ({
      email: `empleado${String(i + 1).padStart(2, '0')}@taller.com`,
      password: employeeHash,
      name: `Empleado ${String(i + 1).padStart(2, '0')}`,
      role: i < 2 ? 'ADMIN' as const : 'EMPLOYEE' as const,
    })),
  ];

  const employees = await Promise.all(
    employeesData.map(data => prisma.employee.create({ data }))
  );

  const firstNames = [
    'Ana', 'Pedro', 'Laura', 'Miguel', 'Sofia', 'David', 'Isabel', 'Javier', 'Elena', 'Roberto',
    'Carmen', 'Antonio', 'Beatriz', 'Fernando', 'Natalia', 'Daniel', 'Patricia', 'Raul', 'Marta', 'Sergio',
  ];
  const lastNames = [
    'Garcia', 'Sanchez', 'Martin', 'Torres', 'Ruiz', 'Gomez', 'Diaz', 'Moreno', 'Jimenez', 'Alonso',
    'Vega', 'Navarro', 'Ramos', 'Castro', 'Ortega', 'Lopez', 'Herrera', 'Campos', 'Iglesias', 'Romero',
  ];
  const cities = [
    'Madrid', 'Sevilla', 'Bilbao', 'Barcelona', 'Malaga', 'Valencia', 'Zaragoza', 'Granada', 'Alicante', 'Cadiz',
  ];

  const clients = await Promise.all(
    Array.from({ length: 20 }, (_, i) => prisma.client.create({
      data: {
        name: `${firstNames[i]} ${lastNames[i]}`,
        email: `cliente${String(i + 1).padStart(2, '0')}@demo.com`,
        phone: `6${String(10000000 + i).padStart(8, '0')}`,
        dni: `${String(10000000 + i).padStart(8, '0')}${String.fromCharCode(65 + i)}`,
        address: `Calle Demo ${i + 1}, ${cities[i % cities.length]}`,
        isBlacklisted: i === 7 || i === 15,
        blacklistReason: i === 7 ? 'Impagos recurrentes y devoluciones tardias' : i === 15 ? 'Incidencias graves sin resolver' : undefined,
        blacklistedAt: i === 7 || i === 15 ? dateFromToday(-20 + i) : undefined,
        wasBlacklisted: i === 10,
        notes: i % 5 === 0 ? 'Cliente frecuente' : undefined,
      },
    }))
  );

  const brands = [
    ['Toyota', 'Corolla'], ['Ford', 'Focus'], ['Seat', 'Leon'], ['Volkswagen', 'Golf'], ['Renault', 'Megane'],
    ['BMW', 'Serie 3'], ['Mercedes', 'Clase A'], ['Audi', 'A3'], ['Honda', 'Civic'], ['Hyundai', 'Tucson'],
    ['Kia', 'Sportage'], ['Nissan', 'Qashqai'], ['Peugeot', '308'], ['Citroen', 'C4'], ['Opel', 'Astra'],
    ['Skoda', 'Octavia'], ['Mazda', 'CX-5'], ['Volvo', 'XC40'], ['Fiat', 'Tipo'], ['Dacia', 'Duster'],
  ];
  const colors = ['Blanco', 'Negro', 'Rojo', 'Gris', 'Azul', 'Plata', 'Verde', 'Naranja'];

  const cars = await Promise.all(
    brands.map(([brand, model], i) => prisma.car.create({
      data: {
        licensePlate: `${String(2000 + i).padStart(4, '0')}${String.fromCharCode(65 + i)}${String.fromCharCode(66 + i)}${String.fromCharCode(67 + i)}`,
        brand,
        model,
        year: 2018 + (i % 7),
        color: colors[i % colors.length],
        clientId: i >= 15 ? clients[i - 15].id : undefined,
      },
    }))
  );

  const contracts = await Promise.all(
    Array.from({ length: 20 }, (_, i) => {
      const startOffset = -120 + i * 5;
      const late = i % 6 === 0;
      return prisma.rentalContract.create({
        data: {
          clientId: clients[i].id,
          carId: cars[i].id,
          startDate: dateFromToday(startOffset),
          endDate: dateFromToday(startOffset + 3 + (i % 5)),
          status: 'COMPLETED',
          totalPrice: 120 + i * 35,
          notes: late ? 'Contrato con devolucion tardia' : i % 4 === 0 ? 'Seguro adicional incluido' : undefined,
        },
      });
    })
  );

  await Promise.all(
    contracts.map((contract, i) => {
      const endDate = new Date(contract.endDate);
      const returnDate = new Date(endDate.getTime() + (i % 6 === 0 ? 2 : 0) * DAY_MS);
      return prisma.carReturn.create({
        data: {
          contractId: contract.id,
          employeeId: employees[(i % employees.length)].id,
          returnDate,
          onTime: returnDate <= endDate,
          condition: (['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'] as const)[i % 4],
          fuelLevel: (['FULL', 'THREE_QUARTERS', 'HALF', 'ONE_QUARTER', 'EMPTY'] as const)[i % 5],
          damagesFound: i % 4 === 3,
          damageDescription: i % 4 === 3 ? 'Danios visibles en carroceria al devolver el vehiculo' : undefined,
          notes: i % 7 === 0 ? 'Revisar interior y niveles' : undefined,
        },
      });
    })
  );

  const incidentTypes = ['PAYMENT', 'DAMAGE', 'NOT_RETURNED', 'LATE_RETURN', 'THEFT', 'ACCIDENT', 'OTHER'] as const;
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
  await Promise.all(
    Array.from({ length: 20 }, (_, i) => {
      const resolved = i % 3 !== 0;
      return prisma.incident.create({
        data: {
          clientId: clients[i].id,
          contractId: i < contracts.length ? contracts[i].id : undefined,
          type: incidentTypes[i % incidentTypes.length],
          description: `Incidencia de prueba ${i + 1}: seguimiento operativo del cliente y contrato asociado.`,
          severity: severities[i % severities.length],
          resolved,
          resolvedAt: resolved ? dateFromToday(-10 + i) : undefined,
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 20 }, (_, i) => prisma.maintenance.create({
      data: {
        carId: cars[i].id,
        type: (['Cambio de aceite', 'Revision general', 'ITV', 'Frenos', 'Neumaticos'] as const)[i % 5],
        description: `Mantenimiento programado ${i + 1}`,
        cost: 80 + i * 22,
        date: dateFromToday(-90 + i * 4),
        nextDueDate: dateFromToday(i < 8 ? 3 + i : 45 + i * 8),
      },
    }))
  );

  const repairStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
  await Promise.all(
    Array.from({ length: 20 }, (_, i) => {
      const status = repairStatuses[i % repairStatuses.length];
      return prisma.repair.create({
        data: {
          carId: cars[i].id,
          description: `Reparacion de prueba ${i + 1}: diagnostico y actuacion sobre vehiculo.`,
          cost: 150 + i * 30,
          status,
          startDate: status === 'PENDING' ? undefined : dateFromToday(-20 + i),
          endDate: status === 'COMPLETED' || status === 'CANCELLED' ? dateFromToday(-18 + i) : undefined,
        },
      });
    })
  );

  console.log('✅ Base de datos limpiada y rellenada con 20 registros por entidad principal.');
  console.log('Admin: admin@taller.com / admin1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
