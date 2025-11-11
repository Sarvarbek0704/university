import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StudentCreditsService } from "./student_credits.service";
import { StudentCreditsController } from "./student_credits.controller";
import { StudentCredit } from "./models/student_credit.model";
import { Student } from "../students/models/student.model";
import { ExamResult } from "../exam_results/models/exam_result.model";
import { Subject } from "../subjects/models/subject.model";

@Module({
  imports: [
    SequelizeModule.forFeature([StudentCredit, Student, ExamResult, Subject]),
  ],
  controllers: [StudentCreditsController],
  providers: [StudentCreditsService],
  exports: [StudentCreditsService],
})
export class StudentCreditsModule {}
