import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductsDto {
  @IsOptional()
  @IsNumber()
  noOfFilters?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  showOutOfStock?: boolean;

  @IsOptional()
  @IsString()
  productType?: string;

  @IsOptional()
  @IsString()
  priceRange?: string;

  @IsOptional()
  currentPriceBoundary?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsObject()
  customProp?: Record<string, any>;
}
