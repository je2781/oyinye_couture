import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  enableEmailMarketing?: boolean;

  @IsOptional()
  @IsBoolean()
  checkingOut?: boolean;
}
