// search-query.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class CollectionsQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsString()
  ['filter.p.m.custom.colors']?: string;

  @IsOptional()
  @IsString()
  ['filter.p.m.custom.feature']?: string;

  @IsOptional()
  @IsString()
  ['filter.p.m.custom.dress_length']?: string;

  @IsOptional()
  @IsString()
  ['filter.p.m.custom.fabric']?: string;

  @IsOptional()
  @IsString()
  ['filter.p.m.custom.neckline']?: string;

  @IsOptional()
  @IsString()
  ['filter.p.m.custom.sleeve_length']?: string;
}
