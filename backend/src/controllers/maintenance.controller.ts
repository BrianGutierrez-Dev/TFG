import { Response, NextFunction } from 'express';
import * as maintenanceService from '../services/maintenance.service';
import { AuthRequest } from '../middleware/auth.middleware';

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
    res.status(201).json(await maintenanceService.create(req.body));
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await maintenanceService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await maintenanceService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}
