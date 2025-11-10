import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { EducationType } from "./models/education_type.model";
import { CreateEducationTypeDto } from "./dto/create-education_type.dto";
import { UpdateEducationTypeDto } from "./dto/update-education_type.dto";
import { FilterEducationTypeDto } from "./dto/filter-education-type.dto";

@Injectable()
export class EducationTypesService {
  constructor(
    @InjectModel(EducationType)
    private readonly educationTypeModel: typeof EducationType
  ) {}

  async create(
    createEducationTypeDto: CreateEducationTypeDto
  ): Promise<EducationType> {
    if (
      !createEducationTypeDto?.name ||
      !createEducationTypeDto?.duration_years
    ) {
      throw new BadRequestException(
        "Education type name and duration are required"
      );
    }

    const existingEducationType = await this.educationTypeModel.findOne({
      where: { name: createEducationTypeDto.name },
    });

    if (existingEducationType) {
      throw new ConflictException(
        "Education type with this name already exists"
      );
    }

    const educationType = await this.educationTypeModel.create({
      name: createEducationTypeDto.name,
      duration_years: createEducationTypeDto.duration_years,
      description: createEducationTypeDto.description,
    } as any);

    return this.findOne(educationType.id);
  }

  async findAll(filterDto: FilterEducationTypeDto): Promise<EducationType[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause.name = {
        [Op.iLike]: `%${filterDto.search}%`,
      };
    }

    if (filterDto.duration_years) {
      whereClause.duration_years = filterDto.duration_years;
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.educationTypeModel.findAll({
      where: whereClause,
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<EducationType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid education type ID");
    }

    const educationType = await this.educationTypeModel.findByPk(id);

    if (!educationType) {
      throw new NotFoundException(`Education type with ID ${id} not found`);
    }

    return educationType;
  }

  async update(
    id: number,
    updateEducationTypeDto: UpdateEducationTypeDto
  ): Promise<EducationType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid education type ID");
    }

    const educationType = await this.findOne(id);

    if (
      updateEducationTypeDto.name &&
      updateEducationTypeDto.name !== educationType.name
    ) {
      const existingEducationType = await this.educationTypeModel.findOne({
        where: {
          name: updateEducationTypeDto.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingEducationType) {
        throw new ConflictException(
          "Education type with this name already exists"
        );
      }
    }

    await educationType.update(updateEducationTypeDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid education type ID");
    }

    const educationType = await this.findOne(id);

    const studentCount = await educationType.$count("infoStudents");
    if (studentCount > 0) {
      throw new ConflictException(
        "Cannot delete education type with associated students"
      );
    }

    await educationType.destroy();
    return { message: "Education type deleted successfully" };
  }

  async toggleStatus(id: number): Promise<EducationType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid education type ID");
    }

    const educationType = await this.findOne(id);
    await educationType.update({ is_active: !educationType.is_active });

    return this.findOne(id);
  }

  async getEducationTypesCount(): Promise<{ total: number; active: number }> {
    const total = await this.educationTypeModel.count();
    const active = await this.educationTypeModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }
}
