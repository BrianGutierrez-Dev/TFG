import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { ENV } from '../config/env';
import { AppError } from '../middleware/error.middleware';

export async function login(email: string, password: string) {
  const employee = await prisma.employee.findUnique({ where: { email } });

  if (!employee) throw new AppError(401, 'Credenciales incorrectas');

  const valid = await bcrypt.compare(password, employee.password);
  if (!valid) throw new AppError(401, 'Credenciales incorrectas');

  const token = jwt.sign(
    { id: employee.id, email: employee.email, role: employee.role },
    ENV.JWT_SECRET,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );

  const { password: _, ...employeeData } = employee;
  return { token, employee: employeeData };
}

export async function getProfile(employeeId: number) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!employee) throw new AppError(404, 'Empleado no encontrado');
  return employee;
}
