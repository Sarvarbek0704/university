import {
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  Max,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class StudentExamResultDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 85,
    description: "Score obtained by student",
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({
    example: "A",
    description: "Grade based on score",
    enum: ["A", "B", "C", "D", "E", "F", "INCOMPLETE"],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["A", "B", "C", "D", "E", "F", "INCOMPLETE"])
  grade: string;

  @ApiPropertyOptional({
    example: "Good performance",
    description: "Additional comments",
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class BulkExamResultsDto {
  @ApiProperty({
    example: 1,
    description: "ID of the exam",
  })
  @IsNumber()
  @IsNotEmpty()
  exam_id: number;

  @ApiProperty({
    type: [StudentExamResultDto],
    description: "Array of student exam results",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentExamResultDto)
  results: StudentExamResultDto[];

  @ApiPropertyOptional({
    example: true,
    description: "Whether to publish results immediately",
  })
  @IsOptional()
  @IsBoolean()
  publish_immediately?: boolean;
}
