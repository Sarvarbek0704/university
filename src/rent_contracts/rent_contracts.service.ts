import { Injectable } from '@nestjs/common';
import { CreateRentContractDto } from './dto/create-rent_contract.dto';
import { UpdateRentContractDto } from './dto/update-rent_contract.dto';

@Injectable()
export class RentContractsService {
  create(createRentContractDto: CreateRentContractDto) {
    return 'This action adds a new rentContract';
  }

  findAll() {
    return `This action returns all rentContracts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rentContract`;
  }

  update(id: number, updateRentContractDto: UpdateRentContractDto) {
    return `This action updates a #${id} rentContract`;
  }

  remove(id: number) {
    return `This action removes a #${id} rentContract`;
  }
}
