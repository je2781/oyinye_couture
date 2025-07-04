import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsDateString, 
  IsArray, 
  ArrayNotEmpty 
} from 'class-validator';

export class CreateEnquiryDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsString()
  country: string;

  @IsString()
  size: string;

  @IsString()
  phone: string;

  @IsString()
  eventDate: string;  // ISO date string

  @IsString()
  subject: string;

  @IsString()
  message: string;
}
