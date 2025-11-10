import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Department } from "./models/department.model";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { FilterDepartmentDto } from "./dto/filter-department.dto";
import { Faculty } from "../faculties/models/faculty.model";
import { Op } from "sequelize";

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department)
    private readonly departmentModel: typeof Department,
    @InjectModel(Faculty)
    private readonly facultyModel: typeof Faculty
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    if (!createDepartmentDto?.name || !createDepartmentDto?.faculty_id) {
      throw new BadRequestException(
        "Department name and faculty ID are required"
      );
    }

    const faculty = await this.facultyModel.findByPk(
      createDepartmentDto.faculty_id
    );
    if (!faculty) {
      throw new NotFoundException("Faculty not found");
    }

    const existingDepartment = await this.departmentModel.findOne({
      where: {
        name: createDepartmentDto.name,
        faculty_id: createDepartmentDto.faculty_id,
      },
    });

    if (existingDepartment) {
      throw new ConflictException(
        "Department with this name already exists in this faculty"
      );
    }

    const department = await this.departmentModel.create({
      name: createDepartmentDto.name,
      faculty_id: createDepartmentDto.faculty_id,
      code: createDepartmentDto.code,
      description: createDepartmentDto.description,
    } as any);
    return this.findOne(department.id);
  }

  async findAll(filterDto: FilterDepartmentDto): Promise<Department[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause.name = {
        [Op.iLike]: `%${filterDto.search}%`,
      };
    }

    if (filterDto.faculty_id) {
      whereClause.faculty_id = filterDto.faculty_id;
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.departmentModel.findAll({
      where: whereClause,
      include: [
        {
          model: Faculty,
          attributes: ["id", "name", "building_number"],
        },
      ],
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Department> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid department ID");
    }

    const department = await this.departmentModel.findByPk(id, {
      include: [
        {
          model: Faculty,
          attributes: ["id", "name", "building_number", "phone"],
        },
      ],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async findDepartmentsByFaculty(facultyId: number): Promise<Department[]> {
    if (!facultyId || isNaN(facultyId)) {
      throw new BadRequestException("Invalid faculty ID");
    }

    const faculty = await this.facultyModel.findByPk(facultyId);
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${facultyId} not found`);
    }

    return this.departmentModel.findAll({
      where: { faculty_id: facultyId, is_active: true },
      include: [
        {
          model: Faculty,
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });
  }

  async update(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto
  ): Promise<Department> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid department ID");
    }

    const department = await this.findOne(id);

    if (updateDepartmentDto.faculty_id) {
      const faculty = await this.facultyModel.findByPk(
        updateDepartmentDto.faculty_id
      );
      if (!faculty) {
        throw new NotFoundException("Faculty not found");
      }
    }

    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== department.name
    ) {
      const existingDepartment = await this.departmentModel.findOne({
        where: {
          name: updateDepartmentDto.name,
          faculty_id: updateDepartmentDto.faculty_id || department.faculty_id,
          id: { [Op.ne]: id },
        },
      });

      if (existingDepartment) {
        throw new ConflictException(
          "Department with this name already exists in this faculty"
        );
      }
    }

    await department.update(updateDepartmentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid department ID");
    }

    const department = await this.findOne(id);
    await department.destroy();

    return { message: "Department deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Department> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid department ID");
    }

    const department = await this.findOne(id);
    await department.update({ is_active: !department.is_active });

    return this.findOne(id);
  }

  async getDepartmentsCount(): Promise<{ total: number; active: number }> {
    const total = await this.departmentModel.count();
    const active = await this.departmentModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }

  async getDepartmentsCountByFaculty(
    facultyId: number
  ): Promise<{ total: number; active: number }> {
    if (!facultyId || isNaN(facultyId)) {
      throw new BadRequestException("Invalid faculty ID");
    }

    const faculty = await this.facultyModel.findByPk(facultyId);
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${facultyId} not found`);
    }

    const total = await this.departmentModel.count({
      where: { faculty_id: facultyId },
    });
    const active = await this.departmentModel.count({
      where: {
        faculty_id: facultyId,
        is_active: true,
      },
    });

    return { total, active };
  }
}
