import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  IsOptional,
  IsEnum,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateDormitoryRoomDto {
  @ApiProperty({
    example: 1,
    description: "ID of the dormitory this room belongs to",
  })
  @IsNumber()
  @IsNotEmpty()
  dormitory_id: number;

  @ApiProperty({
    example: 101,
    description: "Room number",
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(9999)
  room_number: number;

  @ApiProperty({
    example: 4,
    description: "Number of beds in the room",
    minimum: 1,
    maximum: 6,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(6)
  beds_count: number;

  @ApiPropertyOptional({
    example: 2,
    description: "Floor number where room is located",
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  floor?: number;

  @ApiPropertyOptional({
    example: "STANDARD",
    description: "Room type/comfort level",
    enum: ["STANDARD", "COMFORT", "LUXURY", "SUPERIOR"],
  })
  @IsOptional()
  @IsString()
  @IsEnum(["STANDARD", "COMFORT", "LUXURY", "SUPERIOR"])
  room_type?: string;

  @ApiPropertyOptional({
    example: 500000,
    description: "Monthly rent price for the room",
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthly_rent?: number;

  @ApiPropertyOptional({
    example: "Newly renovated room with balcony",
    description: "Description of the room",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ["WiFi", "Air conditioner", "Fridge"],
    description: "Available amenities in the room",
  })
  @IsOptional()
  @IsString()
  amenities?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the room is currently available",
  })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean = true;
}
