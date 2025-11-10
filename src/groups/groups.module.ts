import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { GroupsService } from "./groups.service";
import { GroupsController } from "./groups.controller";
import { Group } from "./models/group.model";
import { Department } from "../departments/models/department.model";

@Module({
  imports: [SequelizeModule.forFeature([Group, Department])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
