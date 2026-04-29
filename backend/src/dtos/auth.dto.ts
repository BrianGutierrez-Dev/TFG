import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email!: string;

  @IsString()
  @Length(1, 100, { message: 'La contraseña es obligatoria' })
  password!: string;
}
