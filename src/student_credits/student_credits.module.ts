import { Module } from '@nestjs/common';
import { StudentCreditsService } from './student_credits.service';
import { StudentCreditsController } from './student_credits.controller';

@Module({
  controllers: [StudentCreditsController],
  providers: [StudentCreditsService],
})
export class StudentCreditsModule {}
