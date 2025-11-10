import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { StudyForm } from "./models/study_form.model";
import { CreateStudyFormDto } from "./dto/create-study_form.dto";
import { UpdateStudyFormDto } from "./dto/update-study_form.dto";
import { FilterStudyFormDto } from "./dto/filter-study_form.dto";
import { Op } from "sequelize";

@Injectable()
export class StudyFormsService {
  constructor(
    @InjectModel(StudyForm)
    private readonly studyFormModel: typeof StudyForm
  ) {}

  async create(createStudyFormDto: CreateStudyFormDto): Promise<StudyForm> {
    if (!createStudyFormDto?.name || !createStudyFormDto?.duration_years) {
      throw new BadRequestException(
        "Study form name and duration are required"
      );
    }

    const existingStudyForm = await this.studyFormModel.findOne({
      where: { name: createStudyFormDto.name },
    });

    if (existingStudyForm) {
      throw new ConflictException("Study form with this name already exists");
    }

    const studyForm = await this.studyFormModel.create({
      name: createStudyFormDto.name,
      duration_years: createStudyFormDto.duration_years,
      description: createStudyFormDto.description,
    } as any);

    return this.findOne(studyForm.id);
  }

  async findAll(filterDto: FilterStudyFormDto): Promise<StudyForm[]> {
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

    return this.studyFormModel.findAll({
      where: whereClause,
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<StudyForm> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid study form ID");
    }

    const studyForm = await this.studyFormModel.findByPk(id);

    if (!studyForm) {
      throw new NotFoundException(`Study form with ID ${id} not found`);
    }

    return studyForm;
  }

  async update(
    id: number,
    updateStudyFormDto: UpdateStudyFormDto
  ): Promise<StudyForm> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid study form ID");
    }

    const studyForm = await this.findOne(id);

    if (updateStudyFormDto.name && updateStudyFormDto.name !== studyForm.name) {
      const existingStudyForm = await this.studyFormModel.findOne({
        where: {
          name: updateStudyFormDto.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingStudyForm) {
        throw new ConflictException("Study form with this name already exists");
      }
    }

    await studyForm.update(updateStudyFormDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid study form ID");
    }

    const studyForm = await this.findOne(id);

    const studentCount = await studyForm.$count("infoStudents");
    if (studentCount > 0) {
      throw new ConflictException(
        "Cannot delete study form with associated students"
      );
    }

    await studyForm.destroy();
    return { message: "Study form deleted successfully" };
  }

  async toggleStatus(id: number): Promise<StudyForm> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid study form ID");
    }

    const studyForm = await this.findOne(id);
    await studyForm.update({ is_active: !studyForm.is_active });

    return this.findOne(id);
  }

  async getStudyFormsCount(): Promise<{ total: number; active: number }> {
    const total = await this.studyFormModel.count();
    const active = await this.studyFormModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }
}
