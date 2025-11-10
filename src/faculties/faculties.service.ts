import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Faculty } from "./models/faculty.model";
import { CreateFacultyDto } from "./dto/create-faculty.dto";
import { UpdateFacultyDto } from "./dto/update-faculty.dto";
import { FilterFacultyDto } from "./dto/filter-faculty.dto";
import { Op } from "sequelize";

@Injectable()
export class FacultiesService {
  constructor(
    @InjectModel(Faculty)
    private readonly facultyModel: typeof Faculty
  ) {}

  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    if (!createFacultyDto?.name) {
      throw new BadRequestException("Faculty name is required");
    }

    const existingFaculty = await this.facultyModel.findOne({
      where: { name: createFacultyDto.name },
    });

    if (existingFaculty) {
      throw new ConflictException("Faculty with this name already exists");
    }

    if (createFacultyDto.code) {
      const existingFacultyByCode = await this.facultyModel.findOne({
        where: { code: createFacultyDto.code },
      });

      if (existingFacultyByCode) {
        throw new ConflictException("Faculty with this code already exists");
      }
    }

    const faculty = await this.facultyModel.create({
      name: createFacultyDto.name,
      code: createFacultyDto.code,
      description: createFacultyDto.description,
      building_number: createFacultyDto.building_number,
      phone: createFacultyDto.phone,
    } as any);
    return this.findOne(faculty.id);
  }

  async findAll(filterDto: FilterFacultyDto): Promise<Faculty[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${filterDto.search}%` } },
        { code: { [Op.iLike]: `%${filterDto.search}%` } },
      ];
    }

    if (filterDto.building_number) {
      whereClause.building_number = filterDto.building_number;
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.facultyModel.findAll({
      where: whereClause,
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Faculty> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid faculty ID");
    }

    const faculty = await this.facultyModel.findByPk(id);

    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }

    return faculty;
  }

  async findOneByName(name: string): Promise<Faculty> {
    if (!name) {
      throw new BadRequestException("Faculty name is required");
    }

    const faculty = await this.facultyModel.findOne({
      where: { name },
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty with name ${name} not found`);
    }

    return faculty;
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto
  ): Promise<Faculty> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid faculty ID");
    }

    const faculty = await this.findOne(id);

    if (updateFacultyDto.name && updateFacultyDto.name !== faculty.name) {
      const existingFaculty = await this.facultyModel.findOne({
        where: {
          name: updateFacultyDto.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingFaculty) {
        throw new ConflictException("Faculty with this name already exists");
      }
    }

    if (updateFacultyDto.code && updateFacultyDto.code !== faculty.code) {
      const existingFacultyByCode = await this.facultyModel.findOne({
        where: {
          code: updateFacultyDto.code,
          id: { [Op.ne]: id },
        },
      });

      if (existingFacultyByCode) {
        throw new ConflictException("Faculty with this code already exists");
      }
    }

    await faculty.update(updateFacultyDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid faculty ID");
    }

    const faculty = await this.findOne(id);

    const departmentCount = await faculty.$count("departments");
    if (departmentCount > 0) {
      throw new ConflictException(
        "Cannot delete faculty with existing departments"
      );
    }

    await faculty.destroy();
    return { message: "Faculty deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Faculty> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid faculty ID");
    }

    const faculty = await this.findOne(id);
    await faculty.update({ is_active: !faculty.is_active });

    return this.findOne(id);
  }

  async getFacultiesCount(): Promise<{ total: number; active: number }> {
    const total = await this.facultyModel.count();
    const active = await this.facultyModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }

  async getFacultyWithDepartments(id: number): Promise<Faculty> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid faculty ID");
    }

    const faculty = await this.facultyModel.findByPk(id, {
      include: ["departments"],
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }

    return faculty;
  }
}
