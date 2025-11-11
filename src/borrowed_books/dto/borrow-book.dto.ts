import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BorrowBookDto {
  @ApiProperty({ example: 1, description: "Student ID" })
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({ example: 1, description: "Book ID" })
  @IsNumber()
  @IsNotEmpty()
  book_id: number;

  @ApiPropertyOptional({ example: "2024-02-01", description: "Due date" })
  @IsOptional()
  @IsDateString()
  due_date?: string;
}
