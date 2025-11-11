import { IsNumber, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateStudentCreditDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 1,
    description: "Semester number",
  })
  @IsNumber()
  @IsNotEmpty()
  semester_id: number;

  @ApiProperty({
    example: 30,
    description: "Total credits earned",
  })
  @IsNumber()
  @IsNotEmpty()
  total_credits: number;

  @ApiProperty({
    example: 3.8,
    description: "GPA for the semester",
  })
  @IsNumber()
  @IsNotEmpty()
  gpa: number;

  @ApiPropertyOptional({
    example: "COMPLETED",
    description: "Status of the semester",
    enum: ["COMPLETED", "IN_PROGRESS", "FAILED", "WITHDRAWN"],
  })
  @IsOptional()
  @IsEnum(["COMPLETED", "IN_PROGRESS", "FAILED", "WITHDRAWN"])
  status?: string;
}
