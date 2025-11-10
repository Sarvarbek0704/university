import { PartialType } from '@nestjs/swagger';
import { CreateStudentCreditDto } from './create-student_credit.dto';

export class UpdateStudentCreditDto extends PartialType(CreateStudentCreditDto) {}
