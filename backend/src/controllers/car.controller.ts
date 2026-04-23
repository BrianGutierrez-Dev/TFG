import { Response, NextFunction } from 'express';
import * as carService from '../services/car.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const clientId = req.query.clientId ? Number(req.query.clientId) : undefined;
    res.json(await carService.getAll(clientId));
  } catch (err) { next(err); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await carService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { licensePlate, brand, model, year } = req.body;
    if (!licensePlate || !brand || !model || year == null) {
      res.status(400).json({ message: 'Faltan campos obligatorios: licensePlate, brand, model, year' });
      return;
    }
    const parsedYear = Number(year);
    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear() + 1) {
      res.status(400).json({ message: 'El año del vehículo no es válido' });
      return;
    }
    res.status(201).json(await carService.create(req.body));
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await carService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await carService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}
