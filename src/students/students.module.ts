import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StudentService } from "./students.service";
import { StudentController } from "./students.controller";
import { Student } from "./models/student.model";
import { GroupsModule } from "../groups/groups.module";

@Module({
  imports: [SequelizeModule.forFeature([Student]), GroupsModule],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentsModule {}
