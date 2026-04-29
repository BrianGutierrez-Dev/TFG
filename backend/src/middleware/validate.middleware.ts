import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ClassConstructor } from 'class-transformer/types/interfaces';

export function validateBody<T extends object>(DtoClass: ClassConstructor<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(DtoClass, req.body);
    const errors = await validate(instance, { whitelist: false, forbidNonWhitelisted: false });

    if (errors.length > 0) {
      const messages = errors.flatMap((e: any) => Object.values(e.constraints ?? {}));
      res.status(400).json({ message: 'Datos inválidos', errors: messages });
      return;
    }

    next();
  };
}
