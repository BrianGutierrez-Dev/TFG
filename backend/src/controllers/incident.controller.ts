import { Response, NextFunction } from 'express';
import * as incidentService from '../services/incident.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { IncidentType } from '@prisma/client';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const filters: { clientId?: number; type?: IncidentType; resolved?: boolean } = {};
    if (req.query.clientId) filters.clientId = Number(req.query.clientId);
    if (req.query.type) filters.type = req.query.type as IncidentType;
    if (req.query.resolved !== undefined) filters.resolved = req.query.resolved === 'true';
    res.json(await incidentService.getAll(filters));
  } catch (err) { next(err); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await incidentService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await incidentService.create(req.body));
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await incidentService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function resolve(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await incidentService.resolve(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await incidentService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}
