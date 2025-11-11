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
import { PrerequisitesService } from "./prerequisites.service";
import { CreatePrerequisiteDto } from "./dto/create-prerequisite.dto";
import { UpdatePrerequisiteDto } from "./dto/update-prerequisite.dto";
import { FilterPrerequisiteDto } from "./dto/filter-prerequisite.dto";
import { PrerequisiteCheckDto } from "./dto/prerequisite-check.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { TeacherGuard } from "../auth/guards/teacher.guard";

@ApiTags("prerequisites")
@ApiBearerAuth("JWT-auth")
@Controller("prerequisites")
export class PrerequisitesController {
  constructor(private readonly prerequisitesService: PrerequisitesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new prerequisite" })
  @ApiResponse({
    status: 201,
    description: "Prerequisite created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 409, description: "Prerequisite already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createPrerequisiteDto: CreatePrerequisiteDto) {
    return this.prerequisitesService.create(createPrerequisiteDto);
  }

  @Post("check")
  @ApiOperation({ summary: "Check prerequisites for students" })
  @ApiResponse({ status: 200, description: "Prerequisite check completed" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async checkPrerequisites(@Body() prerequisiteCheckDto: PrerequisiteCheckDto) {
    return this.prerequisitesService.checkPrerequisites(prerequisiteCheckDto);
  }

  @Post("bulk")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create multiple prerequisites in bulk" })
  @ApiResponse({
    status: 201,
    description: "Bulk prerequisites created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Subjects not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async createBulk(@Body() prerequisites: CreatePrerequisiteDto[]) {
    return this.prerequisitesService.createBulk(prerequisites);
  }

  @Get()
  @ApiOperation({ summary: "Get all prerequisites with filtering" })
  @ApiResponse({ status: 200, description: "Return all prerequisites" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterPrerequisiteDto) {
    return this.prerequisitesService.findAll(filterDto);
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get prerequisites by subject ID" })
  @ApiParam({ name: "subjectId", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Return prerequisites for subject" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findBySubject(@Param("subjectId", ParseIntPipe) subjectId: number) {
    return this.prerequisitesService.findBySubject(subjectId);
  }

  @Get("subject/:subjectId/full-tree")
  @ApiOperation({ summary: "Get full prerequisite tree for subject" })
  @ApiParam({ name: "subjectId", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Return full prerequisite tree" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getPrerequisiteTree(
    @Param("subjectId", ParseIntPipe) subjectId: number
  ) {
    return this.prerequisitesService.getPrerequisiteTree(subjectId);
  }

  @Get("prerequisite/:subjectId")
  @ApiOperation({
    summary: "Get subjects that require this subject as prerequisite",
  })
  @ApiParam({
    name: "subjectId",
    type: Number,
    description: "Prerequisite Subject ID",
  })
  @ApiResponse({ status: 200, description: "Return dependent subjects" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByPrerequisiteSubject(
    @Param("subjectId", ParseIntPipe) subjectId: number
  ) {
    return this.prerequisitesService.findByPrerequisiteSubject(subjectId);
  }

  @Get("student/:studentId/subject/:subjectId")
  @ApiOperation({
    summary: "Check student's prerequisites for specific subject",
  })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiParam({ name: "subjectId", type: Number, description: "Subject ID" })
  @ApiResponse({
    status: 200,
    description: "Return student prerequisite status",
  })
  @ApiResponse({ status: 400, description: "Invalid parameters" })
  @ApiResponse({ status: 404, description: "Student or subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async checkStudentPrerequisites(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Param("subjectId", ParseIntPipe) subjectId: number
  ) {
    return this.prerequisitesService.checkStudentPrerequisites(
      studentId,
      subjectId
    );
  }

  @Get("analytics/most-required")
  @ApiOperation({ summary: "Get most required prerequisites analytics" })
  @ApiResponse({
    status: 200,
    description: "Return most required prerequisites",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getMostRequiredPrerequisites(@Query("limit") limit: number = 10) {
    return this.prerequisitesService.getMostRequiredPrerequisites(limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get prerequisite by ID" })
  @ApiParam({ name: "id", type: Number, description: "Prerequisite ID" })
  @ApiResponse({ status: 200, description: "Return prerequisite" })
  @ApiResponse({ status: 400, description: "Invalid prerequisite ID" })
  @ApiResponse({ status: 404, description: "Prerequisite not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.prerequisitesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update prerequisite" })
  @ApiParam({ name: "id", type: Number, description: "Prerequisite ID" })
  @ApiResponse({
    status: 200,
    description: "Prerequisite updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Prerequisite not found" })
  @ApiResponse({ status: 409, description: "Prerequisite already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePrerequisiteDto: UpdatePrerequisiteDto
  ) {
    return this.prerequisitesService.update(id, updatePrerequisiteDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete prerequisite" })
  @ApiParam({ name: "id", type: Number, description: "Prerequisite ID" })
  @ApiResponse({
    status: 200,
    description: "Prerequisite deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid prerequisite ID" })
  @ApiResponse({ status: 404, description: "Prerequisite not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.prerequisitesService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle prerequisite active status" })
  @ApiParam({ name: "id", type: Number, description: "Prerequisite ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid prerequisite ID" })
  @ApiResponse({ status: 404, description: "Prerequisite not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.prerequisitesService.toggleStatus(id);
  }

  @Get("validation/circular-dependencies")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Check for circular dependencies in prerequisites" })
  @ApiResponse({
    status: 200,
    description: "Return circular dependencies check results",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async checkCircularDependencies() {
    return this.prerequisitesService.checkCircularDependencies();
  }

  @Get("student/:studentId/eligible-subjects")
  @ApiOperation({
    summary: "Get eligible subjects for student based on prerequisites",
  })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return eligible subjects" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getEligibleSubjects(
    @Param("studentId", ParseIntPipe) studentId: number
  ) {
    return this.prerequisitesService.getEligibleSubjects(studentId);
  }
}
