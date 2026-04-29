import {
  IsBoolean, IsEmail, IsString, IsNotEmpty, IsOptional, Length, IsEnum, IsIn,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email!: string;

  @IsString()
  @Length(8, 100, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name!: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'EMPLOYEE'], { message: 'El rol debe ser ADMIN o EMPLOYEE' })
  role?: 'ADMIN' | 'EMPLOYEE';
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 100, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'EMPLOYEE'], { message: 'El rol debe ser ADMIN o EMPLOYEE' })
  role?: 'ADMIN' | 'EMPLOYEE';

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  isActive?: boolean;

  @IsOptional()
  @IsIn(['BAJA', 'DESPEDIDO'], { message: 'El motivo debe ser BAJA o DESPEDIDO' })
  terminationReason?: 'BAJA' | 'DESPEDIDO';
}
