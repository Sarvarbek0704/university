import { PartialType } from '@nestjs/swagger';
import { CreateEducationTypeDto } from './create-education_type.dto';

export class UpdateEducationTypeDto extends PartialType(CreateEducationTypeDto) {}
