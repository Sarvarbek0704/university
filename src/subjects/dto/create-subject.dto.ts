import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSubjectDto {
  @ApiProperty({
    example: "Mathematics",
    description: "Name of the subject",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 4,
    description: "Credit value of the subject",
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  credit?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the department this subject belongs to",
  })
  @IsOptional()
  @IsNumber()
  department_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Semester number when this subject is taught",
    minimum: 1,
    maximum: 8,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  semester_number?: number;
}
