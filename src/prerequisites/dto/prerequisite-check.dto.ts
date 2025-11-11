import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

class StudentPrerequisiteDto {
  @ApiProperty({
    example: 1,
    description: "Student ID",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: "List of completed subject IDs",
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  completed_subjects?: number[];
}

export class PrerequisiteCheckDto {
  @ApiProperty({
    example: 1,
    description: "Subject ID to check prerequisites for",
  })
  @IsNumber()
  @IsNotEmpty()
  subject_id: number;

  @ApiProperty({
    type: [StudentPrerequisiteDto],
    description: "List of students to check prerequisites for",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentPrerequisiteDto)
  students: StudentPrerequisiteDto[];

  @ApiPropertyOptional({
    example: true,
    description: "Whether to include detailed requirement information",
  })
  @IsOptional()
  @IsBoolean()
  include_details?: boolean;
}
