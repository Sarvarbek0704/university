import { Injectable } from '@nestjs/common';
import { CreateCourseWorkDto } from './dto/create-course_work.dto';
import { UpdateCourseWorkDto } from './dto/update-course_work.dto';

@Injectable()
export class CourseWorksService {
  create(createCourseWorkDto: CreateCourseWorkDto) {
    return 'This action adds a new courseWork';
  }

  findAll() {
    return `This action returns all courseWorks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseWork`;
  }

  update(id: number, updateCourseWorkDto: UpdateCourseWorkDto) {
    return `This action updates a #${id} courseWork`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseWork`;
  }
}
