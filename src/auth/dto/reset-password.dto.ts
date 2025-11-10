import { IsString, MinLength, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({ example: "newPassword123" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;

  @ApiProperty({ example: "reset_token_here" })
  @IsString()
  @IsNotEmpty()
  reset_token: string;
}
