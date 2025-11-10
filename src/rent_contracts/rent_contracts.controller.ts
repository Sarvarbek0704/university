import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RentContractsService } from './rent_contracts.service';
import { CreateRentContractDto } from './dto/create-rent_contract.dto';
import { UpdateRentContractDto } from './dto/update-rent_contract.dto';

@Controller('rent-contracts')
export class RentContractsController {
  constructor(private readonly rentContractsService: RentContractsService) {}

  @Post()
  create(@Body() createRentContractDto: CreateRentContractDto) {
    return this.rentContractsService.create(createRentContractDto);
  }

  @Get()
  findAll() {
    return this.rentContractsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentContractsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRentContractDto: UpdateRentContractDto) {
    return this.rentContractsService.update(+id, updateRentContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentContractsService.remove(+id);
  }
}
