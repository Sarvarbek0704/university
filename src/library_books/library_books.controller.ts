import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { LibraryBooksService } from "./library_books.service";
import { CreateLibraryBookDto } from "./dto/create-library_book.dto";
import { UpdateLibraryBookDto } from "./dto/update-library_book.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("library-books")
@ApiBearerAuth("JWT-auth")
@Controller("library-books")
export class LibraryBooksController {
  constructor(private readonly libraryBooksService: LibraryBooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Add new book to library" })
  create(@Body() createLibraryBookDto: CreateLibraryBookDto) {
    return this.libraryBooksService.create(createLibraryBookDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all library books" })
  findAll() {
    return this.libraryBooksService.findAll();
  }

  @Get("available")
  @ApiOperation({ summary: "Get available books" })
  findAvailable() {
    return this.libraryBooksService.findAvailable();
  }

  @Get("search")
  @ApiOperation({ summary: "Search books" })
  search(@Query("q") query: string) {
    return this.libraryBooksService.search(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get book by ID" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.libraryBooksService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update book" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateLibraryBookDto: UpdateLibraryBookDto
  ) {
    return this.libraryBooksService.update(id, updateLibraryBookDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete book" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.libraryBooksService.remove(id);
  }
}
