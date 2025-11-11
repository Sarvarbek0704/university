import { IsString, IsOptional, IsNumber, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCourseWorkDto {
  @ApiPropertyOptional({
    example: "Updated Research Paper Title",
    description: "Course work title",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: "Updated description",
    description: "Description",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: "/uploads/updated.pdf",
    description: "File URL",
  })
  @IsOptional()
  @IsString()
  file_url?: string;

  @ApiPropertyOptional({
    example: "A",
    description: "Grade",
    enum: ["A", "B", "C", "D", "E", "F", "PENDING"],
  })
  @IsOptional()
  @IsEnum(["A", "B", "C", "D", "E", "F", "PENDING"])
  grade?: string;

  @ApiPropertyOptional({ example: 95, description: "Score" })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ example: "Excellent work!", description: "Feedback" })
  @IsOptional()
  @IsString()
  feedback?: string;
}
