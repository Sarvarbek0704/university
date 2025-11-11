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
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { InternshipsService } from "./internships.service";
import { CreateInternshipDto } from "./dto/create-internship.dto";
import { UpdateInternshipDto } from "./dto/update-internship.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("internships")
@ApiBearerAuth("JWT-auth")
@Controller("internships")
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create internship record" })
  create(@Body() createInternshipDto: CreateInternshipDto) {
    return this.internshipsService.create(createInternshipDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all internships" })
  findAll() {
    return this.internshipsService.findAll();
  }

  @Get("active")
  @ApiOperation({ summary: "Get active internships" })
  findActive() {
    return this.internshipsService.findActive();
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get student internships" })
  findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.internshipsService.findByStudent(studentId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get internship by ID" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.internshipsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update internship" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateInternshipDto: UpdateInternshipDto
  ) {
    return this.internshipsService.update(id, updateInternshipDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete internship" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.internshipsService.remove(id);
  }

  @Post(":id/complete")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Mark internship as completed" })
  complete(
    @Param("id", ParseIntPipe) id: number,
    @Body("grade") grade: string,
    @Body("feedback") feedback?: string
  ) {
    return this.internshipsService.complete(id, grade, feedback);
  }
}
