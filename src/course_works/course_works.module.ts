import { Module } from '@nestjs/common';
import { CourseWorksService } from './course_works.service';
import { CourseWorksController } from './course_works.controller';

@Module({
  controllers: [CourseWorksController],
  providers: [CourseWorksService],
})
export class CourseWorksModule {}
