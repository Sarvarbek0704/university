import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordRequestDto {
  @ApiProperty({ example: "user@university.uz" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
