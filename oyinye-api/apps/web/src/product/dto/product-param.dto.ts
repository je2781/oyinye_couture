import { IsString } from 'class-validator';

export class ProductParamsDto {
  @IsString()
  product: string;

  @IsString()
  color: string;

  @IsString()
  variantId: string;
}
