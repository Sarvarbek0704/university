import { PartialType } from '@nestjs/swagger';
import { CreateRentContractDto } from './create-rent_contract.dto';

export class UpdateRentContractDto extends PartialType(CreateRentContractDto) {}
