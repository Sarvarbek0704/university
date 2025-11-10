import { Module } from '@nestjs/common';
import { ExamResultsService } from './exam_results.service';
import { ExamResultsController } from './exam_results.controller';

@Module({
  controllers: [ExamResultsController],
  providers: [ExamResultsService],
})
export class ExamResultsModule {}
