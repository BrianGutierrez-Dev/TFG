import { Response, NextFunction } from 'express';
import * as carService from '../services/car.service';
import { AuthRequest } from '../middleware/auth.middleware';

const LICENSE_PLATE_REGEX = /^[0-9]{4}[A-Z]{3}$/;

function normalizeLicensePlate(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s/g, '').toUpperCase() : '';
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isPositiveInteger(value: unknown) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

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
    const { licensePlate, brand, model, year, color, clientId } = req.body;
    const normalizedLicensePlate = normalizeLicensePlate(licensePlate);
    const trimmedBrand = normalizeText(brand);
    const trimmedModel = normalizeText(model);
    const trimmedColor = normalizeText(color);

    if (!normalizedLicensePlate || !trimmedBrand || !trimmedModel || year == null || clientId == null) {
      res.status(400).json({ message: 'Faltan campos obligatorios: licensePlate, brand, model, year, clientId' });
      return;
    }
    if (!LICENSE_PLATE_REGEX.test(normalizedLicensePlate)) {
      res.status(400).json({ message: 'La matrícula debe tener 4 dígitos y 3 letras (ej: 1234ABC)' });
      return;
    }
    if (trimmedBrand.length > 50 || trimmedModel.length > 50) {
      res.status(400).json({ message: 'Marca y modelo no pueden superar los 50 caracteres' });
      return;
    }
    if (trimmedColor.length > 30) {
      res.status(400).json({ message: 'El color no puede superar los 30 caracteres' });
      return;
    }
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear() + 1) {
      res.status(400).json({ message: 'El año del vehículo no es válido' });
      return;
    }
    if (!isPositiveInteger(clientId)) {
      res.status(400).json({ message: 'El propietario seleccionado no es válido' });
      return;
    }

    req.body = {
      licensePlate: normalizedLicensePlate,
      brand: trimmedBrand,
      model: trimmedModel,
      year: parsedYear,
      color: trimmedColor || undefined,
      clientId: Number(clientId),
    };

    res.status(201).json(await carService.create(req.body));
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body };

    if ('licensePlate' in data) {
      const normalizedLicensePlate = normalizeLicensePlate(data.licensePlate);
      if (!LICENSE_PLATE_REGEX.test(normalizedLicensePlate)) {
        res.status(400).json({ message: 'La matrícula debe tener 4 dígitos y 3 letras (ej: 1234ABC)' });
        return;
      }
      data.licensePlate = normalizedLicensePlate;
    }
    if ('brand' in data) {
      const trimmedBrand = normalizeText(data.brand);
      if (!trimmedBrand || trimmedBrand.length > 50) {
        res.status(400).json({ message: 'La marca es obligatoria y no puede superar los 50 caracteres' });
        return;
      }
      data.brand = trimmedBrand;
    }
    if ('model' in data) {
      const trimmedModel = normalizeText(data.model);
      if (!trimmedModel || trimmedModel.length > 50) {
        res.status(400).json({ message: 'El modelo es obligatorio y no puede superar los 50 caracteres' });
        return;
      }
      data.model = trimmedModel;
    }
    if ('year' in data) {
      const parsedYear = Number(data.year);
      if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear() + 1) {
        res.status(400).json({ message: 'El año del vehículo no es válido' });
        return;
      }
      data.year = parsedYear;
    }
    if ('color' in data) {
      const trimmedColor = normalizeText(data.color);
      if (trimmedColor.length > 30) {
        res.status(400).json({ message: 'El color no puede superar los 30 caracteres' });
        return;
      }
      data.color = trimmedColor || null;
    }
    if ('clientId' in data && !isPositiveInteger(data.clientId)) {
      res.status(400).json({ message: 'El propietario seleccionado no es válido' });
      return;
    }
    if ('clientId' in data) data.clientId = Number(data.clientId);

    req.body = data;
    res.json(await carService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await carService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}
