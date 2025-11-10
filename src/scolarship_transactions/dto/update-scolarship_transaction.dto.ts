import { PartialType } from '@nestjs/swagger';
import { CreateScolarshipTransactionDto } from './create-scolarship_transaction.dto';

export class UpdateScolarshipTransactionDto extends PartialType(CreateScolarshipTransactionDto) {}
