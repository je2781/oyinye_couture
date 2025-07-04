import { IsInt, IsNumber, IsPositive, IsString } from 'class-validator';

export class UpdateItemDto {
  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  variantId: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
