import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { InternshipsService } from "./internships.service";
import { InternshipsController } from "./internships.controller";
import { Internship } from "./models/internship.model";
import { Student } from "../students/models/student.model";

@Module({
  imports: [SequelizeModule.forFeature([Internship, Student])],
  controllers: [InternshipsController],
  providers: [InternshipsService],
  exports: [InternshipsService],
})
export class InternshipsModule {}
