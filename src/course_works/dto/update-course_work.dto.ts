import { PartialType } from '@nestjs/swagger';
import { CreateCourseWorkDto } from './create-course_work.dto';

export class UpdateCourseWorkDto extends PartialType(CreateCourseWorkDto) {}
