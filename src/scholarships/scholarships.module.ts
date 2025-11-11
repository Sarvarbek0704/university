import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ScholarshipsService } from "./scholarships.service";
import { ScholarshipsController } from "./scholarships.controller";
import { Scholarship } from "./models/scholarship.model";
import { Student } from "../students/models/student.model";

@Module({
  imports: [SequelizeModule.forFeature([Scholarship, Student])],
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService],
  exports: [ScholarshipsService],
})
export class ScholarshipsModule {}
