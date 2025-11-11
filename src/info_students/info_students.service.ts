import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { InfoStudent } from "./models/info_student.model";
import { Student } from "../students/models/student.model";
import { StudyForm } from "../study_forms/models/study_form.model";
import { EducationType } from "../education_types/models/education_type.model";
import { ContractType } from "../contract_types/models/contract_type.model";
import { Group } from "../groups/models/group.model";
import { Faculty } from "../faculties/models/faculty.model";
import { HousingType } from "../housing_types/models/housing_type.model";
import { DormitoryRoom } from "../dormitories/models/dormitory-room.model";
import { CreateInfoStudentDto } from "./dto/create-info_student.dto";
import { UpdateInfoStudentDto } from "./dto/update-info_student.dto";
import { FilterInfoStudentDto } from "./dto/filter-info-student.dto";

@Injectable()
export class InfoStudentsService {
  constructor(
    @InjectModel(InfoStudent)
    private readonly infoStudentModel: typeof InfoStudent,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(StudyForm)
    private readonly studyFormModel: typeof StudyForm,
    @InjectModel(EducationType)
    private readonly educationTypeModel: typeof EducationType,
    @InjectModel(ContractType)
    private readonly contractTypeModel: typeof ContractType,
    @InjectModel(Group)
    private readonly groupModel: typeof Group,
    @InjectModel(Faculty)
    private readonly facultyModel: typeof Faculty,
    @InjectModel(HousingType)
    private readonly housingTypeModel: typeof HousingType,
    @InjectModel(DormitoryRoom)
    private readonly dormitoryRoomModel: typeof DormitoryRoom
  ) {}

  async create(
    createInfoStudentDto: CreateInfoStudentDto
  ): Promise<InfoStudent> {
    if (
      !createInfoStudentDto?.student_id ||
      !createInfoStudentDto?.passport_series ||
      !createInfoStudentDto?.JSHSHIR
    ) {
      throw new BadRequestException(
        "Student ID, passport series and JSHSHIR are required"
      );
    }

    const student = await this.studentModel.findByPk(
      createInfoStudentDto.student_id
    );
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const existingInfo = await this.infoStudentModel.findOne({
      where: { student_id: createInfoStudentDto.student_id },
    });
    if (existingInfo) {
      throw new ConflictException(
        "Student information already exists for this student"
      );
    }

    const existingPassport = await this.infoStudentModel.findOne({
      where: { passport_series: createInfoStudentDto.passport_series },
    });
    if (existingPassport) {
      throw new ConflictException("Passport series already exists");
    }

    const existingJSHSHIR = await this.infoStudentModel.findOne({
      where: { JSHSHIR: createInfoStudentDto.JSHSHIR },
    });
    if (existingJSHSHIR) {
      throw new ConflictException("JSHSHIR already exists");
    }

    await this.validateRelatedEntities(createInfoStudentDto);

    const infoStudent = await this.infoStudentModel.create({
      student_id: createInfoStudentDto.student_id,
      birth_date: createInfoStudentDto.birth_date,
      gender: createInfoStudentDto.gender,
      passport_series: createInfoStudentDto.passport_series,
      JSHSHIR: createInfoStudentDto.JSHSHIR,
      study_form_id: createInfoStudentDto.study_form_id,
      education_type_id: createInfoStudentDto.education_type_id,
      contract_type_id: createInfoStudentDto.contract_type_id,
      group_id: createInfoStudentDto.group_id,
      faculty_id: createInfoStudentDto.faculty_id,
      housing_type_id: createInfoStudentDto.housing_type_id,
      join_year: createInfoStudentDto.join_year,
      status: createInfoStudentDto.status || "ACTIVE",
      dormitory_room_id: createInfoStudentDto.dormitory_room_id,
    } as any);

    return this.findOne(infoStudent.id);
  }

  async findAll(filterDto: FilterInfoStudentDto): Promise<InfoStudent[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause[Op.or] = [
        { passport_series: { [Op.iLike]: `%${filterDto.search}%` } },
        { JSHSHIR: { [Op.iLike]: `%${filterDto.search}%` } },
      ];
    }

