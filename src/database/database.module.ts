import { Module, OnModuleInit, Logger } from "@nestjs/common";
import { SequelizeModule, SequelizeModuleOptions } from "@nestjs/sequelize";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SuperAdminSeeder } from "./seeders/super-admin.seeder";

import { Faculty } from "../faculties/models/faculty.model";
import { Department } from "../departments/models/department.model";
import { Admin } from "../admin/models/admin.model";
import { Teacher } from "../teachers/models/teacher.model";
import { Student } from "../students/models/student.model";
import { TeacherSubject } from "../teacher_subjects/models/teacher_subject.model";
import { Dormitory } from "../dormitories/models/dormitory.model";
import { DormitoryRoom } from "../dormitories/models/dormitory-room.model";
import { Classroom } from "../classrooms/models/classroom.model";
import { Group } from "../groups/models/group.model";
import { Subject } from "../subjects/models/subject.model";
import { StudyForm } from "../study_forms/models/study_form.model";
import { EducationType } from "../education_types/models/education_type.model";
import { ContractType } from "../contract_types/models/contract_type.model";
import { HousingType } from "../housing_types/models/housing_type.model";
import { InfoStudent } from "../info_students/models/info_student.model";
import { Payment } from "../payments/models/payment.model";
import { PaymentType } from "../payment_types/models/payment_type.model";
import { RentContract } from "../rent_contracts/models/rent_contract.model";
import { Installment } from "../installments/models/installment.model";
import { ScholarshipTransaction } from "../scolarship_transactions/models/scolarship_transaction.model";
import { Scholarship } from "../scholarships/models/scholarship.model";
import { Schedule } from "../schedules/models/schedule.model";
import { Attendance } from "../attendance/models/attendance.model";
import { Exam } from "../exams/models/exam.model";
import { ExamResult } from "../exam_results/models/exam_result.model";
import { ExamAttempt } from "../exam_attempts/models/exam_attempt.model";
import { FailedSubject } from "../failed_subjects/models/failed_subject.model";
import { Prerequisite } from "../prerequisites/models/prerequisite.model";
import { StudentCredit } from "../student_credits/models/student_credit.model";
import { BorrowedBook } from "../borrowed_books/models/borrowed_book.model";
import { LibraryBook } from "../library_books/models/library_book.model";
import { Internship } from "../internships/models/internship.model";
import { CourseWork } from "../course_works/models/course_work.model";
import { Notification } from "../notifications/models/notification.model"; // 🔥 Qo‘shib qo‘yilgan

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): SequelizeModuleOptions => ({
        dialect: "postgres",
        host: configService.get<string>("DB_HOST") || "localhost",
        port: Number(configService.get<string>("DB_PORT")) || 5432,
        username: configService.get<string>("DB_USERNAME") || "postgres",
        password: configService.get<string>("DB_PASSWORD") || "password",
        database:
          configService.get<string>("DB_NAME") || "university_management",
        models: [
          Faculty,
          Department,
          Admin,
          Teacher,
          Student,
          TeacherSubject,
          Dormitory,
          DormitoryRoom,
          Classroom,
          Group,
          Subject,
          StudyForm,
          EducationType,
          ContractType,
          HousingType,
          InfoStudent,
          Payment,
          PaymentType,
          RentContract,
          Installment,
          ScholarshipTransaction,
          Scholarship,
          Schedule,
          Attendance,
          Exam,
          ExamResult,
          ExamAttempt,
          FailedSubject,
          Prerequisite,
          StudentCredit,
          BorrowedBook,
          LibraryBook,
          Internship,
          CourseWork,
          Notification,
        ],
        autoLoadModels: true,
        synchronize: configService.get<string>("DB_SYNC") === "true",
        logging:
          configService.get<string>("DB_LOGGING") === "true"
            ? console.log
            : false,
        retryAttempts: 3,
        retryDelay: 3000,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SuperAdminSeeder],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly superAdminSeeder: SuperAdminSeeder) {}

  async onModuleInit() {
    try {
      await this.superAdminSeeder.seed();
      this.logger.log("✅ Database module initialized successfully");
    } catch (error) {
      this.logger.error("❌ Failed to initialize database module", error.stack);
      throw error;
    }
  }
}
