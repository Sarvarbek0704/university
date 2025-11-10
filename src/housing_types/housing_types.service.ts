import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { HousingType } from "./models/housing_type.model";
import { CreateHousingTypeDto } from "./dto/create-housing_type.dto";
import { UpdateHousingTypeDto } from "./dto/update-housing_type.dto";
import { FilterHousingTypeDto } from "./dto/filter-housing-type.dto";

@Injectable()
export class HousingTypesService {
  constructor(
    @InjectModel(HousingType)
    private readonly housingTypeModel: typeof HousingType
  ) {}

  async create(
    createHousingTypeDto: CreateHousingTypeDto
  ): Promise<HousingType> {
    if (!createHousingTypeDto?.name) {
      throw new BadRequestException("Housing type name is required");
    }

    const existingHousingType = await this.housingTypeModel.findOne({
      where: { name: createHousingTypeDto.name },
    });

    if (existingHousingType) {
      throw new ConflictException("Housing type with this name already exists");
    }

    const housingType = await this.housingTypeModel.create({
      name: createHousingTypeDto.name,
      description: createHousingTypeDto.description,
    } as any);

    return this.findOne(housingType.id);
  }

  async findAll(filterDto: FilterHousingTypeDto): Promise<HousingType[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause.name = {
        [Op.iLike]: `%${filterDto.search}%`,
      };
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.housingTypeModel.findAll({
      where: whereClause,
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<HousingType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid housing type ID");
    }

    const housingType = await this.housingTypeModel.findByPk(id);

    if (!housingType) {
      throw new NotFoundException(`Housing type with ID ${id} not found`);
    }

    return housingType;
  }

  async update(
    id: number,
    updateHousingTypeDto: UpdateHousingTypeDto
  ): Promise<HousingType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid housing type ID");
    }

    const housingType = await this.findOne(id);

    if (
      updateHousingTypeDto.name &&
      updateHousingTypeDto.name !== housingType.name
    ) {
      const existingHousingType = await this.housingTypeModel.findOne({
        where: {
          name: updateHousingTypeDto.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingHousingType) {
        throw new ConflictException(
          "Housing type with this name already exists"
        );
      }
    }

    await housingType.update(updateHousingTypeDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid housing type ID");
    }

    const housingType = await this.findOne(id);

    const studentCount = await housingType.$count("infoStudents");
    if (studentCount > 0) {
      throw new ConflictException(
        "Cannot delete housing type with associated students"
      );
    }

    await housingType.destroy();
    return { message: "Housing type deleted successfully" };
  }

  async toggleStatus(id: number): Promise<HousingType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid housing type ID");
    }

    const housingType = await this.findOne(id);
    await housingType.update({ is_active: !housingType.is_active });

    return this.findOne(id);
  }

  async getHousingTypesCount(): Promise<{ total: number; active: number }> {
    const total = await this.housingTypeModel.count();
    const active = await this.housingTypeModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }
}
