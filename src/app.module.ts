import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { DepartmentsModule } from "./departments/departments.module";
import { FacultiesModule } from "./faculties/faculties.module";
import { GroupsModule } from "./groups/groups.module";
import { StudentsModule } from "./students/students.module";
import { TeachersModule } from "./teachers/teachers.module";
import { SubjectsModule } from "./subjects/subjects.module";
import { SchedulesModule } from "./schedules/schedules.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { ExamsModule } from "./exams/exams.module";
import { PaymentsModule } from "./payments/payments.module";
import { ScholarshipsModule } from "./scholarships/scholarships.module";
import { DormitoriesModule } from "./dormitories/dormitories.module";
import { DormitoryRoomsModule } from "./dormitory_rooms/dormitory_rooms.module";
import { ClassroomsModule } from "./classrooms/classrooms.module";
import { StudyFormsModule } from "./study_forms/study_forms.module";
import { EducationTypesModule } from "./education_types/education_types.module";
import { ContractTypesModule } from "./contract_types/contract_types.module";
import { HousingTypesModule } from "./housing_types/housing_types.module";
import { InfoStudentsModule } from "./info_students/info_students.module";
import { PaymentTypesModule } from "./payment_types/payment_types.module";
import { RentContractsModule } from "./rent_contracts/rent_contracts.module";
import { InstallmentsModule } from "./installments/installments.module";
import { ScolarshipTransactionsModule } from "./scolarship_transactions/scolarship_transactions.module";
import { ExamResultsModule } from "./exam_results/exam_results.module";
import { ExamAttemptsModule } from "./exam_attempts/exam_attempts.module";
import { FailedSubjectsModule } from "./failed_subjects/failed_subjects.module";
import { PrerequisitesModule } from "./prerequisites/prerequisites.module";
import { StudentCreditsModule } from "./student_credits/student_credits.module";
import { BorrowedBooksModule } from "./borrowed_books/borrowed_books.module";
import { LibraryBooksModule } from "./library_books/library_books.module";
import { InternshipsModule } from "./internships/internships.module";
import { CourseWorksModule } from "./course_works/course_works.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { TeacherSubjectsModule } from "./teacher_subjects/teacher_subjects.module";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { Admin } from "./admin/models/admin.model";
import { DatabaseModule } from "./database/database.module";
import { Department } from "./departments/models/department.model";
import { Faculty } from "./faculties/models/faculty.model";
import { CommonModule } from "./common/common.module";
import { CustomLogger } from "./common/services/logger.service";
import { Teacher } from "./teachers/models/teacher.model";
import { Student } from "./students/models/student.model";

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT!) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "university_management",
      models: [Admin, Department, Faculty, Student, Teacher],
      autoLoadModels: true,
      synchronize: process.env.DB_SYNC === "true" || true,
      logging: console.log,
    }),
    AuthModule,
    AdminModule,
    DepartmentsModule,
    FacultiesModule,
    GroupsModule,
    StudentsModule,
    TeachersModule,
    SubjectsModule,
    SchedulesModule,
    AttendanceModule,
    ExamsModule,
    PaymentsModule,
    ScholarshipsModule,
    DormitoriesModule,
    DormitoryRoomsModule,
    ClassroomsModule,
    StudyFormsModule,
    EducationTypesModule,
    ContractTypesModule,
    HousingTypesModule,
    InfoStudentsModule,
    PaymentTypesModule,
    RentContractsModule,
    InstallmentsModule,
    ScolarshipTransactionsModule,
    ExamResultsModule,
    ExamAttemptsModule,
    FailedSubjectsModule,
    PrerequisitesModule,
    StudentCreditsModule,
    BorrowedBooksModule,
    LibraryBooksModule,
    InternshipsModule,
    CourseWorksModule,
    NotificationsModule,
    TeacherSubjectsModule,
    DatabaseModule,
  ],
  providers: [CustomLogger],
  exports: [CustomLogger],
})
export class AppModule {}
