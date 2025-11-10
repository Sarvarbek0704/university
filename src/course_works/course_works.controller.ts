import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseWorksService } from './course_works.service';
import { CreateCourseWorkDto } from './dto/create-course_work.dto';
import { UpdateCourseWorkDto } from './dto/update-course_work.dto';

@Controller('course-works')
export class CourseWorksController {
  constructor(private readonly courseWorksService: CourseWorksService) {}

  @Post()
  create(@Body() createCourseWorkDto: CreateCourseWorkDto) {
    return this.courseWorksService.create(createCourseWorkDto);
  }

  @Get()
  findAll() {
    return this.courseWorksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseWorksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseWorkDto: UpdateCourseWorkDto) {
    return this.courseWorksService.update(+id, updateCourseWorkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseWorksService.remove(+id);
  }
}
