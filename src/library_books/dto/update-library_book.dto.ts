import { IsString, IsOptional, IsNumber, IsEnum, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateLibraryBookDto {
  @ApiPropertyOptional({
    example: "Advanced Algorithms",
    description: "Book title",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: "Thomas H. Cormen",
    description: "Book author",
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ example: "TEXTBOOK", description: "Book category" })
  @IsOptional()
  @IsEnum(["TEXTBOOK", "REFERENCE", "FICTION", "NON_FICTION", "RESEARCH"])
  category?: string;

  @ApiPropertyOptional({ example: 2021, description: "Publication year" })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  year?: number;

  @ApiPropertyOptional({ example: 10, description: "Total copies" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  total_copies?: number;
}
