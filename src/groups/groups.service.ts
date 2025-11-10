import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Group } from "./models/group.model";
import { Department } from "../departments/models/department.model";
import { Student } from "../students/models/student.model";
// import { InfoStudent } from "../info-students/models/info-student.model";
import { Schedule } from "../schedules/models/schedule.model";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { FilterGroupDto } from "./dto/filter-group.dto";

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group)
    private readonly groupModel: typeof Group,
    @InjectModel(Department)
    private readonly departmentModel: typeof Department
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    if (!createGroupDto?.name || !createGroupDto?.department_id) {
      throw new BadRequestException(
        "Group name and department ID are required"
      );
    }

    const department = await this.departmentModel.findByPk(
      createGroupDto.department_id
    );
    if (!department) {
      throw new NotFoundException("Department not found");
    }

    const existingGroup = await this.groupModel.findOne({
      where: {
        name: createGroupDto.name,
        department_id: createGroupDto.department_id,
      },
    });

    if (existingGroup) {
      throw new ConflictException(
        "Group with this name already exists in this department"
      );
    }

    const group = await this.groupModel.create({
      name: createGroupDto.name,
      department_id: createGroupDto.department_id,
      course_number: createGroupDto.course_number,
      description: createGroupDto.description,
    } as any);

    return this.findOne(group.id);
  }

  async findAll(filterDto: FilterGroupDto): Promise<Group[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause.name = {
        [Op.iLike]: `%${filterDto.search}%`,
      };
    }

    if (filterDto.department_id) {
      whereClause.department_id = filterDto.department_id;
    }

    if (filterDto.course_number) {
      whereClause.course_number = filterDto.course_number;
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.groupModel.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Group> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.groupModel.findByPk(id, {
      include: [
        {
          model: Department,
          attributes: ["id", "name", "faculty_id"],
        },
      ],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async findByDepartment(departmentId: number): Promise<Group[]> {
    if (!departmentId || isNaN(departmentId)) {
      throw new BadRequestException("Invalid department ID");
    }

    const department = await this.departmentModel.findByPk(departmentId);
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`
      );
    }

    return this.groupModel.findAll({
      where: {
        department_id: departmentId,
        is_active: true,
      },
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });
  }

  async findByCourse(courseNumber: number): Promise<Group[]> {
    if (!courseNumber || courseNumber < 1 || courseNumber > 6) {
      throw new BadRequestException("Invalid course number");
    }

    return this.groupModel.findAll({
      where: {
        course_number: courseNumber,
        is_active: true,
      },
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.findOne(id);

    if (updateGroupDto.department_id) {
      const department = await this.departmentModel.findByPk(
        updateGroupDto.department_id
      );
      if (!department) {
        throw new NotFoundException("Department not found");
      }
    }

    if (updateGroupDto.name && updateGroupDto.name !== group.name) {
      const existingGroup = await this.groupModel.findOne({
        where: {
          name: updateGroupDto.name,
          department_id: updateGroupDto.department_id || group.department_id,
          id: { [Op.ne]: id },
        },
      });

      if (existingGroup) {
        throw new ConflictException(
          "Group with this name already exists in this department"
        );
      }
    }

    await group.update(updateGroupDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.findOne(id);

    // Check if group has related records
    const studentsCount = await group.$count("infoStudents");
    const schedulesCount = await group.$count("schedules");
    const examsCount = await group.$count("exams");

    if (studentsCount > 0 || schedulesCount > 0 || examsCount > 0) {
      throw new ConflictException(
        "Cannot delete group with related records (students, schedules, or exams)"
      );
    }

    await group.destroy();
    return { message: "Group deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Group> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.findOne(id);
    await group.update({ is_active: !group.is_active });

    return this.findOne(id);
  }

  async getGroupWithStudents(id: number): Promise<Group> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.groupModel.findByPk(id, {
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
        // {
        //   model: InfoStudent,
        //   include: [
        //     {
        //       model: Student,
        //       attributes: ["id", "full_name", "phone", "email"],
        //     },
        //   ],
        // },
      ],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async getGroupWithSchedules(id: number): Promise<Group> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.groupModel.findByPk(id, {
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
        {
          model: Schedule,
          attributes: [
            "id",
            "day_of_week",
            "start_time",
            "end_time",
            "subject_id",
            "teacher_id",
            "classroom_id",
          ],
        },
      ],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async getGroupsCount(): Promise<{ total: number; active: number }> {
    const total = await this.groupModel.count();
    const active = await this.groupModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }

  async getGroupsCountByDepartment(
    departmentId: number
  ): Promise<{ total: number; active: number }> {
    if (!departmentId || isNaN(departmentId)) {
      throw new BadRequestException("Invalid department ID");
    }

    const department = await this.departmentModel.findByPk(departmentId);
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`
      );
    }

    const total = await this.groupModel.count({
      where: { department_id: departmentId },
    });
    const active = await this.groupModel.count({
      where: {
        department_id: departmentId,
        is_active: true,
      },
    });

    return { total, active };
  }
}
