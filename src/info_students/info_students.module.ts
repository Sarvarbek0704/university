import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { InfoStudentsService } from "./info_students.service";
import { InfoStudentsController } from "./info_students.controller";
import { InfoStudent } from "./models/info_student.model";
import { Student } from "../students/models/student.model";
import { StudyForm } from "../study_forms/models/study_form.model";
import { EducationType } from "../education_types/models/education_type.model";
import { ContractType } from "../contract_types/models/contract_type.model";
import { Group } from "../groups/models/group.model";
import { Faculty } from "../faculties/models/faculty.model";
import { HousingType } from "../housing_types/models/housing_type.model";
import { DormitoryRoom } from "../dormitories/models/dormitory-room.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      InfoStudent,
      Student,
      StudyForm,
      EducationType,
      ContractType,
      Group,
      Faculty,
      HousingType,
      DormitoryRoom,
    ]),
  ],
  controllers: [InfoStudentsController],
  providers: [InfoStudentsService],
  exports: [InfoStudentsService],
})
export class InfoStudentsModule {}
