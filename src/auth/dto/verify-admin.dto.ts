import { IsNumber, IsBoolean, Min, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyAdminDto {
  @ApiProperty({
    example: 1,
    description: "ID of the admin to verify",
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  admin_id: number;

  @ApiProperty({
    example: true,
    description: "Approval status - true to approve, false to reject",
  })
  @IsBoolean()
  @IsNotEmpty()
  is_approved: boolean;
}
