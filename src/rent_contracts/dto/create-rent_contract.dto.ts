import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Min,
  Max,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRentContractDto {
  @ApiProperty({
    example: 1,
    description: "ID of the student",
  })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: "Toshkent shahar, Yunusobod tumani, 12-uy, 25-xonadon",
    description: "Address of the rented property",
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 1500000.0,
    description: "Monthly rent amount",
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monthly_rent: number;

  @ApiProperty({
    example: 30,
    description: "University support percentage",
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  university_support_percent: number;

  @ApiProperty({
    example: "2024-09-01",
    description: "Start date of the contract",
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    example: "2025-06-30",
    description: "End date of the contract",
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({
    example: "Ali Valiyev",
    description: "Name of the landlord",
  })
  @IsString()
  @IsNotEmpty()
  landlord_name: string;

  @ApiPropertyOptional({
    example: "+998901234567",
    description: "Landlord phone number",
  })
  @IsOptional()
  @IsString()
  landlord_phone?: string;

  @ApiPropertyOptional({
    example: "2 xonali kvartira, yangi ta'mirlangan",
    description: "Description of the property",
  })
  @IsOptional()
  @IsString()
  property_description?: string;

  @ApiPropertyOptional({
    example: "AC1234567",
    description: "Contract number",
  })
  @IsOptional()
  @IsString()
  contract_number?: string;

  @ApiPropertyOptional({
    example: "ACTIVE",
    description: "Status of the contract",
    enum: ["ACTIVE", "EXPIRED", "TERMINATED", "PENDING"],
  })
  @IsOptional()
  @IsString()
  status?: string;
}
