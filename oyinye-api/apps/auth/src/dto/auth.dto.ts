import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class AuthDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;

  @IsBoolean()
  @IsOptional()
  enableEmailMarketing?: boolean;
}
