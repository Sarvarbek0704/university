import { IsString, MinLength, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @ApiProperty({ example: "oldPassword123" })
  @IsString()
  @IsNotEmpty()
  current_password: string;

  @ApiProperty({ example: "newPassword123" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}
