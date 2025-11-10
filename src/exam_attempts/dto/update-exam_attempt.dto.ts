import { PartialType } from '@nestjs/swagger';
import { CreateExamAttemptDto } from './create-exam_attempt.dto';

export class UpdateExamAttemptDto extends PartialType(CreateExamAttemptDto) {}
