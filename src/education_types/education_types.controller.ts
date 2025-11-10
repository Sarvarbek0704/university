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
import { EducationTypesService } from "./education_types.service";
import { CreateEducationTypeDto } from "./dto/create-education_type.dto";
import { UpdateEducationTypeDto } from "./dto/update-education_type.dto";
import { FilterEducationTypeDto } from "./dto/filter-education-type.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("education-types")
@ApiBearerAuth("JWT-auth")
@Controller("education-types")
export class EducationTypesController {
  constructor(private readonly educationTypesService: EducationTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new education type" })
  @ApiResponse({
    status: 201,
    description: "Education type created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 409,
    description: "Education type name already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createEducationTypeDto: CreateEducationTypeDto) {
    return this.educationTypesService.create(createEducationTypeDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all education types with filtering" })
  @ApiResponse({ status: 200, description: "Return all education types" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterEducationTypeDto) {
    return this.educationTypesService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get education types statistics" })
  @ApiResponse({ status: 200, description: "Return education types count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.educationTypesService.getEducationTypesCount();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get education type by ID" })
  @ApiParam({ name: "id", type: Number, description: "Education type ID" })
  @ApiResponse({ status: 200, description: "Return education type" })
  @ApiResponse({ status: 400, description: "Invalid education type ID" })
  @ApiResponse({ status: 404, description: "Education type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.educationTypesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update education type" })
  @ApiParam({ name: "id", type: Number, description: "Education type ID" })
  @ApiResponse({
    status: 200,
    description: "Education type updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Education type not found" })
  @ApiResponse({
    status: 409,
    description: "Education type name already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateEducationTypeDto: UpdateEducationTypeDto
  ) {
    return this.educationTypesService.update(id, updateEducationTypeDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete education type" })
  @ApiParam({ name: "id", type: Number, description: "Education type ID" })
  @ApiResponse({
    status: 200,
    description: "Education type deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid education type ID" })
  @ApiResponse({ status: 404, description: "Education type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.educationTypesService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle education type active status" })
  @ApiParam({ name: "id", type: Number, description: "Education type ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid education type ID" })
  @ApiResponse({ status: 404, description: "Education type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.educationTypesService.toggleStatus(id);
  }
}
