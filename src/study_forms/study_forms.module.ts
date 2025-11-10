import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StudyFormsService } from "./study_forms.service";
import { StudyFormsController } from "./study_forms.controller";
import { StudyForm } from "./models/study_form.model";

@Module({
  imports: [SequelizeModule.forFeature([StudyForm])],
  controllers: [StudyFormsController],
  providers: [StudyFormsService],
  exports: [StudyFormsService],
})
export class StudyFormsModule {}
