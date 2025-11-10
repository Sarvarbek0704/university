import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateGroupDto {
  @ApiProperty({
    example: "CS-101",
    description: "Name of the group",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 1,
    description: "ID of the department this group belongs to",
  })
  @IsNumber()
  @IsNotEmpty()
  department_id: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Course number of the group",
    minimum: 1,
    maximum: 6,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  course_number?: number;

  @ApiPropertyOptional({
    example: "Computer Science group 101",
    description: "Description of the group",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
