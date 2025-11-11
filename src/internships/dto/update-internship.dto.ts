import { IsString, IsOptional, IsDateString, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateInternshipDto {
  @ApiPropertyOptional({
    example: "Senior Software Engineer",
    description: "Position",
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({
    example: "Jane Smith",
    description: "Supervisor name",
  })
  @IsOptional()
  @IsString()
  supervisor_name?: string;

  @ApiPropertyOptional({
    example: "jane@google.com",
    description: "Supervisor contact",
  })
  @IsOptional()
  @IsString()
  supervisor_contact?: string;

  @ApiPropertyOptional({
    example: "COMPLETED",
    description: "Internship status",
    enum: ["IN_PROGRESS", "COMPLETED", "TERMINATED"],
  })
  @IsOptional()
  @IsEnum(["IN_PROGRESS", "COMPLETED", "TERMINATED"])
  status?: string;

  @ApiPropertyOptional({
    example: "EXCELLENT",
    description: "Internship grade",
    enum: ["EXCELLENT", "GOOD", "SATISFACTORY", "FAIL"],
  })
  @IsOptional()
  @IsEnum(["EXCELLENT", "GOOD", "SATISFACTORY", "FAIL"])
  grade?: string;

  @ApiPropertyOptional({
    example: "Great performance",
    description: "Feedback",
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}
