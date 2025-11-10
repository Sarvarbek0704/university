import { PartialType } from '@nestjs/swagger';
import { CreatePaymentTypeDto } from './create-payment_type.dto';

export class UpdatePaymentTypeDto extends PartialType(CreatePaymentTypeDto) {}
