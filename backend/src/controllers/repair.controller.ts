import { Response, NextFunction } from 'express';
import * as repairService from '../services/repair.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { RepairStatus } from '@prisma/client';

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
    res.status(201).json(await repairService.create(req.body));
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await repairService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await repairService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}
