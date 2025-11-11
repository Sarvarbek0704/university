import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { BorrowedBooksService } from "./borrowed_books.service";
import { BorrowedBooksController } from "./borrowed_books.controller";
import { BorrowedBook } from "./models/borrowed_book.model";
import { LibraryBook } from "../library_books/models/library_book.model";
import { Student } from "../students/models/student.model";

@Module({
  imports: [SequelizeModule.forFeature([BorrowedBook, LibraryBook, Student])],
  controllers: [BorrowedBooksController],
  providers: [BorrowedBooksService],
  exports: [BorrowedBooksService],
})
export class BorrowedBooksModule {}
