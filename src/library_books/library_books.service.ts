import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { LibraryBook } from "./models/library_book.model";
import { CreateLibraryBookDto } from "./dto/create-library_book.dto";
import { UpdateLibraryBookDto } from "./dto/update-library_book.dto";

@Injectable()
export class LibraryBooksService {
  constructor(
    @InjectModel(LibraryBook)
    private readonly libraryBookModel: typeof LibraryBook
  ) {}

  async create(
    createLibraryBookDto: CreateLibraryBookDto
  ): Promise<LibraryBook> {
    const existingBook = await this.libraryBookModel.findOne({
      where: { isbn: createLibraryBookDto.isbn },
    });

    if (existingBook) {
      throw new ConflictException("Book with this ISBN already exists");
    }

    return this.libraryBookModel.create({
      ...createLibraryBookDto,
      available_count: createLibraryBookDto.total_copies || 1,
    });
  }

  async findAll(): Promise<LibraryBook[]> {
    return this.libraryBookModel.findAll({
      order: [["title", "ASC"]],
    });
  }

  async findAvailable(): Promise<LibraryBook[]> {
    return this.libraryBookModel.findAll({
      where: { available_count: { [Op.gt]: 0 } },
      order: [["title", "ASC"]],
    });
  }

  async search(query: string): Promise<LibraryBook[]> {
    if (!query) return this.findAll();

    return this.libraryBookModel.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { author: { [Op.iLike]: `%${query}%` } },
          { isbn: { [Op.iLike]: `%${query}%` } },
        ],
      },
      order: [["title", "ASC"]],
    });
  }

  async findOne(id: number): Promise<LibraryBook> {
    const book = await this.libraryBookModel.findByPk(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(
    id: number,
    updateLibraryBookDto: UpdateLibraryBookDto
  ): Promise<LibraryBook> {
    const book = await this.findOne(id);

    if (updateLibraryBookDto.total_copies) {
      const borrowedCount = book.total_copies - book.available_count;
      const newAvailable = Math.max(
        0,
        updateLibraryBookDto.total_copies - borrowedCount
      );
      updateLibraryBookDto["available_count"] = newAvailable;
    }

    await book.update(updateLibraryBookDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const book = await this.findOne(id);
    await book.destroy();
    return { message: "Book deleted successfully" };
  }
}
