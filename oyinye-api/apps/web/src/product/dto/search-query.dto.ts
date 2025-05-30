// search-query.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsString()
  ['filter.v.price.gte']?: string;

  @IsOptional()
  @IsString()
  ['filter.v.price.lte']?: string;

  @IsOptional()
  @IsString()
  ['filter.v.availability']?: string;

  @IsOptional()
  @IsString()
  ['filter.p.product_type']?: string;
}
