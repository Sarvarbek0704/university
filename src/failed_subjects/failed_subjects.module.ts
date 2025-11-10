import { Module } from '@nestjs/common';
import { FailedSubjectsService } from './failed_subjects.service';
import { FailedSubjectsController } from './failed_subjects.controller';

@Module({
  controllers: [FailedSubjectsController],
  providers: [FailedSubjectsService],
})
export class FailedSubjectsModule {}
