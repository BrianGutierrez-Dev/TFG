import { Response, NextFunction } from 'express';
import * as carReturnService from '../services/carReturn.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getAll(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await carReturnService.getAll());
  } catch (err) { next(err); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await carReturnService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const carReturn = await carReturnService.create(req.employee!.id, req.body);
    res.status(201).json(carReturn);
  } catch (err) { next(err); }
}
