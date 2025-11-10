import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Body,
} from "@nestjs/common";
import { TeacherService } from "./teachers.service";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { FilterTeacherDto } from "./dto/filter-teacher.dto";

@ApiTags("teachers")
@ApiBearerAuth("JWT-auth")
@Controller("teachers")
export class TeacherController {
  constructor(private readonly teachersService: TeacherService) {}

  @Get()
  @ApiOperation({ summary: "Get all teachers with filtering" })
  @ApiResponse({ status: 200, description: "Return all teachers" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterTeacherDto) {
    return this.teachersService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get teachers statistics" })
  @ApiResponse({ status: 200, description: "Return teachers count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.teachersService.getTeachersCount();
  }

  @Get("department/:departmentId")
  @ApiOperation({ summary: "Get teachers by department" })
  @ApiParam({
    name: "departmentId",
    type: Number,
    description: "Department ID",
  })
  @ApiResponse({ status: 200, description: "Return teachers for department" })
  @ApiResponse({ status: 400, description: "Invalid department ID" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByDepartment(
    @Param("departmentId", ParseIntPipe) departmentId: number
  ) {
    return this.teachersService.getTeachersCountByDepartment(departmentId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get teacher by ID" })
  @ApiParam({ name: "id", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Return teacher" })
  @ApiResponse({ status: 400, description: "Invalid teacher ID" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(":id")
  @ApiOperation({ summary: "Update teacher" })
  @ApiParam({ name: "id", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Teacher updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 409, description: "Email or phone already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto
  ) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(":id/approve")
  @ApiOperation({ summary: "Approve teacher account" })
  @ApiParam({ name: "id", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Teacher approved successfully" })
  @ApiResponse({ status: 400, description: "Invalid teacher ID" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async approveTeacher(@Param("id", ParseIntPipe) id: number) {
    return this.teachersService.approveTeacher(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete teacher" })
  @ApiParam({ name: "id", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Teacher deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid teacher ID" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.teachersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Toggle teacher active status" })
  @ApiParam({ name: "id", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid teacher ID" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.teachersService.toggleStatus(id);
  }
}
