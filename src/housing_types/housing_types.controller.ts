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
import { HousingTypesService } from "./housing_types.service";
import { CreateHousingTypeDto } from "./dto/create-housing_type.dto";
import { UpdateHousingTypeDto } from "./dto/update-housing_type.dto";
import { FilterHousingTypeDto } from "./dto/filter-housing-type.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("housing-types")
@ApiBearerAuth("JWT-auth")
@Controller("housing-types")
export class HousingTypesController {
  constructor(private readonly housingTypesService: HousingTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new housing type" })
  @ApiResponse({
    status: 201,
    description: "Housing type created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Housing type name already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createHousingTypeDto: CreateHousingTypeDto) {
    return this.housingTypesService.create(createHousingTypeDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all housing types with filtering" })
  @ApiResponse({ status: 200, description: "Return all housing types" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterHousingTypeDto) {
    return this.housingTypesService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get housing types statistics" })
  @ApiResponse({ status: 200, description: "Return housing types count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.housingTypesService.getHousingTypesCount();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get housing type by ID" })
  @ApiParam({ name: "id", type: Number, description: "Housing type ID" })
  @ApiResponse({ status: 200, description: "Return housing type" })
  @ApiResponse({ status: 400, description: "Invalid housing type ID" })
  @ApiResponse({ status: 404, description: "Housing type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.housingTypesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update housing type" })
  @ApiParam({ name: "id", type: Number, description: "Housing type ID" })
  @ApiResponse({
    status: 200,
    description: "Housing type updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Housing type not found" })
  @ApiResponse({ status: 409, description: "Housing type name already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateHousingTypeDto: UpdateHousingTypeDto
  ) {
    return this.housingTypesService.update(id, updateHousingTypeDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete housing type" })
  @ApiParam({ name: "id", type: Number, description: "Housing type ID" })
  @ApiResponse({
    status: 200,
    description: "Housing type deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid housing type ID" })
  @ApiResponse({ status: 404, description: "Housing type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.housingTypesService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle housing type active status" })
  @ApiParam({ name: "id", type: Number, description: "Housing type ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid housing type ID" })
  @ApiResponse({ status: 404, description: "Housing type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.housingTypesService.toggleStatus(id);
  }
}
