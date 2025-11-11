import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ReturnBookDto {
  @ApiPropertyOptional({
    example: "Book in good condition",
    description: "Return notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
