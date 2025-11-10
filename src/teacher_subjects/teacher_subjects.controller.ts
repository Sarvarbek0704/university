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
import { TeacherSubjectsService } from "./teacher_subjects.service";
import { CreateTeacherSubjectDto } from "./dto/create-teacher_subject.dto";
import { UpdateTeacherSubjectDto } from "./dto/update-teacher_subject.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("teacher-subjects")
@ApiBearerAuth("JWT-auth")
@Controller("teacher-subjects")
export class TeacherSubjectsController {
  constructor(
    private readonly teacherSubjectsService: TeacherSubjectsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Assign subject to teacher" })
  @ApiResponse({
    status: 201,
    description: "Subject assigned to teacher successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Teacher or subject not found" })
  @ApiResponse({ status: 409, description: "Teacher already has this subject" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createTeacherSubjectDto: CreateTeacherSubjectDto) {
    return this.teacherSubjectsService.create(createTeacherSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all teacher-subject assignments" })
  @ApiResponse({
    status: 200,
    description: "Return all teacher-subject assignments",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll() {
    return this.teacherSubjectsService.findAll();
  }

  @Get("teacher/:teacherId")
  @ApiOperation({ summary: "Get subjects by teacher ID" })
  @ApiParam({ name: "teacherId", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Return subjects for teacher" })
  @ApiResponse({ status: 400, description: "Invalid teacher ID" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByTeacher(@Param("teacherId", ParseIntPipe) teacherId: number) {
    return this.teacherSubjectsService.findByTeacher(teacherId);
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get teachers by subject ID" })
  @ApiParam({ name: "subjectId", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Return teachers for subject" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findBySubject(@Param("subjectId", ParseIntPipe) subjectId: number) {
    return this.teacherSubjectsService.findBySubject(subjectId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get teacher-subject assignment by ID" })
  @ApiParam({ name: "id", type: Number, description: "Teacher-Subject ID" })
  @ApiResponse({
    status: 200,
    description: "Return teacher-subject assignment",
  })
  @ApiResponse({ status: 400, description: "Invalid ID" })
  @ApiResponse({ status: 404, description: "Assignment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.teacherSubjectsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update teacher-subject assignment" })
  @ApiParam({ name: "id", type: Number, description: "Teacher-Subject ID" })
  @ApiResponse({ status: 200, description: "Assignment updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Assignment not found" })
  @ApiResponse({ status: 409, description: "Teacher already has this subject" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTeacherSubjectDto: UpdateTeacherSubjectDto
  ) {
    return this.teacherSubjectsService.update(id, updateTeacherSubjectDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove subject from teacher" })
  @ApiParam({ name: "id", type: Number, description: "Teacher-Subject ID" })
  @ApiResponse({
    status: 200,
    description: "Subject removed from teacher successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid ID" })
  @ApiResponse({ status: 404, description: "Assignment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.teacherSubjectsService.remove(id);
  }

  @Delete("teacher/:teacherId/subject/:subjectId")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove specific subject from teacher" })
  @ApiParam({ name: "teacherId", type: Number, description: "Teacher ID" })
  @ApiParam({ name: "subjectId", type: Number, description: "Subject ID" })
  @ApiResponse({
    status: 200,
    description: "Subject removed from teacher successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid IDs" })
  @ApiResponse({ status: 404, description: "Assignment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async removeByTeacherAndSubject(
    @Param("teacherId", ParseIntPipe) teacherId: number,
    @Param("subjectId", ParseIntPipe) subjectId: number
  ) {
    return this.teacherSubjectsService.removeByTeacherAndSubject(
      teacherId,
      subjectId
    );
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle teacher-subject assignment status" })
  @ApiParam({ name: "id", type: Number, description: "Teacher-Subject ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid ID" })
  @ApiResponse({ status: 404, description: "Assignment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.teacherSubjectsService.toggleStatus(id);
  }
}
