import { IsNumber, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTeacherSubjectDto {
  @ApiProperty({
    example: 1,
    description: "ID of the teacher",
  })
  @IsNumber()
  @IsNotEmpty()
  teacher_id: number;

  @ApiProperty({
    example: 1,
    description: "ID of the subject",
  })
  @IsNumber()
  @IsNotEmpty()
  subject_id: number;
}
