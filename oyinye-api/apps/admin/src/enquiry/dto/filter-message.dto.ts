// dto/message-filter.dto.ts
import { IsBoolean, IsOptional } from 'class-validator';

export class MessageFilterDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isUnRead?: boolean;

  @IsBoolean()
  isBooking: boolean;

  @IsBoolean()
  isContact: boolean;

  @IsOptional()
  @IsBoolean()
  saved?: boolean;
}
