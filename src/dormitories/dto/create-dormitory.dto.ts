import {
  IsString,
  IsNumber,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  Min,
  Max,
  IsPhoneNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateDormitoryDto {
  @ApiProperty({
    example: "Yosh Talabalar Yotoqxonasi №1",
    description: "Name of the dormitory",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: "Toshkent shahar, Yunusobod tumani, 12-uy",
    description: "Address of the dormitory",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiProperty({
    example: 500,
    description: "Total capacity of the dormitory",
    minimum: 1,
    maximum: 5000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5000)
  capacity: number;

  @ApiPropertyOptional({
    example: "+998901234567",
    description: "Contact phone number for the dormitory",
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    example: "dorm1@university.uz",
    description: "Contact email for the dormitory",
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: "Yunusobod tumanidagi asosiy yotoqxona",
    description: "Description of the dormitory",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: "MUSTAQILLIK KO'CHASI 12",
    description: "Location details or landmark",
  })
  @IsOptional()
  @IsString()
  location_details?: string;

  @ApiPropertyOptional({
    example: 4,
    description: "Number of floors in the dormitory",
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  floors_count?: number;

  @ApiPropertyOptional({
    example: "2020",
    description: "Year when dormitory was built",
  })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  built_year?: string;
}
