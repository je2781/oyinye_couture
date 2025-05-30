import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductParamsDto {
  @IsString()
  @Type(() => String)
  product: string;

  @IsString()
  @Type(() => String)
  color: string;

  @IsString()
  @Type(() => String)
  variantId: string;
}
