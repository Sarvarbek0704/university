import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateInfoStudentDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: "2000-05-15",
    description: "Birth date of the student",
  })
  @IsDateString()
  @IsNotEmpty()
  birth_date: string;

  @ApiProperty({
    example: "male",
    description: "Gender of the student",
    enum: ["male", "female"],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["male", "female"])
  gender: string;

  @ApiProperty({
    example: "AB1234567",
    description: "Passport series of the student",
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  passport_series: string;

  @ApiProperty({
    example: "12345678901234",
    description: "JSHSHIR (Personal identification number)",
  })
  @IsString()
  @IsNotEmpty()
  JSHSHIR: string;

  @ApiProperty({
    example: 1,
    description: "ID of the study form",
  })
  @IsNumber()
  @IsNotEmpty()
  study_form_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the education type",
  })
  @IsNumber()
  @IsNotEmpty()
  education_type_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the contract type",
  })
  @IsNumber()
  @IsNotEmpty()
  contract_type_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the group",
  })
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the faculty",
  })
  @IsNumber()
  @IsNotEmpty()
  faculty_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the housing type",
  })
  @IsNumber()
  @IsNotEmpty()
  housing_type_id: number;

  @ApiProperty({
    example: 2024,
    description: "Year when student joined the university",
    minimum: 2000,
    maximum: 2030,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(2000)
  @Max(2030)
  join_year: number;

  @ApiPropertyOptional({
    example: "ACTIVE",
    description: "Status of the student",
    enum: [
      "ACTIVE",
      "ACADEMIC_LEAVE",
      "GRADUATED",
      "EXPELLED",
      "TRANSFERRED",
      "",
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    "ACTIVE",
    "ACADEMIC_LEAVE",
    "GRADUATED",
    "EXPELLED",
    "TRANSFERRED",
    "",
  ])
  status?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the dormitory room",
  })
  @IsOptional()
  @IsNumber()
  dormitory_room_id?: number;
}
