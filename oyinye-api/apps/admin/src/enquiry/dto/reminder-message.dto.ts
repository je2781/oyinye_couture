// dto/contact-message.dto.ts
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class ReminderMessageDto {
  @IsString()
  message: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  date?: string;
}
