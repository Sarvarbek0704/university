// src/teachers/models/teacher.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
  Unique,
  HasMany,
} from "sequelize-typescript";
import { Department } from "../../departments/models/department.model";
import { TeacherSubject } from "../../teacher_subjects/models/teacher_subject.model";
import { Schedule } from "../../schedules/models/schedule.model";
import { Exam } from "../../exams/models/exam.model";

@Table({
  tableName: "teachers",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["email"],
    },
    {
      unique: true,
      fields: ["phone"],
    },
    {
      fields: ["department_id"],
    },
    {
      fields: ["is_active"],
    },
    {
      fields: ["is_approved"],
    },
    {
      fields: ["academic_degree"],
    },
  ],
})
export class Teacher extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Full name cannot be empty",
      },
      len: {
        args: [2, 100],
        msg: "Full name must be between 2 and 100 characters",
      },
    },
  })
  full_name: string;

  @Unique
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Phone number cannot be empty",
      },
      is: {
        args: /^\+?[1-9]\d{1,14}$/,
        msg: "Please provide a valid phone number",
      },
    },
  })
  phone: string;

  @Unique
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Email cannot be empty",
      },
      isEmail: {
        msg: "Please provide a valid email address",
      },
    },
  })
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Password cannot be empty",
      },
      len: {
        args: [6, 255],
        msg: "Password must be at least 6 characters long",
      },
    },
  })
  password: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Academic degree cannot be empty",
      },
      isIn: {
        args: [["assistant", "lecturer", "senior_lecturer", "professor"]],
        msg: "Academic degree must be one of: assistant, lecturer, senior_lecturer, professor",
      },
    },
  })
  academic_degree: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Position cannot be empty",
      },
      len: {
        args: [2, 100],
        msg: "Position must be between 2 and 100 characters",
      },
    },
  })
  position: string;

  @ForeignKey(() => Department)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Department ID must be a positive number",
      },
    },
  })
  department_id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: "Salary cannot be negative",
      },
    },
  })
  salary: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  hire_date!: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  accessToken: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  refreshToken: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @Default(false)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_approved: boolean;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
  })
  verification_otp: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  otp_expires_at: Date;

  @Default(false)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_email_verified: boolean;

  @BelongsTo(() => Department)
  department: Department;

  @HasMany(() => TeacherSubject)
  teacherSubjects: TeacherSubject[];

  @HasMany(() => Schedule)
  schedules: Schedule[];

  @HasMany(() => Exam)
  exams: Exam[];
}
