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
import { SubjectsService } from "./subjects.service";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { FilterSubjectDto } from "./dto/filter-subject.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("subjects")
@ApiBearerAuth("JWT-auth")
@Controller("subjects")
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new subject" })
  @ApiResponse({ status: 201, description: "Subject created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all subjects with filtering" })
  @ApiResponse({ status: 200, description: "Return all subjects" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterSubjectDto) {
    return this.subjectsService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get subjects statistics" })
  @ApiResponse({ status: 200, description: "Return subjects count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.subjectsService.getSubjectsCount();
  }

  @Get("department/:departmentId")
  @ApiOperation({ summary: "Get subjects by department ID" })
  @ApiParam({
    name: "departmentId",
    type: Number,
    description: "Department ID",
  })
  @ApiResponse({ status: 200, description: "Return subjects for department" })
  @ApiResponse({ status: 400, description: "Invalid department ID" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByDepartment(
    @Param("departmentId", ParseIntPipe) departmentId: number
  ) {
    return this.subjectsService.findByDepartment(departmentId);
  }

  @Get("semester/:semesterNumber")
  @ApiOperation({ summary: "Get subjects by semester number" })
  @ApiParam({
    name: "semesterNumber",
    type: Number,
    description: "Semester number",
  })
  @ApiResponse({ status: 200, description: "Return subjects for semester" })
  @ApiResponse({ status: 400, description: "Invalid semester number" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findBySemester(
    @Param("semesterNumber", ParseIntPipe) semesterNumber: number
  ) {
    return this.subjectsService.findBySemester(semesterNumber);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get subject by ID" })
  @ApiParam({ name: "id", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Return subject" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.subjectsService.findOne(id);
  }

  @Get(":id/with-teachers")
  @ApiOperation({ summary: "Get subject with teachers" })
  @ApiParam({ name: "id", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Return subject with teachers" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getSubjectWithTeachers(@Param("id", ParseIntPipe) id: number) {
    return this.subjectsService.getSubjectWithTeachers(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update subject" })
  @ApiParam({ name: "id", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Subject updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto
  ) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete subject" })
  @ApiParam({ name: "id", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Subject deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.subjectsService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle subject active status" })
  @ApiParam({ name: "id", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.subjectsService.toggleStatus(id);
  }
}
