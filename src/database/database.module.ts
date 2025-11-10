import { Module, OnModuleInit, Logger } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SuperAdminSeeder } from "./seeders/super-admin.seeder";

import { Faculty } from "../faculties/models/faculty.model";
import { Department } from "../departments/models/department.model";
import { Admin } from "../admin/models/admin.model";
import { Teacher } from "../teachers/models/teacher.model";
import { Student } from "../students/models/student.model";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: "postgres",
        host: configService.get("DB_HOST") || "localhost",
        port: configService.get("DB_PORT") || 5432,
        username: configService.get("DB_USERNAME") || "postgres",
        password: configService.get("DB_PASSWORD") || "password",
        database: configService.get("DB_NAME") || "university_management",
        models: [Faculty, Department, Admin, Teacher, Student],
        autoLoadModels: true,
        synchronize: configService.get("DB_SYNC") === "true",
        logging:
          configService.get("DB_LOGGING") === "true" ? console.log : false,
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
      this.logger.log("Database module initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize database module", error.stack);
      throw error;
    }
  }
}
