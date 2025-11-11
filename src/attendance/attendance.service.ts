import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, fn, col, literal } from "sequelize";
import { Attendance } from "./models/attendance.model";
import { Student } from "../students/models/student.model";
import { Schedule } from "../schedules/models/schedule.model";
import { Group } from "../groups/models/group.model";
import { Subject } from "../subjects/models/subject.model";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";
import { FilterAttendanceDto } from "./dto/filter-attendance.dto";
import { BulkAttendanceDto } from "./dto/bulk-attendance.dto";
import { AttendanceStatsDto } from "./dto/attendance-stats.dto";
import { Teacher } from "../teachers/models/teacher.model";
import { Classroom } from "../classrooms/models/classroom.model";

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance)
    private readonly attendanceModel: typeof Attendance,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(Schedule)
    private readonly scheduleModel: typeof Schedule,
    @InjectModel(Group)
    private readonly groupModel: typeof Group,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Talaba va jadval mavjudligini tekshirish
    await this.validateStudentAndSchedule(
      createAttendanceDto.student_id,
      createAttendanceDto.schedule_id
    );

    // Bir xil kuni bir xil dars uchun davomat mavjudligini tekshirish
    const existingAttendance = await this.attendanceModel.findOne({
      where: {
        student_id: createAttendanceDto.student_id,
        schedule_id: createAttendanceDto.schedule_id,
        date: createAttendanceDto.date,
      },
    });

    if (existingAttendance) {
      throw new ConflictException(
        "Attendance record already exists for this student, schedule and date"
      );
    }

    const attendance = await this.attendanceModel.create({
      student_id: createAttendanceDto.student_id,
      schedule_id: createAttendanceDto.schedule_id,
      date: createAttendanceDto.date,
      status: createAttendanceDto.status,
      notes: createAttendanceDto.notes,
      actual_arrival_time: createAttendanceDto.actual_arrival_time,
      actual_departure_time: createAttendanceDto.actual_departure_time,
    } as any);

    return this.findOne(attendance.id);
  }

  async createBulk(bulkAttendanceDto: BulkAttendanceDto): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Jadval mavjudligini tekshirish
    const schedule = await this.scheduleModel.findByPk(
      bulkAttendanceDto.schedule_id
    );
    if (!schedule) {
      throw new NotFoundException("Schedule not found");
    }

    for (const studentAttendance of bulkAttendanceDto.students) {
      try {
        // Talaba mavjudligini tekshirish
        const student = await this.studentModel.findByPk(
          studentAttendance.student_id
        );
        if (!student) {
          results.failed++;
          results.errors.push(
            `Student with ID ${studentAttendance.student_id} not found`
          );
          continue;
        }

        // Bir xil kuni bir xil dars uchun davomat mavjudligini tekshirish
        const existingAttendance = await this.attendanceModel.findOne({
          where: {
            student_id: studentAttendance.student_id,
            schedule_id: bulkAttendanceDto.schedule_id,
            date: bulkAttendanceDto.date,
          },
        });

        if (existingAttendance) {
          // Mavjud bo'lsa, yangilash
          await existingAttendance.update({
            status: studentAttendance.status,
            notes: studentAttendance.notes,
            actual_arrival_time: studentAttendance.actual_arrival_time,
            actual_departure_time: studentAttendance.actual_departure_time,
          });
        } else {
          // Yangi yaratish
          await this.attendanceModel.create({
            student_id: studentAttendance.student_id,
            schedule_id: bulkAttendanceDto.schedule_id,
            date: bulkAttendanceDto.date,
            status: studentAttendance.status,
            notes: studentAttendance.notes,
            actual_arrival_time: studentAttendance.actual_arrival_time,
            actual_departure_time: studentAttendance.actual_departure_time,
          } as any);
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Student ${studentAttendance.student_id}: ${error.message}`
        );
      }
    }

    return results;
  }

  async findAll(filterDto: FilterAttendanceDto): Promise<Attendance[]> {
    const whereClause: any = {};

    if (filterDto.student_id) {
      whereClause.student_id = filterDto.student_id;
    }

    if (filterDto.schedule_id) {
      whereClause.schedule_id = filterDto.schedule_id;
    }

    if (filterDto.status) {
      whereClause.status = filterDto.status;
    }

    if (filterDto.group_id || filterDto.subject_id) {
      whereClause["$schedule.group_id$"] = filterDto.group_id;
      whereClause["$schedule.subject_id$"] = filterDto.subject_id;
    }

    if (filterDto.date_from && filterDto.date_to) {
      whereClause.date = {
        [Op.between]: [filterDto.date_from, filterDto.date_to],
      };
    } else if (filterDto.date_from) {
      whereClause.date = {
        [Op.gte]: filterDto.date_from,
      };
    } else if (filterDto.date_to) {
      whereClause.date = {
        [Op.lte]: filterDto.date_to,
      };
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.attendanceModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
        {
          model: Schedule,
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
        },
      ],
      order: [[filterDto.sort_by || "date", filterDto.sort_order || "DESC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Attendance> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid attendance ID");
    }

    const attendance = await this.attendanceModel.findByPk(id, {
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email", "phone"],
        },
        {
          model: Schedule,
          include: [
            {
              model: Group,
              attributes: ["id", "name", "course_number"],
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
              attributes: ["id", "building_number", "room_number"],
            },
          ],
        },
      ],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return attendance;
  }

  async findByStudent(studentId: number): Promise<Attendance[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.attendanceModel.findAll({
      where: {
        student_id: studentId,
      },
      include: [
        {
          model: Schedule,
          include: [
            {
              model: Group,
              attributes: ["id", "name"],
            },
            {
              model: Subject,
              attributes: ["id", "name", "credit"],
            },
          ],
        },
      ],
      order: [["date", "DESC"]],
    });
  }

  async findBySchedule(
    scheduleId: number,
    date?: string
  ): Promise<Attendance[]> {
    if (!scheduleId || isNaN(scheduleId)) {
      throw new BadRequestException("Invalid schedule ID");
    }

    const schedule = await this.scheduleModel.findByPk(scheduleId);
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    const whereClause: any = {
      schedule_id: scheduleId,
    };

    if (date) {
      whereClause.date = date;
    }

    return this.attendanceModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [[{ model: Student, as: "student" }, "full_name", "ASC"]],
    });
  }

  async update(
    id: number,
    updateAttendanceDto: UpdateAttendanceDto
  ): Promise<Attendance> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid attendance ID");
    }

    const attendance = await this.findOne(id);

    if (updateAttendanceDto.student_id) {
      const student = await this.studentModel.findByPk(
        updateAttendanceDto.student_id
      );
      if (!student) {
        throw new NotFoundException("Student not found");
      }
    }

    if (updateAttendanceDto.schedule_id) {
      const schedule = await this.scheduleModel.findByPk(
        updateAttendanceDto.schedule_id
      );
      if (!schedule) {
        throw new NotFoundException("Schedule not found");
      }
    }

    // Bir xil kuni bir xil dars uchun boshqa davomat mavjudligini tekshirish
    if (
      (updateAttendanceDto.student_id || attendance.student_id) &&
      (updateAttendanceDto.schedule_id || attendance.schedule_id) &&
      (updateAttendanceDto.date || attendance.date)
    ) {
      const existingAttendance = await this.attendanceModel.findOne({
        where: {
          student_id: updateAttendanceDto.student_id || attendance.student_id,
          schedule_id:
            updateAttendanceDto.schedule_id || attendance.schedule_id,
          date: updateAttendanceDto.date || attendance.date,
          id: { [Op.ne]: id },
        },
      });

      if (existingAttendance) {
        throw new ConflictException(
          "Another attendance record already exists for this student, schedule and date"
        );
      }
    }

    await attendance.update(updateAttendanceDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid attendance ID");
    }

    const attendance = await this.findOne(id);
    await attendance.destroy();

    return { message: "Attendance record deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Attendance> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid attendance ID");
    }

    const attendance = await this.findOne(id);
    await attendance.update({ is_active: !attendance.is_active });

    return this.findOne(id);
  }

  // ========== STATISTICS METHODS ==========

  async getAttendanceStats(statsDto: AttendanceStatsDto): Promise<any> {
    const whereClause: any = {
      date: {
        [Op.between]: [statsDto.start_date, statsDto.end_date],
      },
      is_active: true,
    };

    if (statsDto.student_id) {
      whereClause.student_id = statsDto.student_id;
    }

    if (statsDto.group_id) {
      whereClause["$schedule.group_id$"] = statsDto.group_id;
    }

    if (statsDto.subject_id) {
      whereClause["$schedule.subject_id$"] = statsDto.subject_id;
    }

    const attendanceRecords = await this.attendanceModel.findAll({
      where: whereClause,
      include: [
        {
          model: Schedule,
          attributes: ["id"],
          include: [
            {
              model: Group,
              attributes: ["id", "name"],
            },
            {
              model: Subject,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Student,
          attributes: ["id", "full_name"],
        },
      ],
    });

    return this.calculateStats(attendanceRecords, statsDto);
  }

  async getStudentAttendanceStats(
    studentId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const stats = await this.getAttendanceStats({
      student_id: studentId,
      start_date: startDate,
      end_date: endDate,
    });

    const student = await this.studentModel.findByPk(studentId);

    return {
      student: {
        id: student!.id,
        full_name: student!.full_name,
      },
      ...stats,
    };
  }

  async getGroupAttendanceStats(
    groupId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const stats = await this.getAttendanceStats({
      group_id: groupId,
      start_date: startDate,
      end_date: endDate,
    });

    const group = await this.groupModel.findByPk(groupId);

    return {
      group: {
        id: group!.id,
        name: group!.name,
      },
      ...stats,
    };
  }

  async getLowAttendanceAlerts(
    threshold: number = 75,
    days: number = 30
  ): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const studentStats = await this.attendanceModel.findAll({
      attributes: [
        "student_id",
        [fn("COUNT", col("id")), "total_classes"],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN status IN ('PRESENT', 'ONLINE_PRESENT') THEN 1 ELSE 0 END`
            )
          ),
          "present_classes",
        ],
      ],
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
        is_active: true,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      group: ["student_id", "student.id"],
      having: literal(`
        (SUM(CASE WHEN status IN ('PRESENT', 'ONLINE_PRESENT') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) < ${threshold}
      `),
      raw: true,
    });

    return studentStats.map((stat: any) => ({
      student_id: stat.student_id,
      student_name: stat["student.full_name"],
      total_classes: parseInt(stat.total_classes),
      present_classes: parseInt(stat.present_classes),
      attendance_percentage: Math.round(
        (parseInt(stat.present_classes) / parseInt(stat.total_classes)) * 100
      ),
      threshold: threshold,
    }));
  }

  // ========== UTILITY METHODS ==========

  private async validateStudentAndSchedule(
    studentId: number,
    scheduleId: number
  ): Promise<void> {
    const [student, schedule] = await Promise.all([
      this.studentModel.findByPk(studentId),
      this.scheduleModel.findByPk(scheduleId),
    ]);

    if (!student) {
      throw new NotFoundException("Student not found");
    }
    if (!schedule) {
      throw new NotFoundException("Schedule not found");
    }
  }

  private calculateStats(
    attendanceRecords: Attendance[],
    statsDto: AttendanceStatsDto
  ): any {
    const totalClasses = attendanceRecords.length;

    const statusCounts = {
      PRESENT: 0,
      ABSENT: 0,
      EXCUSED_ABSENCE: 0,
      LATE: 0,
      LEAVE_EARLY: 0,
      ONLINE_PRESENT: 0,
    };

    let totalPresent = 0;
    let totalLateMinutes = 0;
    let totalEarlyLeaveMinutes = 0;

    attendanceRecords.forEach((record) => {
      statusCounts[record.status]++;

      if (record.isPresent) {
        totalPresent++;
      }

      if (record.isLate) {
        totalLateMinutes += record.calculateLateMinutes();
      }

      if (record.isLeaveEarly) {
        totalEarlyLeaveMinutes += record.calculateEarlyLeaveMinutes();
      }
    });

    const attendancePercentage =
      totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;

    return {
      period: {
        start_date: statsDto.start_date,
        end_date: statsDto.end_date,
      },
      summary: {
        total_classes: totalClasses,
        total_present: totalPresent,
        attendance_percentage: Math.round(attendancePercentage * 100) / 100,
        average_late_minutes:
          totalPresent > 0 ? Math.round(totalLateMinutes / totalPresent) : 0,
        average_early_leave_minutes:
          totalPresent > 0
            ? Math.round(totalEarlyLeaveMinutes / totalPresent)
            : 0,
      },
      breakdown: statusCounts,
      alerts:
        attendancePercentage < (statsDto.alert_threshold || 75)
          ? [
              `Low attendance: ${Math.round(attendancePercentage)}% (below ${statsDto.alert_threshold || 75}%)`,
            ]
          : [],
    };
  }

  async getMonthlyAttendance(
    studentId: number,
    year: number,
    month: number
  ): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await this.attendanceModel.findAll({
      where: {
        student_id: studentId,
        date: {
          [Op.between]: [startDate, endDate],
        },
        is_active: true,
      },
      include: [
        {
          model: Schedule,
          include: [
            {
              model: Subject,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["date", "ASC"]],
    });

    const dailyStats: any = {};
    const monthlySummary = {
      total_days: 0,
      present_days: 0,
      absent_days: 0,
      late_days: 0,
    };

    attendanceRecords.forEach((record) => {
      const dateStr = record.date.toISOString().split("T")[0];

      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          date: dateStr,
          classes: [],
          status: "ABSENT",
        };
        monthlySummary.total_days++;
      }

      dailyStats[dateStr].classes.push({
        subject: record.schedule.subject.name,
        status: record.status,
        time: `${record.schedule.start_time} - ${record.schedule.end_time}`,
      });

      // Kunlik statusni aniqlash (agar birorta dars bo'lsa present deb hisoblanadi)
      if (record.isPresent) {
        dailyStats[dateStr].status = "PRESENT";
        monthlySummary.present_days++;
      } else if (record.isLate && dailyStats[dateStr].status !== "PRESENT") {
        dailyStats[dateStr].status = "LATE";
        monthlySummary.late_days++;
      } else if (record.isAbsent && dailyStats[dateStr].status === "ABSENT") {
        monthlySummary.absent_days++;
      }
    });

    return {
      student_id: studentId,
      month: month,
      year: year,
      monthly_summary: monthlySummary,
      daily_attendance: Object.values(dailyStats),
    };
  }

  // Attendance.service.ts ga qo'shimcha metodlar

  async getAttendanceHeatmap(
    studentId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const attendanceRecords = await this.attendanceModel.findAll({
      where: {
        student_id: studentId,
        date: {
          [Op.between]: [startDate, endDate],
        },
        is_active: true,
      },
      include: [
        {
          model: Schedule,
          include: [
            {
              model: Subject,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["date", "ASC"]],
    });

    // Kunlik davomat statistikasini yaratish
    const heatmapData: any = {};
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayRecords = attendanceRecords.filter(
        (record) => record.date.toISOString().split("T")[0] === dateStr
      );

      const dayStatus = this.calculateDayStatus(dayRecords);

      heatmapData[dateStr] = {
        date: dateStr,
        day_of_week: currentDate.getDay(),
        status: dayStatus,
        classes: dayRecords.map((record) => ({
          subject: record.schedule.subject.name,
          status: record.status,
          time: `${record.schedule.start_time} - ${record.schedule.end_time}`,
        })),
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      student_id: studentId,
      period: { start_date: startDate, end_date: endDate },
      heatmap: heatmapData,
    };
  }

  private calculateDayStatus(dayRecords: Attendance[]): string {
    if (dayRecords.length === 0) return "NO_CLASSES";

    const hasPresent = dayRecords.some((record) => record.isPresent);
    const hasAbsent = dayRecords.some((record) => record.isAbsent);
    const hasLate = dayRecords.some((record) => record.isLate);

    if (hasPresent && !hasAbsent) return "ALL_PRESENT";
    if (hasLate) return "LATE";
    if (hasAbsent && !hasPresent) return "ALL_ABSENT";
    return "MIXED";
  }

  async getSubjectWiseAttendance(
    studentId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const attendanceRecords = await this.attendanceModel.findAll({
      where: {
        student_id: studentId,
        date: {
          [Op.between]: [startDate, endDate],
        },
        is_active: true,
      },
      include: [
        {
          model: Schedule,
          include: [
            {
              model: Subject,
              attributes: ["id", "name", "credit"],
            },
          ],
        },
      ],
    });

    const subjectStats: any = {};

    attendanceRecords.forEach((record) => {
      const subjectId = record.schedule.subject.id;
      const subjectName = record.schedule.subject.name;

      if (!subjectStats[subjectId]) {
        subjectStats[subjectId] = {
          subject_id: subjectId,
          subject_name: subjectName,
          credit: record.schedule.subject.credit,
          total_classes: 0,
          present_classes: 0,
          absent_classes: 0,
          late_classes: 0,
          attendance_percentage: 0,
        };
      }

      subjectStats[subjectId].total_classes++;

      if (record.isPresent) {
        subjectStats[subjectId].present_classes++;
      } else if (record.isAbsent) {
        subjectStats[subjectId].absent_classes++;
      } else if (record.isLate) {
        subjectStats[subjectId].late_classes++;
      }
    });

    // Foizlarni hisoblash
    Object.values(subjectStats).forEach((stat: any) => {
      stat.attendance_percentage =
        stat.total_classes > 0
          ? Math.round((stat.present_classes / stat.total_classes) * 100)
          : 0;
    });

    return {
      student_id: studentId,
      period: { start_date: startDate, end_date: endDate },
      subject_wise_attendance: Object.values(subjectStats),
    };
  }

  async getClassAttendanceSummary(
    scheduleId: number,
    date: string
  ): Promise<any> {
    const attendanceRecords = await this.findBySchedule(scheduleId, date);
    const schedule = await this.scheduleModel.findByPk(scheduleId, {
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
    });

    const statusCounts = {
      PRESENT: 0,
      ABSENT: 0,
      EXCUSED_ABSENCE: 0,
      LATE: 0,
      LEAVE_EARLY: 0,
      ONLINE_PRESENT: 0,
      NOT_RECORDED: 0,
    };

    attendanceRecords.forEach((record) => {
      statusCounts[record.status]++;
    });

    const totalStudents = attendanceRecords.length;
    const presentCount = statusCounts.PRESENT + statusCounts.ONLINE_PRESENT;
    const attendancePercentage =
      totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return {
      schedule: {
        id: schedule!.id,
        group: schedule!.group.name,
        subject: schedule!.subject.name,
        teacher: schedule!.teacher.full_name,
        time: `${schedule!.start_time} - ${schedule!.end_time}`,
      },
      date: date,
      summary: {
        total_students: totalStudents,
        present_count: presentCount,
        attendance_percentage: attendancePercentage,
      },
      breakdown: statusCounts,
    };
  }

  async generateAttendanceReport(
    groupId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const attendanceRecords = await this.attendanceModel.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
        is_active: true,
        "$schedule.group_id$": groupId,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
        {
          model: Schedule,
          include: [
            {
              model: Subject,
              attributes: ["id", "name"],
            },
            {
              model: Group,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    const studentStats: any = {};
    const subjectStats: any = {};

    // Talaba va fan bo'yicha statistikani hisoblash
    attendanceRecords.forEach((record) => {
      const studentId = record.student_id;
      const subjectId = record.schedule.subject.id;

      // Talaba statistikasi
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          student_id: studentId,
          student_name: record.student.full_name,
          total_classes: 0,
          present_classes: 0,
          absent_classes: 0,
          late_classes: 0,
          subjects: new Set(),
        };
      }

      studentStats[studentId].total_classes++;
      studentStats[studentId].subjects.add(subjectId);

      if (record.isPresent) {
        studentStats[studentId].present_classes++;
      } else if (record.isAbsent) {
        studentStats[studentId].absent_classes++;
      } else if (record.isLate) {
        studentStats[studentId].late_classes++;
      }

      // Fan statistikasi
      if (!subjectStats[subjectId]) {
        subjectStats[subjectId] = {
          subject_id: subjectId,
          subject_name: record.schedule.subject.name,
          total_classes: 0,
          present_students: 0,
          average_attendance: 0,
        };
      }

      subjectStats[subjectId].total_classes++;
      if (record.isPresent) {
        subjectStats[subjectId].present_students++;
      }
    });

    // Foizlarni hisoblash
    Object.values(studentStats).forEach((stat: any) => {
      stat.attendance_percentage =
        stat.total_classes > 0
          ? Math.round((stat.present_classes / stat.total_classes) * 100)
          : 0;
      stat.subjects_count = stat.subjects.size;
      delete stat.subjects;
    });

    Object.values(subjectStats).forEach((stat: any) => {
      stat.average_attendance =
        stat.total_classes > 0
          ? Math.round((stat.present_students / stat.total_classes) * 100)
          : 0;
    });

    return {
      group_id: groupId,
      period: { start_date: startDate, end_date: endDate },
      student_statistics: Object.values(studentStats),
      subject_statistics: Object.values(subjectStats),
      overall_attendance: this.calculateOverallAttendance(studentStats),
    };
  }

  private calculateOverallAttendance(studentStats: any): any {
    const totalStudents = Object.keys(studentStats).length;
    let totalAttendance = 0;
    let excellentStudents = 0;
    let goodStudents = 0;
    let poorStudents = 0;

    Object.values(studentStats).forEach((stat: any) => {
      totalAttendance += stat.attendance_percentage;

      if (stat.attendance_percentage >= 90) {
        excellentStudents++;
      } else if (stat.attendance_percentage >= 75) {
        goodStudents++;
      } else {
        poorStudents++;
      }
    });

    const averageAttendance =
      totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 0;

    return {
      total_students: totalStudents,
      average_attendance: averageAttendance,
      excellent_students: excellentStudents,
      good_students: goodStudents,
      poor_students: poorStudents,
    };
  }
}
