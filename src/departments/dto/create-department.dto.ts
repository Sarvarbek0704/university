import {
  IsString,
  IsNumber,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateDepartmentDto {
  @ApiProperty({
    example: "Computer Science Department",
    description: "Name of the department",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 1,
    description: "ID of the faculty this department belongs to",
  })
  @IsNumber()
  @IsNotEmpty()
  faculty_id: number;

  @ApiPropertyOptional({
    example: "CS",
    description: "Short code for the department",
    maxLength: 10,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  code?: string;

  @ApiPropertyOptional({
    example: "Department of Computer Science and Engineering",
    description: "Full description of the department",
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
