import {
  IsEmail, IsString, IsNotEmpty, Matches, IsOptional, Length, IsBoolean,
} from 'class-validator';

const DNI_REGEX = /^[0-9]{8}[A-Z]$/;
const PHONE_REGEX = /^[6-9][0-9]{8}$/;

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name!: string;

  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email!: string;

  @Matches(PHONE_REGEX, { message: 'El teléfono debe ser un número español válido (9 dígitos, empieza por 6-9)' })
  phone!: string;

  @Matches(DNI_REGEX, { message: 'El DNI debe tener 8 dígitos seguidos de una letra mayúscula (ej: 12345678A)' })
  dni!: string;

  @IsOptional()
  @IsString()
  @Length(0, 200, { message: 'La dirección no puede superar los 200 caracteres' })
  address?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Las notas no pueden superar los 500 caracteres' })
  notes?: string;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email?: string;

  @IsOptional()
  @Matches(PHONE_REGEX, { message: 'El teléfono debe ser un número español válido (9 dígitos, empieza por 6-9)' })
  phone?: string;

  @IsOptional()
  @Matches(DNI_REGEX, { message: 'El DNI debe tener 8 dígitos seguidos de una letra mayúscula (ej: 12345678A)' })
  dni?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;

  @IsOptional()
  @IsBoolean({ message: 'isBlacklisted debe ser un booleano' })
  isBlacklisted?: boolean;
}
