import { Module } from '@nestjs/common';
import { ExamAttemptsService } from './exam_attempts.service';
import { ExamAttemptsController } from './exam_attempts.controller';

@Module({
  controllers: [ExamAttemptsController],
  providers: [ExamAttemptsService],
})
export class ExamAttemptsModule {}
