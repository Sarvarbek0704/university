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
import { ScholarshipsService } from "./scholarships.service";
import { CreateScholarshipDto } from "./dto/create-scholarship.dto";
import { UpdateScholarshipDto } from "./dto/update-scholarship.dto";
import { FilterScholarshipDto } from "./dto/filter-scholarship.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("scholarships")
@ApiBearerAuth("JWT-auth")
@Controller("scholarships")
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new scholarship" })
  @ApiResponse({ status: 201, description: "Scholarship created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 409, description: "Scholarship already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createScholarshipDto: CreateScholarshipDto) {
    return this.scholarshipsService.create(createScholarshipDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all scholarships with filtering" })
  @ApiResponse({ status: 200, description: "Return all scholarships" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterScholarshipDto) {
    return this.scholarshipsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get scholarships statistics" })
  @ApiResponse({ status: 200, description: "Return scholarships statistics" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats() {
    return this.scholarshipsService.getScholarshipsStats();
  }

  @Get("default-amounts")
  @ApiOperation({ summary: "Get default scholarship amounts by type" })
  @ApiResponse({ status: 200, description: "Return default amounts" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getDefaultAmounts() {
    return this.scholarshipsService.getDefaultAmounts();
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get scholarships by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return scholarships for student" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.scholarshipsService.findByStudent(studentId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get scholarship by ID" })
  @ApiParam({ name: "id", type: Number, description: "Scholarship ID" })
  @ApiResponse({ status: 200, description: "Return scholarship" })
  @ApiResponse({ status: 400, description: "Invalid scholarship ID" })
  @ApiResponse({ status: 404, description: "Scholarship not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.scholarshipsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update scholarship" })
  @ApiParam({ name: "id", type: Number, description: "Scholarship ID" })
  @ApiResponse({ status: 200, description: "Scholarship updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Scholarship not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateScholarshipDto: UpdateScholarshipDto
  ) {
    return this.scholarshipsService.update(id, updateScholarshipDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete scholarship" })
  @ApiParam({ name: "id", type: Number, description: "Scholarship ID" })
  @ApiResponse({ status: 200, description: "Scholarship deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid scholarship ID" })
  @ApiResponse({ status: 404, description: "Scholarship not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.scholarshipsService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle scholarship active status" })
  @ApiParam({ name: "id", type: Number, description: "Scholarship ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid scholarship ID" })
  @ApiResponse({ status: 404, description: "Scholarship not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.scholarshipsService.toggleStatus(id);
  }
}
