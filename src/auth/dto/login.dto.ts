import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    example: "admin@university.uz",
    description: "Email address for login",
    maxLength: 100,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    example: "password123",
    description: "Password for login",
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
