import { PartialType } from '@nestjs/swagger';
import { CreateFailedSubjectDto } from './create-failed_subject.dto';

export class UpdateFailedSubjectDto extends PartialType(CreateFailedSubjectDto) {}
