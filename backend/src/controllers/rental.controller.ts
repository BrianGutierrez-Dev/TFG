import { Response, NextFunction } from 'express';
import * as rentalService from '../services/rental.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { ContractStatus } from '@prisma/client';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const filters: { status?: ContractStatus; clientId?: number; carId?: number } = {};
    if (req.query.status) filters.status = req.query.status as ContractStatus;
    if (req.query.clientId) filters.clientId = Number(req.query.clientId);
    if (req.query.carId) filters.carId = Number(req.query.carId);
    res.json(await rentalService.getAll(filters));
  } catch (err) { next(err); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await rentalService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { clientId, carId, startDate, endDate, totalPrice } = req.body;
    if (!clientId || !carId || !startDate || !endDate || totalPrice == null) {
      res.status(400).json({ message: 'Faltan campos obligatorios: clientId, carId, startDate, endDate, totalPrice' });
      return;
    }
    if (isNaN(Number(totalPrice)) || Number(totalPrice) <= 0) {
      res.status(400).json({ message: 'El precio total debe ser mayor que 0' });
      return;
    }
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      res.status(400).json({ message: 'Las fechas proporcionadas no son válidas' });
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la fecha de fin' });
      return;
    }
    res.status(201).json(await rentalService.create(req.body));
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await rentalService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    res.json(await rentalService.updateStatus(Number(req.params.id), status));
  } catch (err) { next(err); }
}

export async function markOverdue(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await rentalService.markOverdue());
  } catch (err) { next(err); }
}
