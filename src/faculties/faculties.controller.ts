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
import { FacultiesService } from "./faculties.service";
import { CreateFacultyDto } from "./dto/create-faculty.dto";
import { UpdateFacultyDto } from "./dto/update-faculty.dto";
import { FilterFacultyDto } from "./dto/filter-faculty.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("faculties")
@ApiBearerAuth("JWT-auth")
@Controller("faculties")
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new faculty" })
  @ApiResponse({ status: 201, description: "Faculty created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 409,
    description: "Faculty name or code already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultiesService.create(createFacultyDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all faculties with filtering" })
  @ApiResponse({ status: 200, description: "Return all faculties" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterFacultyDto) {
    return this.facultiesService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get faculties statistics" })
  @ApiResponse({ status: 200, description: "Return faculties count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.facultiesService.getFacultiesCount();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get faculty by ID" })
  @ApiParam({ name: "id", type: Number, description: "Faculty ID" })
  @ApiResponse({ status: 200, description: "Return faculty" })
  @ApiResponse({ status: 400, description: "Invalid faculty ID" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.facultiesService.findOne(id);
  }

  @Get(":id/with-departments")
  @ApiOperation({ summary: "Get faculty with departments" })
  @ApiParam({ name: "id", type: Number, description: "Faculty ID" })
  @ApiResponse({ status: 200, description: "Return faculty with departments" })
  @ApiResponse({ status: 400, description: "Invalid faculty ID" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getFacultyWithDepartments(@Param("id", ParseIntPipe) id: number) {
    return this.facultiesService.getFacultyWithDepartments(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update faculty" })
  @ApiParam({ name: "id", type: Number, description: "Faculty ID" })
  @ApiResponse({ status: 200, description: "Faculty updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({
    status: 409,
    description: "Faculty name or code already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateFacultyDto: UpdateFacultyDto
  ) {
    return this.facultiesService.update(id, updateFacultyDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete faculty" })
  @ApiParam({ name: "id", type: Number, description: "Faculty ID" })
  @ApiResponse({ status: 200, description: "Faculty deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid faculty ID" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({
    status: 409,
    description: "Cannot delete faculty with departments",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.facultiesService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle faculty active status" })
  @ApiParam({ name: "id", type: Number, description: "Faculty ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid faculty ID" })
  @ApiResponse({ status: 404, description: "Faculty not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.facultiesService.toggleStatus(id);
  }
}
