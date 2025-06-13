import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsOptional()
  avatar?: Express.Multer.File;

  @IsBoolean()
  @IsOptional()
  enableEmailMarketing: boolean = false;

  @IsBoolean()
  checkingOut: boolean = false;
}
