import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Min,
  Max,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateClassroomDto {
  @ApiProperty({
    example: 1,
    description: "Building number where classroom is located",
    minimum: 1,
    maximum: 20,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(20)
  building_number: number;

  @ApiProperty({
    example: 101,
    description: "Room number",
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  room_number: number;

  @ApiPropertyOptional({
    example: 30,
    description: "Capacity of the classroom",
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  capacity?: number;

  @ApiProperty({
    example: "standart_class",
    description: "Type of classroom",
    enum: [
      "lecture_hall",
      "standart_class",
      "seminar_room",
      "computer_lab",
      "science_lab",
      "workshop",
      "conference_room",
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    "lecture_hall",
    "standart_class",
    "seminar_room",
    "computer_lab",
    "science_lab",
    "workshop",
    "conference_room",
  ])
  type: string;

  @ApiPropertyOptional({
    example: "Projector, Whiteboard, Computers",
    description: "Available equipment in the classroom",
  })
  @IsOptional()
  @IsString()
  equipment?: string;

  @ApiPropertyOptional({
    example: "Second floor, near main staircase",
    description: "Location description",
  })
  @IsOptional()
  @IsString()
  location_description?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the classroom has air conditioning",
  })
  @IsOptional()
  @IsBoolean()
  has_air_conditioning?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the classroom has projector",
  })
  @IsOptional()
  @IsBoolean()
  has_projector?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the classroom has computers",
  })
  @IsOptional()
  @IsBoolean()
  has_computers?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the classroom is wheelchair accessible",
  })
  @IsOptional()
  @IsBoolean()
  is_accessible?: boolean;
}
