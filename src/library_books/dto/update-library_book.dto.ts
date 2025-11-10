import { PartialType } from '@nestjs/swagger';
import { CreateLibraryBookDto } from './create-library_book.dto';

export class UpdateLibraryBookDto extends PartialType(CreateLibraryBookDto) {}
