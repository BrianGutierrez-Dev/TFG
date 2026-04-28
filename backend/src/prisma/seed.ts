import bcrypt from 'bcryptjs';
import prisma from './client';

async function main() {
  // ─── Empleados ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin1234', 10);
  const empHash = await bcrypt.hash('emp1234', 10);

  const admin = await prisma.employee.upsert({
    where: { email: 'admin@taller.com' },
    update: {},
    create: { email: 'admin@taller.com', password: adminHash, name: 'Administrador', role: 'ADMIN' },
  });

  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { email: 'carlos@taller.com' },
      update: {},
      create: { email: 'carlos@taller.com', password: empHash, name: 'Carlos López', role: 'EMPLOYEE' },
    }),
    prisma.employee.upsert({
      where: { email: 'marta@taller.com' },
      update: {},
      create: { email: 'marta@taller.com', password: empHash, name: 'Marta Fernández', role: 'EMPLOYEE' },
    }),
    prisma.employee.upsert({
      where: { email: 'jose@taller.com' },
      update: {},
      create: { email: 'jose@taller.com', password: empHash, name: 'José Martínez', role: 'EMPLOYEE' },
    }),
  ]);

  const allEmployees = [admin, ...employees];

  // ─── Clientes ────────────────────────────────────────────────────────────────
  const clientsData = [
    { name: 'Ana García', email: 'ana.garcia@gmail.com', phone: '612345678', dni: '12345678A', address: 'Calle Mayor 1, Madrid' },
    { name: 'Pedro Sánchez', email: 'pedro.sanchez@hotmail.com', phone: '623456789', dni: '23456789B', address: 'Av. Constitución 5, Sevilla' },
    { name: 'Laura Martín', email: 'laura.martin@gmail.com', phone: '634567890', dni: '34567890C', address: 'C/ Sierpes 12, Sevilla' },
    { name: 'Miguel Torres', email: 'miguel.torres@yahoo.es', phone: '645678901', dni: '45678901D', address: 'Gran Vía 22, Bilbao' },
    { name: 'Sofía Ruiz', email: 'sofia.ruiz@gmail.com', phone: '656789012', dni: '56789012E', address: 'Paseo de Gracia 44, Barcelona' },
    { name: 'David Gómez', email: 'david.gomez@outlook.com', phone: '667890123', dni: '67890123F', address: 'C/ Larios 8, Málaga' },
    { name: 'Isabel Díaz', email: 'isabel.diaz@gmail.com', phone: '678901234', dni: '78901234G', address: 'Rúa Nova 3, Santiago de Compostela' },
    { name: 'Javier Moreno', email: 'javier.moreno@hotmail.com', phone: '689012345', dni: '89012345H', address: 'C/ Real 15, Cádiz', isBlacklisted: true, notes: 'Devolvió coche con daños graves y no pagó' },
    { name: 'Elena Jiménez', email: 'elena.jimenez@gmail.com', phone: '690123456', dni: '90123456I', address: 'Av. de la Paz 7, Valencia' },
    { name: 'Roberto Alonso', email: 'roberto.alonso@gmail.com', phone: '601234567', dni: '01234567J', address: 'C/ Colón 18, Zaragoza' },
    { name: 'Carmen Vega', email: 'carmen.vega@yahoo.es', phone: '611111111', dni: '11111111K', address: 'C/ Alcalá 99, Madrid' },
    { name: 'Antonio Navarro', email: 'antonio.navarro@gmail.com', phone: '622222222', dni: '22222222L', address: 'Av. Libertad 30, Alicante' },
    { name: 'Beatriz Ramos', email: 'beatriz.ramos@outlook.com', phone: '633333333', dni: '33333333M', address: 'C/ Buen Suceso 4, Pamplona' },
    { name: 'Fernando Castro', email: 'fernando.castro@gmail.com', phone: '644444444', dni: '44444444N', address: 'Paseo Maritimo 11, Palma' },
    { name: 'Natalia Ortega', email: 'natalia.ortega@hotmail.com', phone: '655555555', dni: '55555555O', address: 'C/ Nueva 5, Granada' },
  ];

  const clients = await Promise.all(
    clientsData.map(d =>
      prisma.client.upsert({
        where: { email: d.email },
        update: {},
        create: d,
      })
    )
  );

  // ─── Coches del taller (sin cliente) ─────────────────────────────────────────
  const carsData = [
    { licensePlate: '1234ABC', brand: 'Toyota', model: 'Corolla', year: 2020, color: 'Blanco' },
    { licensePlate: '2345BCD', brand: 'Ford', model: 'Focus', year: 2019, color: 'Negro' },
    { licensePlate: '3456CDE', brand: 'Seat', model: 'León', year: 2021, color: 'Rojo' },
    { licensePlate: '4567DEF', brand: 'Volkswagen', model: 'Golf', year: 2022, color: 'Gris' },
    { licensePlate: '5678EFG', brand: 'Renault', model: 'Megane', year: 2020, color: 'Azul' },
    { licensePlate: '6789FGH', brand: 'BMW', model: 'Serie 3', year: 2021, color: 'Negro' },
    { licensePlate: '7890GHI', brand: 'Mercedes', model: 'Clase A', year: 2023, color: 'Plata' },
    { licensePlate: '8901HIJ', brand: 'Audi', model: 'A3', year: 2022, color: 'Blanco' },
    { licensePlate: '9012IJK', brand: 'Honda', model: 'Civic', year: 2019, color: 'Azul' },
    { licensePlate: '0123JKL', brand: 'Hyundai', model: 'Tucson', year: 2021, color: 'Verde' },
    { licensePlate: '1234KLM', brand: 'Kia', model: 'Sportage', year: 2020, color: 'Naranja' },
    { licensePlate: '2345LMN', brand: 'Nissan', model: 'Qashqai', year: 2022, color: 'Gris' },
    { licensePlate: '3456MNO', brand: 'Peugeot', model: '308', year: 2021, color: 'Blanco' },
    { licensePlate: '4567NOP', brand: 'Citroën', model: 'C4', year: 2023, color: 'Rojo' },
    { licensePlate: '5678OPQ', brand: 'Opel', model: 'Astra', year: 2019, color: 'Negro' },
  ];

  const cars = await Promise.all(
    carsData.map(d =>
      prisma.car.upsert({
        where: { licensePlate: d.licensePlate },
        update: {},
        create: d,
      })
    )
  );

  // ─── Coches de clientes ───────────────────────────────────────────────────────
  const clientCarsData = [
    { licensePlate: '6789PQR', brand: 'Ford', model: 'Mustang', year: 2018, color: 'Rojo', clientId: clients[0].id },
    { licensePlate: '7890QRS', brand: 'Tesla', model: 'Model 3', year: 2023, color: 'Blanco', clientId: clients[1].id },
    { licensePlate: '8901RST', brand: 'Toyota', model: 'RAV4', year: 2021, color: 'Gris', clientId: clients[2].id },
    { licensePlate: '9012STU', brand: 'BMW', model: 'X5', year: 2022, color: 'Negro', clientId: clients[3].id },
    { licensePlate: '0123TUV', brand: 'Audi', model: 'Q5', year: 2020, color: 'Azul', clientId: clients[4].id },
  ];

  await Promise.all(
    clientCarsData.map(d =>
      prisma.car.upsert({
        where: { licensePlate: d.licensePlate },
        update: {},
        create: d,
      })
    )
  );

  // ─── Contratos de alquiler ────────────────────────────────────────────────────
  const now = new Date();
  const d = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86400000);

  const contractsData = [
    // Completados
    { clientId: clients[0].id, carId: cars[0].id, startDate: d(-60), endDate: d(-55), status: 'COMPLETED' as const, totalPrice: 250, notes: 'Sin incidencias' },
    { clientId: clients[1].id, carId: cars[1].id, startDate: d(-50), endDate: d(-45), status: 'COMPLETED' as const, totalPrice: 200, notes: null },
    { clientId: clients[2].id, carId: cars[2].id, startDate: d(-45), endDate: d(-40), status: 'COMPLETED' as const, totalPrice: 300, notes: 'Cliente puntual' },
    { clientId: clients[3].id, carId: cars[3].id, startDate: d(-40), endDate: d(-35), status: 'COMPLETED' as const, totalPrice: 450, notes: null },
    { clientId: clients[4].id, carId: cars[4].id, startDate: d(-35), endDate: d(-30), status: 'COMPLETED' as const, totalPrice: 320, notes: null },
    { clientId: clients[5].id, carId: cars[5].id, startDate: d(-30), endDate: d(-25), status: 'COMPLETED' as const, totalPrice: 600, notes: 'VIP' },
    { clientId: clients[6].id, carId: cars[6].id, startDate: d(-25), endDate: d(-20), status: 'COMPLETED' as const, totalPrice: 550, notes: null },
    { clientId: clients[8].id, carId: cars[8].id, startDate: d(-20), endDate: d(-15), status: 'COMPLETED' as const, totalPrice: 180, notes: null },
    { clientId: clients[9].id, carId: cars[9].id, startDate: d(-15), endDate: d(-10), status: 'COMPLETED' as const, totalPrice: 220, notes: null },
    { clientId: clients[10].id, carId: cars[10].id, startDate: d(-10), endDate: d(-5), status: 'COMPLETED' as const, totalPrice: 190, notes: null },
    // Activos
    { clientId: clients[11].id, carId: cars[11].id, startDate: d(-3), endDate: d(4), status: 'ACTIVE' as const, totalPrice: 280, notes: null },
    { clientId: clients[12].id, carId: cars[12].id, startDate: d(-1), endDate: d(6), status: 'ACTIVE' as const, totalPrice: 350, notes: null },
    { clientId: clients[13].id, carId: cars[13].id, startDate: d(0), endDate: d(7), status: 'ACTIVE' as const, totalPrice: 490, notes: 'Solicitó seguro adicional' },
    // Cancelados
    { clientId: clients[14].id, carId: cars[14].id, startDate: d(-20), endDate: d(-15), status: 'CANCELLED' as const, totalPrice: 160, notes: 'Cancelado por el cliente' },
    // Vencidos
    { clientId: clients[7].id, carId: cars[7].id, startDate: d(-30), endDate: d(-10), status: 'OVERDUE' as const, totalPrice: 800, notes: 'No devolvió el coche a tiempo' },
  ];

  const contracts = await Promise.all(
    contractsData.map(d => prisma.rentalContract.create({ data: d }))
  );

  // ─── Devoluciones ────────────────────────────────────────────────────────────
  const completedContracts = contracts.filter((c: { status: string }) => c.status === 'COMPLETED');
  const returnsData = [
    { contractId: completedContracts[0].id, employeeId: allEmployees[1].id, onTime: true, condition: 'EXCELLENT' as const, fuelLevel: 'FULL' as const, damagesFound: false },
    { contractId: completedContracts[1].id, employeeId: allEmployees[2].id, onTime: true, condition: 'GOOD' as const, fuelLevel: 'THREE_QUARTERS' as const, damagesFound: false },
    { contractId: completedContracts[2].id, employeeId: allEmployees[3].id, onTime: false, condition: 'FAIR' as const, fuelLevel: 'HALF' as const, damagesFound: true, damageDescription: 'Pequeño arañazo en puerta trasera izquierda' },
    { contractId: completedContracts[3].id, employeeId: allEmployees[1].id, onTime: true, condition: 'EXCELLENT' as const, fuelLevel: 'FULL' as const, damagesFound: false },
    { contractId: completedContracts[4].id, employeeId: allEmployees[2].id, onTime: true, condition: 'GOOD' as const, fuelLevel: 'FULL' as const, damagesFound: false },
    { contractId: completedContracts[5].id, employeeId: allEmployees[3].id, onTime: true, condition: 'EXCELLENT' as const, fuelLevel: 'FULL' as const, damagesFound: false, notes: 'Cliente muy cuidadoso' },
    { contractId: completedContracts[6].id, employeeId: allEmployees[1].id, onTime: false, condition: 'DAMAGED' as const, fuelLevel: 'ONE_QUARTER' as const, damagesFound: true, damageDescription: 'Golpe en parachoques delantero' },
    { contractId: completedContracts[7].id, employeeId: allEmployees[2].id, onTime: true, condition: 'GOOD' as const, fuelLevel: 'THREE_QUARTERS' as const, damagesFound: false },
    { contractId: completedContracts[8].id, employeeId: allEmployees[3].id, onTime: true, condition: 'GOOD' as const, fuelLevel: 'FULL' as const, damagesFound: false },
    { contractId: completedContracts[9].id, employeeId: allEmployees[1].id, onTime: true, condition: 'FAIR' as const, fuelLevel: 'HALF' as const, damagesFound: false, notes: 'Interior algo sucio' },
  ];

  await Promise.all(returnsData.map(d => prisma.carReturn.create({ data: d })));

  // ─── Incidencias ─────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.incident.create({ data: { clientId: clients[7].id, contractId: contracts[14].id, type: 'NOT_RETURNED', description: 'El cliente no devolvió el vehículo en la fecha pactada. Lleva 10 días de retraso.', severity: 'CRITICAL', resolved: false } }),
    prisma.incident.create({ data: { clientId: clients[7].id, contractId: contracts[14].id, type: 'PAYMENT', description: 'Impago de los días adicionales de alquiler.', severity: 'HIGH', resolved: false } }),
    prisma.incident.create({ data: { clientId: clients[2].id, contractId: completedContracts[2].id, type: 'DAMAGE', description: 'Arañazo en puerta trasera izquierda detectado en la devolución.', severity: 'LOW', resolved: true, resolvedAt: d(-38) } }),
    prisma.incident.create({ data: { clientId: clients[6].id, contractId: completedContracts[6].id, type: 'DAMAGE', description: 'Golpe en parachoques delantero. Se retuvo fianza.', severity: 'MEDIUM', resolved: true, resolvedAt: d(-18) } }),
    prisma.incident.create({ data: { clientId: clients[6].id, contractId: completedContracts[6].id, type: 'LATE_RETURN', description: 'El cliente devolvió el vehículo con 2 días de retraso sin avisar.', severity: 'MEDIUM', resolved: true, resolvedAt: d(-19) } }),
    prisma.incident.create({ data: { clientId: clients[1].id, type: 'ACCIDENT', description: 'El cliente informó de un pequeño accidente de tráfico. Sin heridos.', severity: 'HIGH', resolved: false } }),
    prisma.incident.create({ data: { clientId: clients[4].id, type: 'OTHER', description: 'Cliente reclamó cargo incorrecto en la factura. Revisado y corregido.', severity: 'LOW', resolved: true, resolvedAt: d(-28) } }),
  ]);

  // ─── Mantenimientos ───────────────────────────────────────────────────────────
  await Promise.all([
    prisma.maintenance.create({ data: { carId: cars[0].id, type: 'Cambio de aceite', description: 'Aceite 5W-30 + filtro', cost: 85, date: d(-90), nextDueDate: d(90) } }),
    prisma.maintenance.create({ data: { carId: cars[0].id, type: 'Revisión ITV', description: 'Pasó sin defectos', cost: 40, date: d(-180), nextDueDate: d(180) } }),
    prisma.maintenance.create({ data: { carId: cars[1].id, type: 'Cambio de frenos', description: 'Pastillas y discos delanteros', cost: 320, date: d(-60), nextDueDate: d(300) } }),
    prisma.maintenance.create({ data: { carId: cars[2].id, type: 'Cambio de aceite', description: 'Aceite sintético 5W-40', cost: 90, date: d(-45), nextDueDate: d(135) } }),
    prisma.maintenance.create({ data: { carId: cars[3].id, type: 'Cambio de neumáticos', description: 'Neumáticos de verano 205/55 R16', cost: 480, date: d(-30), nextDueDate: d(700) } }),
    prisma.maintenance.create({ data: { carId: cars[4].id, type: 'Revisión general', description: 'Revisión de 60.000 km', cost: 250, date: d(-20), nextDueDate: d(365) } }),
    prisma.maintenance.create({ data: { carId: cars[5].id, type: 'Cambio de aceite', description: 'Aceite BMW Long Life 5W-30', cost: 120, date: d(-15), nextDueDate: d(350) } }),
    prisma.maintenance.create({ data: { carId: cars[6].id, type: 'Revisión ITV', description: 'Defecto leve: piloto trasero. Subsanado in situ.', cost: 45, date: d(-10), nextDueDate: d(720) } }),
    prisma.maintenance.create({ data: { carId: cars[7].id, type: 'Cambio de filtro de aire', description: null, cost: 55, date: d(-5), nextDueDate: d(355) } }),
    prisma.maintenance.create({ data: { carId: cars[8].id, type: 'Cambio de aceite', description: 'Aceite 0W-20 + filtro', cost: 95, date: d(-3), nextDueDate: d(357) } }),
  ]);

  // ─── Reparaciones ─────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.repair.create({ data: { carId: cars[6].id, description: 'Reparación de golpe en parachoques delantero', cost: 650, status: 'COMPLETED', startDate: d(-18), endDate: d(-15) } }),
    prisma.repair.create({ data: { carId: cars[2].id, description: 'Pulido y reparación de arañazo en puerta trasera', cost: 180, status: 'COMPLETED', startDate: d(-37), endDate: d(-35) } }),
    prisma.repair.create({ data: { carId: cars[7].id, description: 'Revisión del sistema de frenos tras uso prolongado', cost: 280, status: 'IN_PROGRESS', startDate: d(-2) } }),
    prisma.repair.create({ data: { carId: cars[9].id, description: 'Sustitución de luna delantera por impacto de piedra', cost: 420, status: 'PENDING' } }),
    prisma.repair.create({ data: { carId: cars[1].id, description: 'Reparación de sensor de aparcamiento trasero defectuoso', cost: 150, status: 'PENDING' } }),
    prisma.repair.create({ data: { carId: cars[4].id, description: 'Reparación de aire acondicionado sin frío', cost: 320, status: 'IN_PROGRESS', startDate: d(-1) } }),
  ]);

  console.log('✅ Seed completado con datos de prueba.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
