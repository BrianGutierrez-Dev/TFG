import { Response, NextFunction } from 'express';
import * as repairService from '../services/repair.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { RepairStatus } from '@prisma/client';

const REPAIR_STATUSES = Object.values(RepairStatus);

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
    const filters: { carId?: number; status?: RepairStatus } = {};
    if (req.query.carId) filters.carId = Number(req.query.carId);
    if (req.query.status) filters.status = req.query.status as RepairStatus;
    res.json(await repairService.getAll(filters));
  } catch (err) { next(err); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await repairService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { carId, description, cost, startDate, endDate, status } = req.body;
    const trimmedDescription = normalizeText(description);

    if (!carId || !trimmedDescription || cost == null) {
      res.status(400).json({ message: 'Faltan campos obligatorios: carId, description, cost' });
      return;
    }
    if (!isPositiveInteger(carId)) {
      res.status(400).json({ message: 'El vehículo seleccionado no es válido' });
      return;
    }
    if (trimmedDescription.length < 3 || trimmedDescription.length > 500) {
      res.status(400).json({ message: 'La descripción debe tener entre 3 y 500 caracteres' });
      return;
    }
    if (isNaN(Number(cost)) || Number(cost) <= 1) {
      res.status(400).json({ message: 'El coste debe ser mayor que 1' });
      return;
    }
    if (status && !REPAIR_STATUSES.includes(status)) {
      res.status(400).json({ message: 'El estado de la reparación no es válido' });
      return;
    }
    if ((startDate && !isValidDate(startDate)) || (endDate && !isValidDate(endDate))) {
      res.status(400).json({ message: 'Las fechas proporcionadas no son válidas' });
      return;
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      res.status(400).json({ message: 'La fecha fin no puede ser anterior a la fecha inicio' });
      return;
    }

    req.body = {
      carId: Number(carId),
      description: trimmedDescription,
      cost: Number(cost),
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    res.status(201).json(await repairService.create(req.body));
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body };

    if ('description' in data) {
      const trimmedDescription = normalizeText(data.description);
      if (trimmedDescription.length < 3 || trimmedDescription.length > 500) {
        res.status(400).json({ message: 'La descripción debe tener entre 3 y 500 caracteres' });
        return;
      }
      data.description = trimmedDescription;
    }
    if ('cost' in data) {
      if (data.cost == null || isNaN(Number(data.cost)) || Number(data.cost) <= 1) {
        res.status(400).json({ message: 'El coste debe ser mayor que 1' });
        return;
      }
      data.cost = Number(data.cost);
    }
    if ('status' in data && !REPAIR_STATUSES.includes(data.status)) {
      res.status(400).json({ message: 'El estado de la reparación no es válido' });
      return;
    }
    if ('startDate' in data && data.startDate && !isValidDate(data.startDate)) {
      res.status(400).json({ message: 'La fecha inicio no es válida' });
      return;
    }
    if ('endDate' in data && data.endDate && !isValidDate(data.endDate)) {
      res.status(400).json({ message: 'La fecha fin no es válida' });
      return;
    }
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      res.status(400).json({ message: 'La fecha fin no puede ser anterior a la fecha inicio' });
      return;
    }

    req.body = data;
    res.json(await repairService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await repairService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}
