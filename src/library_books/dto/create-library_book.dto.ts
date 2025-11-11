import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateLibraryBookDto {
  @ApiProperty({
    example: "Introduction to Algorithms",
    description: "Book title",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "Thomas H. Cormen", description: "Book author" })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({ example: "978-0262033848", description: "ISBN number" })
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @ApiProperty({
    example: "TEXTBOOK",
    description: "Book category",
    enum: ["TEXTBOOK", "REFERENCE", "FICTION", "NON_FICTION", "RESEARCH"],
  })
  @IsEnum(["TEXTBOOK", "REFERENCE", "FICTION", "NON_FICTION", "RESEARCH"])
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 2020, description: "Publication year" })
  @IsNumber()
  @Min(1900)
  year: number;

  @ApiPropertyOptional({ example: 5, description: "Total copies available" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  total_copies?: number;
}
