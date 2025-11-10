import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { ContractType } from "./models/contract_type.model";
import { CreateContractTypeDto } from "./dto/create-contract_type.dto";
import { UpdateContractTypeDto } from "./dto/update-contract_type.dto";
import { FilterContractTypeDto } from "./dto/filter-contract-type.dto";

@Injectable()
export class ContractTypesService {
  constructor(
    @InjectModel(ContractType)
    private readonly contractTypeModel: typeof ContractType
  ) {}

  async create(
    createContractTypeDto: CreateContractTypeDto
  ): Promise<ContractType> {
    if (!createContractTypeDto?.name) {
      throw new BadRequestException("Contract type name is required");
    }

    const existingContractType = await this.contractTypeModel.findOne({
      where: { name: createContractTypeDto.name },
    });

    if (existingContractType) {
      throw new ConflictException(
        "Contract type with this name already exists"
      );
    }

    const contractType = await this.contractTypeModel.create({
      name: createContractTypeDto.name,
      coverage_percent: createContractTypeDto.coverage_percent,
      description: createContractTypeDto.description,
    } as any);

    return this.findOne(contractType.id);
  }

  async findAll(filterDto: FilterContractTypeDto): Promise<ContractType[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause.name = {
        [Op.iLike]: `%${filterDto.search}%`,
      };
    }

    if (filterDto.min_coverage !== undefined) {
      whereClause.coverage_percent = {
        ...whereClause.coverage_percent,
        [Op.gte]: filterDto.min_coverage,
      };
    }

    if (filterDto.max_coverage !== undefined) {
      whereClause.coverage_percent = {
        ...whereClause.coverage_percent,
        [Op.lte]: filterDto.max_coverage,
      };
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.contractTypeModel.findAll({
      where: whereClause,
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<ContractType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid contract type ID");
    }

    const contractType = await this.contractTypeModel.findByPk(id);

    if (!contractType) {
      throw new NotFoundException(`Contract type with ID ${id} not found`);
    }

    return contractType;
  }

  async update(
    id: number,
    updateContractTypeDto: UpdateContractTypeDto
  ): Promise<ContractType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid contract type ID");
    }

    const contractType = await this.findOne(id);

    if (
      updateContractTypeDto.name &&
      updateContractTypeDto.name !== contractType.name
    ) {
      const existingContractType = await this.contractTypeModel.findOne({
        where: {
          name: updateContractTypeDto.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingContractType) {
        throw new ConflictException(
          "Contract type with this name already exists"
        );
      }
    }

    await contractType.update(updateContractTypeDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid contract type ID");
    }

    const contractType = await this.findOne(id);

    const studentCount = await contractType.$count("infoStudents");
    if (studentCount > 0) {
      throw new ConflictException(
        "Cannot delete contract type with associated students"
      );
    }

    await contractType.destroy();
    return { message: "Contract type deleted successfully" };
  }

  async toggleStatus(id: number): Promise<ContractType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid contract type ID");
    }

    const contractType = await this.findOne(id);
    await contractType.update({ is_active: !contractType.is_active });

    return this.findOne(id);
  }

  async getContractTypesCount(): Promise<{ total: number; active: number }> {
    const total = await this.contractTypeModel.count();
    const active = await this.contractTypeModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }
}
