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
import { CourseWorksService } from "./course_works.service";
import { CreateCourseWorkDto } from "./dto/create-course_work.dto";
import { UpdateCourseWorkDto } from "./dto/update-course_work.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("course-works")
@ApiBearerAuth("JWT-auth")
@Controller("course-works")
export class CourseWorksController {
  constructor(private readonly courseWorksService: CourseWorksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create course work" })
  create(@Body() createCourseWorkDto: CreateCourseWorkDto) {
    return this.courseWorksService.create(createCourseWorkDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all course works" })
  findAll() {
    return this.courseWorksService.findAll();
  }

  @Get("pending")
  @ApiOperation({ summary: "Get pending course works" })
  findPending() {
    return this.courseWorksService.findPending();
  }

  @Get("overdue")
  @ApiOperation({ summary: "Get overdue course works" })
  findOverdue() {
    return this.courseWorksService.findOverdue();
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get student course works" })
  findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.courseWorksService.findByStudent(studentId);
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get subject course works" })
  findBySubject(@Param("subjectId", ParseIntPipe) subjectId: number) {
    return this.courseWorksService.findBySubject(subjectId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get course work by ID" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.courseWorksService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update course work" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCourseWorkDto: UpdateCourseWorkDto
  ) {
    return this.courseWorksService.update(id, updateCourseWorkDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete course work" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.courseWorksService.remove(id);
  }

  @Post(":id/grade")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Grade course work" })
  grade(
    @Param("id", ParseIntPipe) id: number,
    @Body("grade") grade: string,
    @Body("score") score: number,
    @Body("feedback") feedback?: string
  ) {
    return this.courseWorksService.grade(id, grade, score, feedback);
  }
}
