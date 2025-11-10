import { PartialType } from '@nestjs/swagger';
import { CreatePrerequisiteDto } from './create-prerequisite.dto';

export class UpdatePrerequisiteDto extends PartialType(CreatePrerequisiteDto) {}
