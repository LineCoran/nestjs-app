import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWhatToTakeCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateWhatToTakeCategoryDto extends PartialType(
  CreateWhatToTakeCategoryDto,
) {}

export class CreateWhatToTakeItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

export class UpdateWhatToTakeItemDto extends PartialType(
  CreateWhatToTakeItemDto,
) {}
