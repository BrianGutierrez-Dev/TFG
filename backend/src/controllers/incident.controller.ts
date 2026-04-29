import { Response, NextFunction } from 'express';
import * as incidentService from '../services/incident.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { IncidentType, Severity } from '@prisma/client';

const INCIDENT_TYPES = Object.values(IncidentType);
const SEVERITIES = Object.values(Severity);

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
    const { clientId, contractId, type, severity, description } = req.body;
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';

    if (!clientId || !type || !severity || !trimmedDescription) {
      res.status(400).json({ message: 'Faltan campos obligatorios: clientId, type, severity, description' });
      return;
    }
    if (!Number.isInteger(Number(clientId)) || Number(clientId) <= 0) {
      res.status(400).json({ message: 'El cliente seleccionado no es válido' });
      return;
    }
    if (contractId != null && (!Number.isInteger(Number(contractId)) || Number(contractId) <= 0)) {
      res.status(400).json({ message: 'El contrato seleccionado no es válido' });
      return;
    }
    if (!INCIDENT_TYPES.includes(type)) {
      res.status(400).json({ message: 'El tipo de incidencia no es válido' });
      return;
    }
    if (!SEVERITIES.includes(severity)) {
      res.status(400).json({ message: 'La gravedad de la incidencia no es válida' });
      return;
    }
    if (trimmedDescription.length < 5 || trimmedDescription.length > 500) {
      res.status(400).json({ message: 'La descripción debe tener entre 5 y 500 caracteres' });
      return;
    }

    req.body = {
      ...req.body,
      clientId: Number(clientId),
      contractId: contractId == null ? undefined : Number(contractId),
      description: trimmedDescription,
    };

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
