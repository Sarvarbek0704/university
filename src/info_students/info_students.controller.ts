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
import { InfoStudentsService } from "./info_students.service";
import { CreateInfoStudentDto } from "./dto/create-info_student.dto";
import { UpdateInfoStudentDto } from "./dto/update-info_student.dto";
import { FilterInfoStudentDto } from "./dto/filter-info-student.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("info-students")
@ApiBearerAuth("JWT-auth")
@Controller("info-students")
export class InfoStudentsController {
  constructor(private readonly infoStudentsService: InfoStudentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create student information" })
  @ApiResponse({
    status: 201,
    description: "Student information created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Related entity not found" })
  @ApiResponse({
    status: 409,
    description: "Student information already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createInfoStudentDto: CreateInfoStudentDto) {
    return this.infoStudentsService.create(createInfoStudentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all student information with filtering" })
  @ApiResponse({ status: 200, description: "Return all student information" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterInfoStudentDto) {
    return this.infoStudentsService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get student information statistics" })
  @ApiResponse({ status: 200, description: "Return student information count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.infoStudentsService.getInfoStudentsCount();
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get student information by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return student information" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student information not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.infoStudentsService.findByStudent(studentId);
  }

  @Get("group/:groupId")
  @ApiOperation({ summary: "Get students information by group ID" })
  @ApiParam({ name: "groupId", type: Number, description: "Group ID" })
  @ApiResponse({
    status: 200,
    description: "Return students information for group",
  })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByGroup(@Param("groupId", ParseIntPipe) groupId: number) {
    return this.infoStudentsService.findByGroup(groupId);
  }

  @Get("faculty/:facultyId")
  @ApiOperation({ summary: "Get students information by faculty ID" })
  @ApiParam({ name: "facultyId", type: Number, description: "Faculty ID" })
  @ApiResponse({
    status: 200,
    description: "Return students information for faculty",
  })
  @ApiResponse({ status: 400, description: "Invalid faculty ID" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByFaculty(@Param("facultyId", ParseIntPipe) facultyId: number) {
    return this.infoStudentsService.findByFaculty(facultyId);
  }

  @Get("status/:status")
  @ApiOperation({ summary: "Get students information by status" })
  @ApiParam({ name: "status", type: String, description: "Student status" })
  @ApiResponse({
    status: 200,
    description: "Return students information by status",
  })
  @ApiResponse({ status: 400, description: "Invalid status" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStatus(@Param("status") status: string) {
    return this.infoStudentsService.findByStatus(status);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get student information by ID" })
  @ApiParam({ name: "id", type: Number, description: "Info student ID" })
  @ApiResponse({ status: 200, description: "Return student information" })
  @ApiResponse({ status: 400, description: "Invalid info student ID" })
  @ApiResponse({ status: 404, description: "Student information not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.infoStudentsService.findOne(id);
  }

  @Get(":id/full")
  @ApiOperation({ summary: "Get full student information with all relations" })
  @ApiParam({ name: "id", type: Number, description: "Info student ID" })
  @ApiResponse({ status: 200, description: "Return full student information" })
  @ApiResponse({ status: 400, description: "Invalid info student ID" })
  @ApiResponse({ status: 404, description: "Student information not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOneFull(@Param("id", ParseIntPipe) id: number) {
    return this.infoStudentsService.findOneFull(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update student information" })
  @ApiParam({ name: "id", type: Number, description: "Info student ID" })
  @ApiResponse({
    status: 200,
    description: "Student information updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Student information not found" })
  @ApiResponse({
    status: 409,
    description: "Passport series or JSHSHIR already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateInfoStudentDto: UpdateInfoStudentDto
  ) {
    return this.infoStudentsService.update(id, updateInfoStudentDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete student information" })
  @ApiParam({ name: "id", type: Number, description: "Info student ID" })
  @ApiResponse({
    status: 200,
    description: "Student information deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid info student ID" })
  @ApiResponse({ status: 404, description: "Student information not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.infoStudentsService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle student information active status" })
  @ApiParam({ name: "id", type: Number, description: "Info student ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid info student ID" })
  @ApiResponse({ status: 404, description: "Student information not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.infoStudentsService.toggleStatus(id);
  }

  @Patch(":id/change-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Change student status" })
  @ApiParam({ name: "id", type: Number, description: "Info student ID" })
  @ApiResponse({
    status: 200,
    description: "Student status updated successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid info student ID or status",
  })
  @ApiResponse({ status: 404, description: "Student information not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async changeStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: string
  ) {
    return this.infoStudentsService.changeStatus(id, status);
  }
}
