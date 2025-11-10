import { PartialType } from '@nestjs/swagger';
import { CreateStudyFormDto } from './create-study_form.dto';

export class UpdateStudyFormDto extends PartialType(CreateStudyFormDto) {}
