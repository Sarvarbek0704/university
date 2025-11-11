import { IsNumber, IsOptional, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateStudentCreditDto {
  @ApiPropertyOptional({
    example: 32,
    description: "Total credits earned",
  })
  @IsOptional()
  @IsNumber()
  total_credits?: number;

  @ApiPropertyOptional({
    example: 3.9,
    description: "GPA for the semester",
  })
  @IsOptional()
  @IsNumber()
  gpa?: number;

  @ApiPropertyOptional({
    example: "COMPLETED",
    description: "Status of the semester",
    enum: ["COMPLETED", "IN_PROGRESS", "FAILED", "WITHDRAWN"],
  })
  @IsOptional()
  @IsEnum(["COMPLETED", "IN_PROGRESS", "FAILED", "WITHDRAWN"])
  status?: string;
}
