import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LibraryBooksService } from "./library_books.service";
import { LibraryBooksController } from "./library_books.controller";
import { LibraryBook } from "./models/library_book.model";

@Module({
  imports: [SequelizeModule.forFeature([LibraryBook])],
  controllers: [LibraryBooksController],
  providers: [LibraryBooksService],
  exports: [LibraryBooksService],
})
export class LibraryBooksModule {}
