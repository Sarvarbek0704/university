import { Injectable } from '@nestjs/common';
import { CreateFailedSubjectDto } from './dto/create-failed_subject.dto';
import { UpdateFailedSubjectDto } from './dto/update-failed_subject.dto';

@Injectable()
export class FailedSubjectsService {
  create(createFailedSubjectDto: CreateFailedSubjectDto) {
    return 'This action adds a new failedSubject';
  }

  findAll() {
    return `This action returns all failedSubjects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} failedSubject`;
  }

  update(id: number, updateFailedSubjectDto: UpdateFailedSubjectDto) {
    return `This action updates a #${id} failedSubject`;
  }

  remove(id: number) {
    return `This action removes a #${id} failedSubject`;
  }
}
