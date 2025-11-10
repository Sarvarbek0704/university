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
import { DepartmentsService } from "./departments.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { FilterDepartmentDto } from "./dto/filter-department.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("departments")
@ApiBearerAuth("JWT-auth")
@Controller("departments")
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new department" })
  @ApiResponse({ status: 201, description: "Department created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({
    status: 409,
    description: "Department name already exists in this faculty",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all departments with filtering" })
  @ApiResponse({ status: 200, description: "Return all departments" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterDepartmentDto) {
    return this.departmentsService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get departments statistics" })
  @ApiResponse({ status: 200, description: "Return departments count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.departmentsService.getDepartmentsCount();
  }

  @Get("faculty/:facultyId")
  @ApiOperation({ summary: "Get departments by faculty ID" })
  @ApiParam({ name: "facultyId", type: Number, description: "Faculty ID" })
  @ApiResponse({ status: 200, description: "Return departments for faculty" })
  @ApiResponse({ status: 400, description: "Invalid faculty ID" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByFaculty(@Param("facultyId", ParseIntPipe) facultyId: number) {
    return this.departmentsService.findDepartmentsByFaculty(facultyId);
  }

  @Get("faculty/:facultyId/count")
  @ApiOperation({ summary: "Get departments count by faculty" })
  @ApiParam({ name: "facultyId", type: Number, description: "Faculty ID" })
  @ApiResponse({
    status: 200,
    description: "Return departments count for faculty",
  })
  @ApiResponse({ status: 400, description: "Invalid faculty ID" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCountByFaculty(@Param("facultyId", ParseIntPipe) facultyId: number) {
    return this.departmentsService.getDepartmentsCountByFaculty(facultyId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get department by ID" })
  @ApiParam({ name: "id", type: Number, description: "Department ID" })
  @ApiResponse({ status: 200, description: "Return department" })
  @ApiResponse({ status: 400, description: "Invalid department ID" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.departmentsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update department" })
  @ApiParam({ name: "id", type: Number, description: "Department ID" })
  @ApiResponse({ status: 200, description: "Department updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @ApiResponse({
    status: 409,
    description: "Department name already exists in this faculty",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete department" })
  @ApiParam({ name: "id", type: Number, description: "Department ID" })
  @ApiResponse({ status: 200, description: "Department deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid department ID" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.departmentsService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle department active status" })
  @ApiParam({ name: "id", type: Number, description: "Department ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid department ID" })
  @ApiResponse({ status: 404, description: "Department not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.departmentsService.toggleStatus(id);
  }
}
