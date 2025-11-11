import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCourseWorkDto {
  @ApiProperty({ example: 1, description: "Student ID" })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({ example: 1, description: "Subject ID" })
  @IsNumber()
  @IsNotEmpty()
  subject_id: number;

  @ApiProperty({
    example: "Machine Learning Research Paper",
    description: "Course work title",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: "Research on neural networks",
    description: "Description",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "2024-03-15", description: "Submission date" })
  @IsDateString()
  @IsNotEmpty()
  submission_date: string;

  @ApiPropertyOptional({
    example: "/uploads/paper.pdf",
    description: "File URL",
  })
  @IsOptional()
  @IsString()
  file_url?: string;
}
