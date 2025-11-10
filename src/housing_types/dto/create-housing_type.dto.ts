import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateHousingTypeDto {
  @ApiProperty({
    example: "DORMITORY",
    description: "Name of the housing type",
    enum: ["DORMITORY", "APARTMENT", "STUDIO", "FAMILY_HOUSING"],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["DORMITORY", "APARTMENT", "STUDIO", "FAMILY_HOUSING"])
  name: string;

  @ApiPropertyOptional({
    example: "University dormitory accommodation",
    description: "Description of the housing type",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
