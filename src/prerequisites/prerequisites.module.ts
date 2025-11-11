import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PrerequisitesService } from "./prerequisites.service";
import { PrerequisitesController } from "./prerequisites.controller";
import { Prerequisite } from "./models/prerequisite.model";
import { Subject } from "../subjects/models/subject.model";
import { Student } from "../students/models/student.model";
import { ExamResult } from "../exam_results/models/exam_result.model";
import { Group } from "../groups/models/group.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Prerequisite,
      Subject,
      Student,
      ExamResult,
      Group,
    ]),
  ],
  controllers: [PrerequisitesController],
  providers: [PrerequisitesService],
  exports: [PrerequisitesService],
})
export class PrerequisitesModule {}
