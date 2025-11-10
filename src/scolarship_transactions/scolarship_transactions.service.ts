import { Injectable } from '@nestjs/common';
import { CreateScolarshipTransactionDto } from './dto/create-scolarship_transaction.dto';
import { UpdateScolarshipTransactionDto } from './dto/update-scolarship_transaction.dto';

@Injectable()
export class ScolarshipTransactionsService {
  create(createScolarshipTransactionDto: CreateScolarshipTransactionDto) {
    return 'This action adds a new scolarshipTransaction';
  }

  findAll() {
    return `This action returns all scolarshipTransactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scolarshipTransaction`;
  }

  update(id: number, updateScolarshipTransactionDto: UpdateScolarshipTransactionDto) {
    return `This action updates a #${id} scolarshipTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} scolarshipTransaction`;
  }
}
