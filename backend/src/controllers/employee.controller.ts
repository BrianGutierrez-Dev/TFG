import { Response, NextFunction } from 'express';
import * as employeeService from '../services/employee.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getAll(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await employeeService.getAll());
  } catch (err) { next(err); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await employeeService.getById(Number(req.params.id)));
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const employee = await employeeService.create(req.body);
    res.status(201).json(employee);
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (Number(req.params.id) === req.employee?.id && req.body.isActive === false) {
      res.status(400).json({ message: 'No puedes darte de baja a ti mismo' });
      return;
    }
    res.json(await employeeService.update(Number(req.params.id), req.body));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (Number(req.params.id) === req.employee?.id) {
      res.status(400).json({ message: 'No puedes darte de baja a ti mismo' });
      return;
    }
    await employeeService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { next(err); }
}
