import { PartialType } from '@nestjs/swagger';
import { CreateInfoStudentDto } from './create-info_student.dto';

export class UpdateInfoStudentDto extends PartialType(CreateInfoStudentDto) {}
