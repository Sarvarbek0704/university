import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Student } from "../students/models/student.model";
import { ScholarshipTransaction } from "./models/scolarship_transaction.model";
import { ScholarshipTransactionsController } from "./scolarship_transactions.controller";
import { ScholarshipTransactionsService } from "./scolarship_transactions.service";
import { Scholarship } from "../scholarships/models/scholarship.model";

@Module({
  imports: [
    SequelizeModule.forFeature([ScholarshipTransaction, Student, Scholarship]),
  ],
  controllers: [ScholarshipTransactionsController],
  providers: [ScholarshipTransactionsService],
  exports: [ScholarshipTransactionsService],
})
export class ScholarshipTransactionsModule {}
