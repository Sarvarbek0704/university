import { Injectable } from '@nestjs/common';
import { CreateStudentCreditDto } from './dto/create-student_credit.dto';
import { UpdateStudentCreditDto } from './dto/update-student_credit.dto';

@Injectable()
export class StudentCreditsService {
  create(createStudentCreditDto: CreateStudentCreditDto) {
    return 'This action adds a new studentCredit';
  }

  findAll() {
    return `This action returns all studentCredits`;
  }

  findOne(id: number) {
    return `This action returns a #${id} studentCredit`;
  }

  update(id: number, updateStudentCreditDto: UpdateStudentCreditDto) {
    return `This action updates a #${id} studentCredit`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentCredit`;
  }
}
