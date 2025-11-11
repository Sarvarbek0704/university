import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Schedule } from "./models/schedule.model";
import { Group } from "../groups/models/group.model";
import { Subject } from "../subjects/models/subject.model";
import { Teacher } from "../teachers/models/teacher.model";
import { Classroom } from "../classrooms/models/classroom.model";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { FilterScheduleDto } from "./dto/filter-schedule.dto";
import { ScheduleConflictDto } from "./dto/schedule-conflict.dto";

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Schedule)
    private readonly scheduleModel: typeof Schedule,
    @InjectModel(Group)
    private readonly groupModel: typeof Group,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject,
    @InjectModel(Teacher)
    private readonly teacherModel: typeof Teacher,
    @InjectModel(Classroom)
    private readonly classroomModel: typeof Classroom
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    // Bog'liq modellarni tekshirish
    await this.validateRelatedEntities(createScheduleDto);

    // Vaqt to'qnashuvini tekshirish
    const conflicts = await this.checkScheduleConflicts(createScheduleDto);
    if (conflicts.hasConflicts) {
      throw new ConflictException(
        `Schedule conflicts detected: ${conflicts.conflicts.join(", ")}`
      );
    }

    const schedule = await this.scheduleModel.create({
      group_id: createScheduleDto.group_id,
      subject_id: createScheduleDto.subject_id,
      teacher_id: createScheduleDto.teacher_id,
      classroom_id: createScheduleDto.classroom_id,
      day_of_week: createScheduleDto.day_of_week,
      start_time: createScheduleDto.start_time,
      end_time: createScheduleDto.end_time,
      specific_date: createScheduleDto.specific_date,
      notes: createScheduleDto.notes,
      is_active: createScheduleDto.is_active ?? true,
    } as any);

    return this.findOne(schedule.id);
  }

  async findAll(filterDto: FilterScheduleDto): Promise<Schedule[]> {
    const whereClause: any = {};

    if (filterDto.group_id) {
      whereClause.group_id = filterDto.group_id;
    }

    if (filterDto.subject_id) {
      whereClause.subject_id = filterDto.subject_id;
    }

    if (filterDto.teacher_id) {
      whereClause.teacher_id = filterDto.teacher_id;
    }

    if (filterDto.classroom_id) {
      whereClause.classroom_id = filterDto.classroom_id;
    }

    if (filterDto.day_of_week) {
      whereClause.day_of_week = filterDto.day_of_week;
    }

    if (filterDto.date_from && filterDto.date_to) {
      whereClause.createdAt = {
        [Op.between]: [filterDto.date_from, filterDto.date_to],
      };
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.scheduleModel.findAll({
      where: whereClause,
      include: [
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name", "email"],
        },
        {
          model: Classroom,
          attributes: ["id", "building_number", "room_number", "type"],
        },
      ],
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Schedule> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid schedule ID");
    }

    const schedule = await this.scheduleModel.findByPk(id, {
      include: [
        {
          model: Group,
          attributes: ["id", "name", "course_number"],
        },
        {
          model: Subject,
          attributes: ["id", "name", "credit", "semester_number"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name", "email", "phone", "position"],
        },
        {
          model: Classroom,
          attributes: [
            "id",
            "building_number",
            "room_number",
            "type",
            "capacity",
            "equipment",
          ],
        },
      ],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async findByGroup(groupId: number): Promise<Schedule[]> {
    if (!groupId || isNaN(groupId)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.groupModel.findByPk(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.scheduleModel.findAll({
      where: {
        group_id: groupId,
        is_active: true,
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name"],
        },
        {
          model: Classroom,
          attributes: ["id", "building_number", "room_number"],
        },
      ],
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
    });
  }

  async findByTeacher(teacherId: number): Promise<Schedule[]> {
    if (!teacherId || isNaN(teacherId)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    const teacher = await this.teacherModel.findByPk(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    return this.scheduleModel.findAll({
      where: {
        teacher_id: teacherId,
        is_active: true,
      },
      include: [
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Subject,
          attributes: ["id", "name"],
        },
        {
          model: Classroom,
          attributes: ["id", "building_number", "room_number"],
        },
      ],
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
    });
  }

  async findByClassroom(classroomId: number): Promise<Schedule[]> {
    if (!classroomId || isNaN(classroomId)) {
      throw new BadRequestException("Invalid classroom ID");
    }

    const classroom = await this.classroomModel.findByPk(classroomId);
    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
    }

    return this.scheduleModel.findAll({
      where: {
        classroom_id: classroomId,
        is_active: true,
      },
      include: [
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Subject,
          attributes: ["id", "name"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name"],
        },
      ],
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
    });
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto
  ): Promise<Schedule> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid schedule ID");
    }

    const schedule = await this.findOne(id);

    // Yangilanishlar bo'lsa, bog'liq modellarni tekshirish
    if (
      updateScheduleDto.group_id ||
      updateScheduleDto.subject_id ||
      updateScheduleDto.teacher_id ||
      updateScheduleDto.classroom_id
    ) {
      await this.validateRelatedEntities({
        group_id: updateScheduleDto.group_id || schedule.group_id,
        subject_id: updateScheduleDto.subject_id || schedule.subject_id,
        teacher_id: updateScheduleDto.teacher_id || schedule.teacher_id,
        classroom_id: updateScheduleDto.classroom_id || schedule.classroom_id,
      } as any);
    }

    // Vaqt to'qnashuvini tekshirish (o'zini exclude qilish)
    if (
      updateScheduleDto.day_of_week ||
      updateScheduleDto.start_time ||
      updateScheduleDto.end_time ||
      updateScheduleDto.classroom_id ||
      updateScheduleDto.teacher_id ||
      updateScheduleDto.group_id
    ) {
      const conflictCheckDto: ScheduleConflictDto = {
        classroom_id: updateScheduleDto.classroom_id || schedule.classroom_id,
        teacher_id: updateScheduleDto.teacher_id || schedule.teacher_id,
        group_id: updateScheduleDto.group_id || schedule.group_id,
        day_of_week: updateScheduleDto.day_of_week || schedule.day_of_week,
        start_time: updateScheduleDto.start_time || schedule.start_time,
        end_time: updateScheduleDto.end_time || schedule.end_time,
        exclude_schedule_id: id,
      };

      const conflicts = await this.checkScheduleConflicts(conflictCheckDto);
      if (conflicts.hasConflicts) {
        throw new ConflictException(
          `Schedule conflicts detected: ${conflicts.conflicts.join(", ")}`
        );
      }
    }

    await schedule.update(updateScheduleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid schedule ID");
    }

    const schedule = await this.findOne(id);
    await schedule.destroy();

    return { message: "Schedule deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Schedule> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid schedule ID");
    }

    const schedule = await this.findOne(id);
    await schedule.update({ is_active: !schedule.is_active });

    return this.findOne(id);
  }

  async checkScheduleConflicts(
    scheduleDto: ScheduleConflictDto
  ): Promise<{ hasConflicts: boolean; conflicts: string[] }> {
    const conflicts: string[] = [];
    const whereClause: any = {
      day_of_week: scheduleDto.day_of_week,
      is_active: true,
    };

    // O'zini exclude qilish (update holati uchun)
    if (scheduleDto.exclude_schedule_id) {
      whereClause.id = { [Op.ne]: scheduleDto.exclude_schedule_id };
    }

    // Mavjud schedulelarni olish
    const existingSchedules = await this.scheduleModel.findAll({
      where: whereClause,
    });

    const newStart = new Date(`1970-01-01T${scheduleDto.start_time}`);
    const newEnd = new Date(`1970-01-01T${scheduleDto.end_time}`);

    for (const existingSchedule of existingSchedules) {
      const existingStart = new Date(
        `1970-01-01T${existingSchedule.start_time}`
      );
      const existingEnd = new Date(`1970-01-01T${existingSchedule.end_time}`);

      // Vaqt to'qnashuvi tekshirish
      const timeConflict = newStart < existingEnd && newEnd > existingStart;

      if (timeConflict) {
        // Classroom to'qnashuvi
        if (existingSchedule.classroom_id === scheduleDto.classroom_id) {
          conflicts.push(
            `Classroom is already occupied by ${existingSchedule.group?.name} from ${existingSchedule.start_time} to ${existingSchedule.end_time}`
          );
        }

        // Teacher to'qnashuvi
        if (existingSchedule.teacher_id === scheduleDto.teacher_id) {
          conflicts.push(
            `Teacher is already teaching ${existingSchedule.group?.name} from ${existingSchedule.start_time} to ${existingSchedule.end_time}`
          );
        }

        // Group to'qnashuvi
        if (existingSchedule.group_id === scheduleDto.group_id) {
          conflicts.push(
            `Group already has a class from ${existingSchedule.start_time} to ${existingSchedule.end_time}`
          );
        }
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }

  async getWeeklySchedule(groupId?: number, teacherId?: number): Promise<any> {
    const whereClause: any = { is_active: true };

    if (groupId) {
      whereClause.group_id = groupId;
    }

    if (teacherId) {
      whereClause.teacher_id = teacherId;
    }

    const schedules = await this.scheduleModel.findAll({
      where: whereClause,
      include: [
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name"],
        },
        {
          model: Classroom,
          attributes: ["id", "building_number", "room_number"],
        },
      ],
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    // Haftalik jadval strukturasini yaratish
    const weeklySchedule: any = {};
    for (let day = 1; day <= 7; day++) {
      weeklySchedule[day] = {
        day_name: this.getDayName(day),
        lessons: schedules.filter((schedule) => schedule.day_of_week === day),
      };
    }

    return {
      group_id: groupId,
      teacher_id: teacherId,
      weekly_schedule: weeklySchedule,
    };
  }

  async getScheduleStats(): Promise<any> {
    const total = await this.scheduleModel.count();
    const active = await this.scheduleModel.count({
      where: { is_active: true },
    });

    const byDay = await this.scheduleModel.findAll({
      attributes: [
        "day_of_week",
        [
          this.scheduleModel.sequelize!.fn(
            "COUNT",
            this.scheduleModel.sequelize!.col("id")
          ),
          "count",
        ],
      ],
      where: { is_active: true },
      group: ["day_of_week"],
      raw: true,
    });

    const byClassroom = await this.scheduleModel.findAll({
      attributes: [
        "classroom_id",
        [
          this.scheduleModel.sequelize!.fn(
            "COUNT",
            this.scheduleModel.sequelize!.col("id")
          ),
          "count",
        ],
      ],
      where: { is_active: true },
      group: ["classroom_id"],
      raw: true,
    });

    return {
      total,
      active,
      by_day: byDay.map((item: any) => ({
        day_of_week: item.day_of_week,
        day_name: this.getDayName(item.day_of_week),
        count: item.count,
      })),
      by_classroom: byClassroom,
    };
  }

  private async validateRelatedEntities(dto: {
    group_id: number;
    subject_id: number;
    teacher_id: number;
    classroom_id: number;
  }): Promise<void> {
    const [group, subject, teacher, classroom] = await Promise.all([
      this.groupModel.findByPk(dto.group_id),
      this.subjectModel.findByPk(dto.subject_id),
      this.teacherModel.findByPk(dto.teacher_id),
      this.classroomModel.findByPk(dto.classroom_id),
    ]);

    if (!group) throw new NotFoundException("Group not found");
    if (!subject) throw new NotFoundException("Subject not found");
    if (!teacher) throw new NotFoundException("Teacher not found");
    if (!classroom) throw new NotFoundException("Classroom not found");
    if (!classroom.is_active || !classroom.is_available) {
      throw new BadRequestException("Classroom is not available");
    }
  }

  private getDayName(dayOfWeek: number): string {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days[dayOfWeek - 1] || "Unknown";
  }

  // Schedules.service.ts ga qo'shimcha metodlar

  async getAvailableTimeSlots(
    classroomId: number,
    dayOfWeek: number,
    date?: string
  ): Promise<{ start_time: string; end_time: string; available: boolean }[]> {
    const existingSchedules = await this.scheduleModel.findAll({
      where: {
        classroom_id: classroomId,
        day_of_week: dayOfWeek,
        is_active: true,
        ...(date && { specific_date: date }),
      },
      order: [["start_time", "ASC"]],
    });

    // Kunlik ish vaqtlari
    const workHours = [
      { start: "08:00", end: "09:30" },
      { start: "09:45", end: "11:15" },
      { start: "11:30", end: "13:00" },
      { start: "14:00", end: "15:30" },
      { start: "15:45", end: "17:15" },
      { start: "17:30", end: "19:00" },
    ];

    const availableSlots = workHours.map((slot) => {
      const isOccupied = existingSchedules.some((schedule) => {
        const slotStart = new Date(`1970-01-01T${slot.start}`);
        const slotEnd = new Date(`1970-01-01T${slot.end}`);
        const scheduleStart = new Date(`1970-01-01T${schedule.start_time}`);
        const scheduleEnd = new Date(`1970-01-01T${schedule.end_time}`);

        return (
          (slotStart < scheduleEnd && slotEnd > scheduleStart) ||
          (scheduleStart < slotEnd && scheduleEnd > slotStart)
        );
      });

      return {
        start_time: slot.start,
        end_time: slot.end,
        available: !isOccupied,
      };
    });

    return availableSlots;
  }

  async getTeacherWorkload(
    teacherId: number,
    weekStart?: string
  ): Promise<any> {
    const whereClause: any = {
      teacher_id: teacherId,
      is_active: true,
    };

    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    const schedules = await this.scheduleModel.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
      ],
    });

    const weeklyWorkload = schedules.reduce((acc: any, schedule) => {
      const day = schedule.day_of_week;
      if (!acc[day]) {
        acc[day] = {
          day_name: this.getDayName(day),
          lessons: [],
          total_hours: 0,
        };
      }

      const duration = schedule.duration / 60; // Soatda
      acc[day].lessons.push({
        subject: schedule.subject.name,
        group: schedule.group.name,
        time: `${schedule.start_time} - ${schedule.end_time}`,
        duration: duration,
      });
      acc[day].total_hours += duration;

      return acc;
    }, {});

    const totalWeeklyHours = Object.values(weeklyWorkload).reduce(
      (total: number, day: any) => total + day.total_hours,
      0
    );

    return {
      teacher_id: teacherId,
      weekly_workload: weeklyWorkload,
      total_weekly_hours: totalWeeklyHours,
      total_lessons: schedules.length,
    };
  }

  async generateTimetable(groupId: number, semester?: number): Promise<any> {
    const whereClause: any = {
      group_id: groupId,
      is_active: true,
    };

    if (semester) {
      whereClause["$subject.semester_number$"] = semester;
    }

    const schedules = await this.scheduleModel.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit", "semester_number"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name"],
        },
        {
          model: Classroom,
          attributes: ["id", "building_number", "room_number"],
        },
      ],
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    // Kunlik jadval yaratish
    const timetable: any = {};
    for (let day = 1; day <= 7; day++) {
      const daySchedules = schedules.filter((s) => s.day_of_week === day);

      timetable[day] = {
        day_name: this.getDayName(day),
        lessons: daySchedules.map((schedule) => ({
          time: `${schedule.start_time} - ${schedule.end_time}`,
          subject: schedule.subject.name,
          teacher: schedule.teacher.full_name,
          classroom: `B${schedule.classroom.building_number}-R${schedule.classroom.room_number}`,
          duration: schedule.formattedDuration,
        })),
      };
    }

    const totalCredits = schedules.reduce(
      (sum, schedule) => sum + (schedule.subject.credit || 0),
      0
    );

    return {
      group_id: groupId,
      semester: semester,
      total_credits: totalCredits,
      total_lessons: schedules.length,
      timetable,
    };
  }

  async findConflictingSchedules(
    classroomId?: number,
    teacherId?: number,
    groupId?: number,
    dayOfWeek?: number
  ): Promise<Schedule[]> {
    const whereClause: any = { is_active: true };

    if (classroomId) whereClause.classroom_id = classroomId;
    if (teacherId) whereClause.teacher_id = teacherId;
    if (groupId) whereClause.group_id = groupId;
    if (dayOfWeek) whereClause.day_of_week = dayOfWeek;

    const schedules = await this.scheduleModel.findAll({
      where: whereClause,
      include: [
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name"],
        },
        {
          model: Classroom,
          attributes: ["id", "building_number", "room_number"],
        },
      ],
      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    // To'qnashuvlarni topish
    const conflicts: Schedule[] = [];
    const checked = new Set();

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i];
        const s2 = schedules[j];

        if (s1.day_of_week !== s2.day_of_week) continue;

        const s1Start = new Date(`1970-01-01T${s1.start_time}`);
        const s1End = new Date(`1970-01-01T${s1.end_time}`);
        const s2Start = new Date(`1970-01-01T${s2.start_time}`);
        const s2End = new Date(`1970-01-01T${s2.end_time}`);

        const hasTimeConflict = s1Start < s2End && s1End > s2Start;

        if (hasTimeConflict) {
          // Classroom to'qnashuvi
          if (s1.classroom_id === s2.classroom_id && !checked.has(s1.id)) {
            conflicts.push(s1);
            checked.add(s1.id);
          }
          // Teacher to'qnashuvi
          if (s1.teacher_id === s2.teacher_id && !checked.has(s1.id)) {
            conflicts.push(s1);
            checked.add(s1.id);
          }
          // Group to'qnashuvi
          if (s1.group_id === s2.group_id && !checked.has(s1.id)) {
            conflicts.push(s1);
            checked.add(s1.id);
          }
        }
      }
    }

    return conflicts;
  }
}
