import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import prisma from '../prisma/client';

export interface AuthRequest extends Request {
  employee?: { id: number; email: string; role: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token requerido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };
    const employee = await prisma.employee.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!employee?.isActive) {
      res.status(401).json({ message: 'Empleado dado de baja. Acceso bloqueado' });
      return;
    }

    req.employee = { id: employee.id, email: employee.email, role: employee.role };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.employee?.role !== 'ADMIN') {
    res.status(403).json({ message: 'Acceso restringido a administradores' });
    return;
  }
  next();
}
