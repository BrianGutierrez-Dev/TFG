import { Response, NextFunction } from 'express';
import * as maintenanceService from '../services/maintenance.service';
import { AuthRequest } from '../middleware/auth.middleware';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isPositiveInteger(value: unknown) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function isValidDate(value: unknown) {
  return typeof value === 'string' && !isNaN(Date.parse(value));
}

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const carId = req.query.carId ? Number(req.query.carId) : undefined;
    res.json(await maintenanceService.getAll(carId));
  } catch (err) { next(err); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await maintenanceService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { carId, type, description, cost, date, nextDueDate } = req.body;
    const trimmedType = normalizeText(type);
    const trimmedDescription = normalizeText(description);

    if (!carId || !trimmedType || !date) {
      res.status(400).json({ message: 'Faltan campos obligatorios: carId, type, date' });
      return;
    }
    if (!isPositiveInteger(carId)) {
      res.status(400).json({ message: 'El vehículo seleccionado no es válido' });
      return;
    }
    if (trimmedType.length > 80) {
      res.status(400).json({ message: 'El tipo de mantenimiento no puede superar los 80 caracteres' });
      return;
    }
    if (trimmedDescription && (trimmedDescription.length < 3 || trimmedDescription.length > 500)) {
      res.status(400).json({ message: 'La descripción debe tener entre 3 y 500 caracteres' });
      return;
    }
    if (cost != null && (isNaN(Number(cost)) || Number(cost) <= 0)) {
      res.status(400).json({ message: 'El coste debe ser mayor que 0' });
      return;
    }
    if (!isValidDate(date) || (nextDueDate && !isValidDate(nextDueDate))) {
      res.status(400).json({ message: 'Las fechas proporcionadas no son válidas' });
      return;
    }
    if (nextDueDate && new Date(nextDueDate) <= new Date(date)) {
      res.status(400).json({ message: 'La próxima revisión debe ser posterior a la fecha del mantenimiento' });
      return;
    }

    req.body = {
      carId: Number(carId),
      type: trimmedType,
      description: trimmedDescription || undefined,
      cost: cost == null ? undefined : Number(cost),
      date,
      nextDueDate: nextDueDate || undefined,
    };

    res.status(201).json(await maintenanceService.create(req.body));
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body };

    if ('type' in data) {
      const trimmedType = normalizeText(data.type);
      if (!trimmedType || trimmedType.length > 80) {
        res.status(400).json({ message: 'El tipo de mantenimiento es obligatorio y no puede superar los 80 caracteres' });
        return;
      }
      data.type = trimmedType;
    }
    if ('description' in data) {
      const trimmedDescription = normalizeText(data.description);
      if (trimmedDescription && (trimmedDescription.length < 3 || trimmedDescription.length > 500)) {
        res.status(400).json({ message: 'La descripción debe tener entre 3 y 500 caracteres' });
        return;
      }
      data.description = trimmedDescription || null;
    }
    if ('cost' in data && data.cost != null) {
      if (isNaN(Number(data.cost)) || Number(data.cost) <= 0) {
        res.status(400).json({ message: 'El coste debe ser mayor que 0' });
        return;
      }
      data.cost = Number(data.cost);
    }
    if ('date' in data && !isValidDate(data.date)) {
      res.status(400).json({ message: 'La fecha del mantenimiento no es válida' });
      return;
    }
    if ('nextDueDate' in data && data.nextDueDate && !isValidDate(data.nextDueDate)) {
      res.status(400).json({ message: 'La fecha de próxima revisión no es válida' });
      return;
    }
    if (data.date && data.nextDueDate && new Date(data.nextDueDate) <= new Date(data.date)) {
      res.status(400).json({ message: 'La próxima revisión debe ser posterior a la fecha del mantenimiento' });
      return;
    }

    req.body = data;
    res.json(await maintenanceService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await maintenanceService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}
