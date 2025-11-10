import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { GroupsService } from "./groups.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { FilterGroupDto } from "./dto/filter-group.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("groups")
@ApiBearerAuth("JWT-auth")
@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new group" })
  @ApiResponse({ status: 201, description: "Group created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @ApiResponse({
    status: 409,
    description: "Group name already exists in this department",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all groups with filtering" })
  @ApiResponse({ status: 200, description: "Return all groups" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterGroupDto) {
    return this.groupsService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get groups statistics" })
  @ApiResponse({ status: 200, description: "Return groups count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.groupsService.getGroupsCount();
  }

  @Get("department/:departmentId")
  @ApiOperation({ summary: "Get groups by department ID" })
  @ApiParam({
    name: "departmentId",
    type: Number,
    description: "Department ID",
  })
  @ApiResponse({ status: 200, description: "Return groups for department" })
  @ApiResponse({ status: 400, description: "Invalid department ID" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByDepartment(
    @Param("departmentId", ParseIntPipe) departmentId: number
  ) {
    return this.groupsService.findByDepartment(departmentId);
  }

  @Get("course/:courseNumber")
  @ApiOperation({ summary: "Get groups by course number" })
  @ApiParam({
    name: "courseNumber",
    type: Number,
    description: "Course number",
  })
  @ApiResponse({ status: 200, description: "Return groups for course" })
  @ApiResponse({ status: 400, description: "Invalid course number" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByCourse(
    @Param("courseNumber", ParseIntPipe) courseNumber: number
  ) {
    return this.groupsService.findByCourse(courseNumber);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get group by ID" })
  @ApiParam({ name: "id", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Return group" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Get(":id/with-students")
  @ApiOperation({ summary: "Get group with students" })
  @ApiParam({ name: "id", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Return group with students" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getGroupWithStudents(@Param("id", ParseIntPipe) id: number) {
    return this.groupsService.getGroupWithStudents(id);
  }

  @Get(":id/with-schedules")
  @ApiOperation({ summary: "Get group with schedules" })
  @ApiParam({ name: "id", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Return group with schedules" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getGroupWithSchedules(@Param("id", ParseIntPipe) id: number) {
    return this.groupsService.getGroupWithSchedules(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update group" })
  @ApiParam({ name: "id", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Group updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({
    status: 409,
    description: "Group name already exists in this department",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete group" })
  @ApiParam({ name: "id", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Group deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.groupsService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle group active status" })
  @ApiParam({ name: "id", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.groupsService.toggleStatus(id);
  }
}
