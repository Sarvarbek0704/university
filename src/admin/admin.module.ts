import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { Admin } from "./models/admin.model";

@Module({
  imports: [SequelizeModule.forFeature([Admin])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
