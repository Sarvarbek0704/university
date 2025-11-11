import { IsString, IsNumber, Min, Max, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MonthlyReportDto {
  @ApiProperty({
    example: "JANUARY",
    description: "Month for report",
    enum: [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ],
  })
  @IsString()
  @IsNotEmpty()
  month: string;

  @ApiProperty({
    example: 2024,
    description: "Year for report",
    minimum: 2000,
    maximum: 2030,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(2000)
  @Max(2030)
  year: number;
}
