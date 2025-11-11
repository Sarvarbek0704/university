import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
  BeforeUpdate,
  BeforeCreate,
  Index,
} from "sequelize-typescript";
import { Student } from "../../students/models/student.model";
import { Schedule } from "../../schedules/models/schedule.model";

@Table({
  tableName: "attendance",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["student_id", "schedule_id", "date"],
      name: "unique_attendance_record",
    },
    {
      fields: ["student_id"],
    },
    {
      fields: ["schedule_id"],
    },
    {
      fields: ["date"],
    },
    {
      fields: ["status"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class Attendance extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Student ID must be a positive number",
      },
    },
  })
  student_id: number;

  @ForeignKey(() => Schedule)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Schedule ID must be a positive number",
      },
    },
  })
  schedule_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date: Date;

  @Column({
    type: DataType.ENUM(
      "PRESENT",
      "ABSENT",
      "EXCUSED_ABSENCE",
      "LATE",
      "LEAVE_EARLY",
      "ONLINE_PRESENT"
    ),
    allowNull: false,
    defaultValue: "PRESENT",
    validate: {
      isIn: {
        args: [
          [
            "PRESENT",
            "ABSENT",
            "EXCUSED_ABSENCE",
            "LATE",
            "LEAVE_EARLY",
            "ONLINE_PRESENT",
          ],
        ],
        msg: "Invalid attendance status",
      },
    },
  })
  status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  actual_arrival_time: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  actual_departure_time: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => Schedule)
  schedule: Schedule;

  @BeforeUpdate
  @BeforeCreate
  static validateAttendance(attendance: Attendance) {
    if (attendance.actual_arrival_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(attendance.actual_arrival_time)) {
        throw new Error("Actual arrival time must be in HH:MM format");
      }
    }

    if (attendance.actual_departure_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(attendance.actual_departure_time)) {
        throw new Error("Actual departure time must be in HH:MM format");
      }
    }

    if (attendance.status === "LATE" && !attendance.actual_arrival_time) {
      throw new Error("Actual arrival time is required for LATE status");
    }

    if (
      attendance.status === "LEAVE_EARLY" &&
      !attendance.actual_departure_time
    ) {
      throw new Error(
        "Actual departure time is required for LEAVE_EARLY status"
      );
    }
  }

  get isPresent(): boolean {
    return this.status === "PRESENT" || this.status === "ONLINE_PRESENT";
  }

  get isAbsent(): boolean {
    return this.status === "ABSENT";
  }

  get isExcused(): boolean {
    return this.status === "EXCUSED_ABSENCE";
  }

  get isLate(): boolean {
    return this.status === "LATE";
  }

  get isLeaveEarly(): boolean {
    return this.status === "LEAVE_EARLY";
  }

  get isOnline(): boolean {
    return this.status === "ONLINE_PRESENT";
  }

  calculateLateMinutes(): number {
    if (
      !this.isLate ||
      !this.actual_arrival_time ||
      !this.schedule?.start_time
    ) {
      return 0;
    }

    const actualTime = new Date(`1970-01-01T${this.actual_arrival_time}`);
    const scheduleTime = new Date(`1970-01-01T${this.schedule.start_time}`);
    return Math.max(
      0,
      (actualTime.getTime() - scheduleTime.getTime()) / (1000 * 60)
    );
  }

  calculateEarlyLeaveMinutes(): number {
    if (
      !this.isLeaveEarly ||
      !this.actual_departure_time ||
      !this.schedule?.end_time
    ) {
      return 0;
    }

    const actualTime = new Date(`1970-01-01T${this.actual_departure_time}`);
    const scheduleTime = new Date(`1970-01-01T${this.schedule.end_time}`);
    return Math.max(
      0,
      (scheduleTime.getTime() - actualTime.getTime()) / (1000 * 60)
    );
  }
}
