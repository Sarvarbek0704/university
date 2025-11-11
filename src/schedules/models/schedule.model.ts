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
} from "sequelize-typescript";
import { Group } from "../../groups/models/group.model";
import { Subject } from "../../subjects/models/subject.model";
import { Teacher } from "../../teachers/models/teacher.model";
import { Classroom } from "../../classrooms/models/classroom.model";

@Table({
  tableName: "schedules",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ["group_id"],
    },
    {
      fields: ["subject_id"],
    },
    {
      fields: ["teacher_id"],
    },
    {
      fields: ["classroom_id"],
    },
    {
      fields: ["day_of_week"],
    },
    {
      fields: ["start_time"],
    },
    {
      fields: ["is_active"],
    },
    {
      unique: true,
      fields: ["group_id", "day_of_week", "start_time"],
    },
  ],
})
export class Schedule extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Group ID must be a positive number",
      },
    },
  })
  group_id: number;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Subject ID must be a positive number",
      },
    },
  })
  subject_id: number;

  @ForeignKey(() => Teacher)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Teacher ID must be a positive number",
      },
    },
  })
  teacher_id: number;

  @ForeignKey(() => Classroom)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Classroom ID must be a positive number",
      },
    },
  })
  classroom_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Day of week must be at least 1",
      },
      max: {
        args: [7],
        msg: "Day of week cannot exceed 7",
      },
    },
  })
  day_of_week: number;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  start_time: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  end_time: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  specific_date: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Group)
  group: Group;

  @BelongsTo(() => Subject)
  subject: Subject;

  @BelongsTo(() => Teacher)
  teacher: Teacher;

  @BelongsTo(() => Classroom)
  classroom: Classroom;

  @BeforeUpdate
  @BeforeCreate
  static async validateSchedule(schedule: Schedule) {
    // Vaqt formati tekshirish
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      !timeRegex.test(schedule.start_time) ||
      !timeRegex.test(schedule.end_time)
    ) {
      throw new Error("Start time and end time must be in HH:MM format");
    }

    // Boshlanish va tugash vaqtini solishtirish
    const start = new Date(`1970-01-01T${schedule.start_time}`);
    const end = new Date(`1970-01-01T${schedule.end_time}`);

    if (start >= end) {
      throw new Error("Start time must be before end time");
    }

    // Dars davomiyligi (minimal 30 daqiqa, maksimal 4 soat)
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    if (duration < 30) {
      throw new Error("Lesson duration must be at least 30 minutes");
    }
    if (duration > 240) {
      throw new Error("Lesson duration cannot exceed 4 hours");
    }
  }

  get dayName(): string {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days[this.day_of_week - 1] || "Unknown";
  }

  get duration(): number {
    const start = new Date(`1970-01-01T${this.start_time}`);
    const end = new Date(`1970-01-01T${this.end_time}`);
    return (end.getTime() - start.getTime()) / (1000 * 60); // daqiqalarda
  }

  get formattedDuration(): string {
    const minutes = this.duration;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  async hasTimeConflict(otherSchedule: Schedule): Promise<boolean> {
    if (this.day_of_week !== otherSchedule.day_of_week) {
      return false;
    }

    const thisStart = new Date(`1970-01-01T${this.start_time}`);
    const thisEnd = new Date(`1970-01-01T${this.end_time}`);
    const otherStart = new Date(`1970-01-01T${otherSchedule.start_time}`);
    const otherEnd = new Date(`1970-01-01T${otherSchedule.end_time}`);

    return (
      (thisStart < otherEnd && thisEnd > otherStart) ||
      (otherStart < thisEnd && otherEnd > thisStart)
    );
  }
}
