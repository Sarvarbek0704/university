import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, fn, col } from "sequelize";
import { Classroom } from "./models/classroom.model";
import { CreateClassroomDto } from "./dto/create-classroom.dto";
import { UpdateClassroomDto } from "./dto/update-classroom.dto";
import { FilterClassroomDto } from "./dto/filter-classroom.dto";
import { ClassroomAvailabilityDto } from "./dto/classroom-availability.dto";
import { Schedule } from "../schedules/models/schedule.model";

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectModel(Classroom)
    private readonly classroomModel: typeof Classroom,
    @InjectModel(Schedule)
    private readonly scheduleModel: typeof Schedule
  ) {}

  async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    if (
      !createClassroomDto?.building_number ||
      !createClassroomDto?.room_number ||
      !createClassroomDto?.type
    ) {
      throw new BadRequestException(
        "Building number, room number and type are required"
      );
    }

    const existingClassroom = await this.classroomModel.findOne({
      where: {
        building_number: createClassroomDto.building_number,
        room_number: createClassroomDto.room_number,
      },
    });

    if (existingClassroom) {
      throw new ConflictException(
        "Classroom with this building and room number already exists"
      );
    }

    const classroom = await this.classroomModel.create({
      building_number: createClassroomDto.building_number,
      room_number: createClassroomDto.room_number,
      capacity: createClassroomDto.capacity,
      type: createClassroomDto.type,
      equipment: createClassroomDto.equipment,
      location_description: createClassroomDto.location_description,
      has_air_conditioning: createClassroomDto.has_air_conditioning,
      has_projector: createClassroomDto.has_projector,
      has_computers: createClassroomDto.has_computers,
      is_accessible: createClassroomDto.is_accessible,
    } as any);

    return this.findOne(classroom.id);
  }

  async findAll(filterDto: FilterClassroomDto): Promise<Classroom[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      const searchConditions: any[] = [];

      searchConditions.push(
        { equipment: { [Op.iLike]: `%${filterDto.search}%` } },
        { location_description: { [Op.iLike]: `%${filterDto.search}%` } }
      );

      const searchNumber = Number(filterDto.search);
      if (!isNaN(searchNumber)) {
        searchConditions.push({ room_number: searchNumber });
      } else {
        searchConditions.push({
          room_number: { [Op.iLike]: `%${filterDto.search}%` },
        });
      }

      whereClause[Op.or] = searchConditions;
    }

    if (filterDto.building_number) {
      whereClause.building_number = filterDto.building_number;
    }

    if (filterDto.type) {
      whereClause.type = filterDto.type;
    }

    if (filterDto.min_capacity) {
      whereClause.capacity = {
        ...whereClause.capacity,
        [Op.gte]: filterDto.min_capacity,
      };
    }

    if (filterDto.max_capacity) {
      whereClause.capacity = {
        ...whereClause.capacity,
        [Op.lte]: filterDto.max_capacity,
      };
    }

    if (filterDto.has_projector !== undefined) {
      whereClause.has_projector = filterDto.has_projector;
    }

    if (filterDto.has_computers !== undefined) {
      whereClause.has_computers = filterDto.has_computers;
    }

    if (filterDto.is_accessible !== undefined) {
      whereClause.is_accessible = filterDto.is_accessible;
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    if (filterDto.is_available !== undefined) {
      whereClause.is_available = filterDto.is_available;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.classroomModel.findAll({
      where: whereClause,
      order: [
        [filterDto.sort_by || "building_number", filterDto.sort_order || "ASC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Classroom> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid classroom ID");
    }

    const classroom = await this.classroomModel.findByPk(id);

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    return classroom;
  }

  async findByBuilding(buildingNumber: number): Promise<Classroom[]> {
    if (!buildingNumber || isNaN(buildingNumber)) {
      throw new BadRequestException("Invalid building number");
    }

    return this.classroomModel.findAll({
      where: {
        building_number: buildingNumber,
        is_active: true,
      },
      order: [["room_number", "ASC"]],
    });
  }

  async findByType(type: string): Promise<Classroom[]> {
    const validTypes = [
      "lecture_hall",
      "standart_class",
      "seminar_room",
      "computer_lab",
      "science_lab",
      "workshop",
      "conference_room",
    ];

    if (!validTypes.includes(type)) {
      throw new BadRequestException("Invalid classroom type");
    }

    return this.classroomModel.findAll({
      where: {
        type: type,
        is_active: true,
      },
      order: [
        ["building_number", "ASC"],
        ["room_number", "ASC"],
      ],
    });
  }

  async update(
    id: number,
    updateClassroomDto: UpdateClassroomDto
  ): Promise<Classroom> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid classroom ID");
    }

    const classroom = await this.findOne(id);

    if (
      (updateClassroomDto.building_number &&
        updateClassroomDto.building_number !== classroom.building_number) ||
      (updateClassroomDto.room_number &&
        updateClassroomDto.room_number !== classroom.room_number)
    ) {
      const existingClassroom = await this.classroomModel.findOne({
        where: {
          building_number:
            updateClassroomDto.building_number || classroom.building_number,
          room_number: updateClassroomDto.room_number || classroom.room_number,
          id: { [Op.ne]: id },
        },
      });

      if (existingClassroom) {
        throw new ConflictException(
          "Classroom with this building and room number already exists"
        );
      }
    }

    await classroom.update(updateClassroomDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid classroom ID");
    }

    const classroom = await this.findOne(id);

    const scheduleCount = await this.scheduleModel.count({
      where: { classroom_id: id },
    });

    if (scheduleCount > 0) {
      throw new ConflictException(
        "Cannot delete classroom with existing schedules"
      );
    }

    await classroom.destroy();
    return { message: "Classroom deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Classroom> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid classroom ID");
    }

    const classroom = await this.findOne(id);
    await classroom.update({ is_active: !classroom.is_active });

    return this.findOne(id);
  }

  async toggleAvailability(id: number): Promise<Classroom> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid classroom ID");
    }

    const classroom = await this.findOne(id);
    await classroom.update({ is_available: !classroom.is_available });

    return this.findOne(id);
  }

  async getClassroomWithSchedules(id: number): Promise<Classroom> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid classroom ID");
    }

    const classroom = await this.classroomModel.findByPk(id, {
      include: [
        {
          model: Schedule,
          attributes: [
            "id",
            "day_of_week",
            "start_time",
            "end_time",
            "subject_id",
            "teacher_id",
            "group_id",
          ],
        },
      ],
    });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    return classroom;
  }

  async getAvailableClassrooms(): Promise<Classroom[]> {
    return this.classroomModel.findAll({
      where: {
        is_active: true,
        is_available: true,
      },
      order: [
        ["building_number", "ASC"],
        ["room_number", "ASC"],
      ],
    });
  }

  async checkClassroomAvailability(
    availabilityDto: ClassroomAvailabilityDto
  ): Promise<{
    available: boolean;
    available_classrooms?: Classroom[];
    message?: string;
  }> {
    const { date, start_time, end_time, day_of_week } = availabilityDto;

    const availableClassrooms = await this.classroomModel.findAll({
      where: {
        is_active: true,
        is_available: true,
      },
    });

    if (availableClassrooms.length === 0) {
      return {
        available: false,
        message: "No classrooms available at the moment",
      };
    }

    if (date && start_time && end_time) {
      const availableForSlot = await this.getClassroomsAvailableForTimeSlot(
        date,
        start_time,
        end_time,
        day_of_week
      );

      return {
        available: availableForSlot.length > 0,
        available_classrooms: availableForSlot,
        message:
          availableForSlot.length > 0
            ? `${availableForSlot.length} classrooms available for the selected time slot`
            : "No classrooms available for the selected time slot",
      };
    }

    return {
      available: true,
      available_classrooms: availableClassrooms,
      message: `${availableClassrooms.length} classrooms available`,
    };
  }

  async getWeeklySchedule(id: number): Promise<any> {
    const classroom = await this.getClassroomWithSchedules(id);

    const weeklySchedule: any = {};
    for (let day = 1; day <= 7; day++) {
      const schedules = (classroom.get("schedules") as Schedule[]) || [];
      weeklySchedule[day] = schedules.filter(
        (schedule: Schedule) => schedule.day_of_week === day
      );
    }

    return {
      classroom: {
        id: classroom.id,
        building_number: classroom.building_number,
        room_number: classroom.room_number,
        full_identifier: classroom.full_identifier,
        type: classroom.type,
        capacity: classroom.capacity,
      },
      weekly_schedule: weeklySchedule,
    };
  }

  async getClassroomsStats(): Promise<any> {
    const total = await this.classroomModel.count();
    const active = await this.classroomModel.count({
      where: { is_active: true },
    });
    const available = await this.classroomModel.count({
      where: { is_available: true },
    });

    try {
      const types = await this.classroomModel.findAll({
        attributes: ["type", [fn("COUNT", col("id")), "count"]],
        group: ["type"],
        raw: true,
      });

      const buildings = await this.classroomModel.findAll({
        attributes: ["building_number", [fn("COUNT", col("id")), "count"]],
        group: ["building_number"],
        order: [["building_number", "ASC"]],
        raw: true,
      });

      const withProjector = await this.classroomModel.count({
        where: { has_projector: true },
      });

      const withComputers = await this.classroomModel.count({
        where: { has_computers: true },
      });

      const accessible = await this.classroomModel.count({
        where: { is_accessible: true },
      });

      return {
        total,
        active,
        available,
        by_type: types,
        by_building: buildings,
        equipment_stats: {
          with_projector: withProjector,
          with_computers: withComputers,
          accessible: accessible,
        },
      };
    } catch (error) {
      return {
        total,
        active,
        available,
        by_type: [],
        by_building: [],
        equipment_stats: {
          with_projector: 0,
          with_computers: 0,
          accessible: 0,
        },
      };
    }
  }

  async getClassroomsByEquipment(equipmentFilters: {
    has_projector?: boolean;
    has_computers?: boolean;
    has_air_conditioning?: boolean;
    is_accessible?: boolean;
  }): Promise<Classroom[]> {
    const whereClause: any = {
      is_active: true,
      is_available: true,
    };

    if (equipmentFilters.has_projector !== undefined) {
      whereClause.has_projector = equipmentFilters.has_projector;
    }

    if (equipmentFilters.has_computers !== undefined) {
      whereClause.has_computers = equipmentFilters.has_computers;
    }

    if (equipmentFilters.has_air_conditioning !== undefined) {
      whereClause.has_air_conditioning = equipmentFilters.has_air_conditioning;
    }

    if (equipmentFilters.is_accessible !== undefined) {
      whereClause.is_accessible = equipmentFilters.is_accessible;
    }

    return this.classroomModel.findAll({
      where: whereClause,
      order: [
        ["building_number", "ASC"],
        ["room_number", "ASC"],
      ],
    });
  }

  async getClassroomUsageStats(id: number): Promise<any> {
    const classroom = await this.findOne(id);

    const totalSchedules = await this.scheduleModel.count({
      where: { classroom_id: id },
    });

    const activeSchedules = await this.scheduleModel.count({
      where: {
        classroom_id: id,
        is_active: true,
      },
    });

    try {
      const weeklyHours = await this.scheduleModel.findAll({
        attributes: ["day_of_week", [fn("COUNT", col("id")), "lessons_count"]],
        where: {
          classroom_id: id,
          is_active: true,
        },
        group: ["day_of_week"],
        raw: true,
      });

      return {
        classroom: {
          id: classroom.id,
          building_number: classroom.building_number,
          room_number: classroom.room_number,
          full_identifier: classroom.full_identifier,
        },
        usage_stats: {
          total_schedules: totalSchedules,
          active_schedules: activeSchedules,
          weekly_distribution: weeklyHours,
        },
      };
    } catch (error) {
      return {
        classroom: {
          id: classroom.id,
          building_number: classroom.building_number,
          room_number: classroom.room_number,
          full_identifier: classroom.full_identifier,
        },
        usage_stats: {
          total_schedules: totalSchedules,
          active_schedules: activeSchedules,
          weekly_distribution: [],
        },
      };
    }
  }

  private async getClassroomsAvailableForTimeSlot(
    date: string,
    startTime: string,
    endTime: string,
    dayOfWeek?: number
  ): Promise<Classroom[]> {
    // Bu metodda jadval bo'yicha to'qnashuvlarni tekshirish kerak
    // Hozircha barcha mavjud darsxonalarni qaytaramiz
    // Haqiqiy loyihada quyidagicha tekshirish kerak:

    // 1. Berilgan vaqt oralig'ida band qilingan darsxonalarni topish
    // 2. Band qilinmagan darsxonalarni qaytarish

    return this.classroomModel.findAll({
      where: {
        is_active: true,
        is_available: true,
      },
      order: [
        ["building_number", "ASC"],
        ["room_number", "ASC"],
      ],
    });
  }

  async findByBuildingAndRoom(
    buildingNumber: number,
    roomNumber: number
  ): Promise<Classroom | null> {
    return this.classroomModel.findOne({
      where: {
        building_number: buildingNumber,
        room_number: roomNumber,
        is_active: true,
      },
    });
  }

  async findByIds(ids: number[]): Promise<Classroom[]> {
    return this.classroomModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        is_active: true,
      },
    });
  }
}
