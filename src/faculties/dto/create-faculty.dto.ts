import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFacultyDto {
  @ApiProperty({
    example: "Computer Science Faculty",
    description: "Name of the faculty",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 5,
    description: "Building number where faculty is located",
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  building_number?: number;

  @ApiPropertyOptional({
    example: "+998901234567",
    description: "Contact phone number for the faculty",
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    example: "CS",
    description: "Short code for the faculty",
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @ApiPropertyOptional({
    example: "Faculty of Computer Science and Information Technology",
    description: "Full description of the faculty",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
