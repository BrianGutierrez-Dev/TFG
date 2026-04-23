import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';
import { AppError } from '../middleware/error.middleware';

export async function getAll() {
  return prisma.employee.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { name: 'asc' },
  });
}

export async function getById(id: number) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
  if (!employee) throw new AppError(404, 'Empleado no encontrado');
  return employee;
}

export async function create(data: { email: string; password: string; name: string; role?: 'ADMIN' | 'EMPLOYEE' }) {
  const exists = await prisma.employee.findUnique({ where: { email: data.email } });
  if (exists) throw new AppError(409, 'Ya existe un empleado con ese email');

  const hashed = await bcrypt.hash(data.password, 10);
  const employee = await prisma.employee.create({
    data: { ...data, password: hashed },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return employee;
}

export async function update(
  id: number,
  data: Partial<{ email: string; password: string; name: string; role: 'ADMIN' | 'EMPLOYEE' }>
) {
  await getById(id);

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  } else {
    delete data.password;
  }

  return prisma.employee.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, updatedAt: true },
  });
}

export async function remove(id: number) {
  await getById(id);
  await prisma.employee.delete({ where: { id } });
}