    if (filterDto.faculty_id) {
      whereClause.faculty_id = filterDto.faculty_id;
    }

    if (filterDto.group_id) {
      whereClause.group_id = filterDto.group_id;
    }

    if (filterDto.study_form_id) {
      whereClause.study_form_id = filterDto.study_form_id;
    }

    if (filterDto.education_type_id) {
      whereClause.education_type_id = filterDto.education_type_id;
    }

    if (filterDto.contract_type_id) {
      whereClause.contract_type_id = filterDto.contract_type_id;
    }

    if (filterDto.status) {
      whereClause.status = filterDto.status;
    }

    if (filterDto.join_year) {
      whereClause.join_year = filterDto.join_year;
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.infoStudentModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Faculty,
          attributes: ["id", "name"],
        },
      ],
      order: [
        [filterDto.sort_by || "createdAt", filterDto.sort_order || "ASC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<InfoStudent> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid info student ID");
    }

    const infoStudent = await this.infoStudentModel.findByPk(id, {
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email", "address"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!infoStudent) {
      throw new NotFoundException(
        `Student information with ID ${id} not found`
      );
    }

    return infoStudent;
  }

  async findOneFull(id: number): Promise<InfoStudent> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid info student ID");
    }

    const infoStudent = await this.infoStudentModel.findByPk(id, {
      include: [
        {
          model: Student,
          attributes: [
            "id",
            "full_name",
            "phone",
            "email",
            "address",
            "balance",
            "image_url",
          ],
        },
        {
          model: StudyForm,
          attributes: ["id", "name", "duration_years"],
        },
        {
          model: EducationType,
          attributes: ["id", "name", "duration_years"],
        },
        {
          model: ContractType,
          attributes: ["id", "name", "coverage_percent"],
        },
        {
          model: Group,
          include: [
            {
              model: Group.associations.department.target,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Faculty,
          attributes: ["id", "name", "building_number"],
        },
        {
          model: HousingType,
          attributes: ["id", "name"],
        },
        {
          model: DormitoryRoom,
          include: [
            {
              model: DormitoryRoom.associations.dormitory.target,
              attributes: ["id", "name", "address"],
            },
          ],
        },
      ],
    });

    if (!infoStudent) {
      throw new NotFoundException(
        `Student information with ID ${id} not found`
      );
    }

    return infoStudent;
  }

  async findByStudent(studentId: number): Promise<InfoStudent> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const infoStudent = await this.infoStudentModel.findOne({
      where: { student_id: studentId },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email", "address"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Faculty,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!infoStudent) {
      throw new NotFoundException(
        `Student information for student ID ${studentId} not found`
      );
    }

    return infoStudent;
  }

  async findByGroup(groupId: number): Promise<InfoStudent[]> {
    if (!groupId || isNaN(groupId)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.groupModel.findByPk(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.infoStudentModel.findAll({
      where: {
        group_id: groupId,
        is_active: true,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
      ],
      order: [[{ model: Student, as: "student" }, "full_name", "ASC"]],
    });
  }

  async findByFaculty(facultyId: number): Promise<InfoStudent[]> {
    if (!facultyId || isNaN(facultyId)) {
      throw new BadRequestException("Invalid faculty ID");
    }

    const faculty = await this.facultyModel.findByPk(facultyId);
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${facultyId} not found`);
    }

    return this.infoStudentModel.findAll({
      where: {
        faculty_id: facultyId,
        is_active: true,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Faculty,
          attributes: ["id", "name"],
        },
      ],
      order: [[{ model: Group, as: "group" }, "name", "ASC"]],
    });
  }

  async findByStatus(status: string): Promise<InfoStudent[]> {
    const validStatuses = [
      "ACTIVE",
      "ACADEMIC_LEAVE",
      "GRADUATED",
      "EXPELLED",
      "TRANSFERRED",
      "",
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException("Invalid status");
    }

    return this.infoStudentModel.findAll({
      where: {
        status: status,
        is_active: true,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Faculty,
          attributes: ["id", "name"],
        },
      ],
      order: [[{ model: Student, as: "student" }, "full_name", "ASC"]],
    });
  }

  async update(
    id: number,
    updateInfoStudentDto: UpdateInfoStudentDto
  ): Promise<InfoStudent> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid info student ID");
    }

    const infoStudent = await this.findOne(id);

    if (
      updateInfoStudentDto.passport_series &&
      updateInfoStudentDto.passport_series !== infoStudent.passport_series
    ) {
      const existingPassport = await this.infoStudentModel.findOne({
        where: {
          passport_series: updateInfoStudentDto.passport_series,
          id: { [Op.ne]: id },
        },
      });
      if (existingPassport) {
        throw new ConflictException("Passport series already exists");
      }
    }

    if (
      updateInfoStudentDto.JSHSHIR &&
      updateInfoStudentDto.JSHSHIR !== infoStudent.JSHSHIR
    ) {
      const existingJSHSHIR = await this.infoStudentModel.findOne({
        where: {
          JSHSHIR: updateInfoStudentDto.JSHSHIR,
          id: { [Op.ne]: id },
        },
      });
      if (existingJSHSHIR) {
        throw new ConflictException("JSHSHIR already exists");
      }
    }

    await this.validateRelatedEntities(updateInfoStudentDto);

    await infoStudent.update(updateInfoStudentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid info student ID");
    }

    const infoStudent = await this.findOne(id);
    await infoStudent.destroy();

    return { message: "Student information deleted successfully" };
  }

  async toggleStatus(id: number): Promise<InfoStudent> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid info student ID");
    }

    const infoStudent = await this.findOne(id);
    await infoStudent.update({ is_active: !infoStudent.is_active });

    return this.findOne(id);
  }

  async changeStatus(id: number, status: string): Promise<InfoStudent> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid info student ID");
    }

    const validStatuses = [
      "ACTIVE",
      "ACADEMIC_LEAVE",
      "GRADUATED",
      "EXPELLED",
      "TRANSFERRED",
      "",
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException("Invalid status");
    }

    const infoStudent = await this.findOne(id);
    await infoStudent.update({ status });

    return this.findOne(id);
  }

  async getInfoStudentsCount(): Promise<{ total: number; active: number }> {
    const total = await this.infoStudentModel.count();
    const active = await this.infoStudentModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }

  private async validateRelatedEntities(dto: any): Promise<void> {
    if (dto.study_form_id) {
      const studyForm = await this.studyFormModel.findByPk(dto.study_form_id);
      if (!studyForm) {
        throw new NotFoundException("Study form not found");
      }
    }

    if (dto.education_type_id) {
      const educationType = await this.educationTypeModel.findByPk(
        dto.education_type_id
      );
      if (!educationType) {
        throw new NotFoundException("Education type not found");
      }
    }

    if (dto.contract_type_id) {
      const contractType = await this.contractTypeModel.findByPk(
        dto.contract_type_id
      );
      if (!contractType) {
        throw new NotFoundException("Contract type not found");
      }
    }

    if (dto.group_id) {
      const group = await this.groupModel.findByPk(dto.group_id);
      if (!group) {
        throw new NotFoundException("Group not found");
      }
    }

    if (dto.faculty_id) {
      const faculty = await this.facultyModel.findByPk(dto.faculty_id);
      if (!faculty) {
        throw new NotFoundException("Faculty not found");
      }
    }

    if (dto.housing_type_id) {
      const housingType = await this.housingTypeModel.findByPk(
        dto.housing_type_id
      );
      if (!housingType) {
        throw new NotFoundException("Housing type not found");
      }
    }

    if (dto.dormitory_room_id) {
      const dormitoryRoom = await this.dormitoryRoomModel.findByPk(
        dto.dormitory_room_id
      );
      if (!dormitoryRoom) {
        throw new NotFoundException("Dormitory room not found");
      }
    }
  }
}
