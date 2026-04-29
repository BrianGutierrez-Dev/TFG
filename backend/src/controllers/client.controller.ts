import { Response, NextFunction } from 'express';
import * as clientService from '../services/client.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const isBlacklisted =
      req.query.blacklisted === 'true' ? true
      : req.query.blacklisted === 'false' ? false
      : undefined;
    res.json(await clientService.getAll(isBlacklisted !== undefined ? { isBlacklisted } : undefined));
  } catch (err) { next(err); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await clientService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await clientService.create(req.body));
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await clientService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await clientService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await clientService.getClientHistory(Number(req.params.id)));
  } catch (err) { next(err); }
}
