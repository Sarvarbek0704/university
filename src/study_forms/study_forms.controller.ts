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
import { CreateStudyFormDto } from "./dto/create-study_form.dto";
import { UpdateStudyFormDto } from "./dto/update-study_form.dto";
import { FilterStudyFormDto } from "./dto/filter-study_form.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { StudyFormsService } from "./study_forms.service";

@ApiTags("study-forms")
@ApiBearerAuth("JWT-auth")
@Controller("study-forms")
export class StudyFormsController {
  constructor(private readonly studyFormsService: StudyFormsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new study form" })
  @ApiResponse({ status: 201, description: "Study form created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Study form name already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createStudyFormDto: CreateStudyFormDto) {
    return this.studyFormsService.create(createStudyFormDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all study forms with filtering" })
  @ApiResponse({ status: 200, description: "Return all study forms" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterStudyFormDto) {
    return this.studyFormsService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get study forms statistics" })
  @ApiResponse({ status: 200, description: "Return study forms count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.studyFormsService.getStudyFormsCount();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get study form by ID" })
  @ApiParam({ name: "id", type: Number, description: "Study form ID" })
  @ApiResponse({ status: 200, description: "Return study form" })
  @ApiResponse({ status: 400, description: "Invalid study form ID" })
  @ApiResponse({ status: 404, description: "Study form not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.studyFormsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update study form" })
  @ApiParam({ name: "id", type: Number, description: "Study form ID" })
  @ApiResponse({ status: 200, description: "Study form updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Study form not found" })
  @ApiResponse({ status: 409, description: "Study form name already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStudyFormDto: UpdateStudyFormDto
  ) {
    return this.studyFormsService.update(id, updateStudyFormDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete study form" })
  @ApiParam({ name: "id", type: Number, description: "Study form ID" })
  @ApiResponse({ status: 200, description: "Study form deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid study form ID" })
  @ApiResponse({ status: 404, description: "Study form not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.studyFormsService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle study form active status" })
  @ApiParam({ name: "id", type: Number, description: "Study form ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid study form ID" })
  @ApiResponse({ status: 404, description: "Study form not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.studyFormsService.toggleStatus(id);
  }
}
