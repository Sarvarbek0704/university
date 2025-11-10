import { PartialType } from '@nestjs/swagger';
import { CreateBorrowedBookDto } from './create-borrowed_book.dto';

export class UpdateBorrowedBookDto extends PartialType(CreateBorrowedBookDto) {}
