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
} from "sequelize-typescript";
import { Student } from "../../students/models/student.model";
import { StudyForm } from "../../study_forms/models/study_form.model";
import { EducationType } from "../../education_types/models/education_type.model";
import { ContractType } from "../../contract_types/models/contract_type.model";
import { Group } from "../../groups/models/group.model";
import { Faculty } from "../../faculties/models/faculty.model";
import { HousingType } from "../../housing_types/models/housing_type.model";
import { DormitoryRoom } from "../../dormitories/models/dormitory-room.model";

@Table({
  tableName: "info_students",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["student_id"],
    },
    {
      unique: true,
      fields: ["passport_series"],
    },
    {
      unique: true,
      fields: ["JSHSHIR"],
    },
    {
      fields: ["group_id"],
    },
    {
      fields: ["faculty_id"],
    },
    {
      fields: ["study_form_id"],
    },
    {
      fields: ["education_type_id"],
    },
    {
      fields: ["contract_type_id"],
    },
    {
      fields: ["housing_type_id"],
    },
    {
      fields: ["status"],
    },
    {
      fields: ["join_year"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class InfoStudent extends Model {
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

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  birth_date: Date;

  @Column({
    type: DataType.ENUM("male", "female"),
    allowNull: false,
    validate: {
      isIn: {
        args: [["male", "female"]],
        msg: "Gender must be either male or female",
      },
    },
  })
  gender: string;

  @Unique
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Passport series cannot be empty",
      },
    },
  })
  passport_series: string;

  @Unique
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "JSHSHIR cannot be empty",
      },
    },
  })
  JSHSHIR: string;

  @ForeignKey(() => StudyForm)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  study_form_id: number;

  @ForeignKey(() => EducationType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  education_type_id: number;

  @ForeignKey(() => ContractType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  contract_type_id: number;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  group_id: number;

  @ForeignKey(() => Faculty)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  faculty_id: number;

  @ForeignKey(() => HousingType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  housing_type_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [2000],
        msg: "Join year must be at least 2000",
      },
      max: {
        args: [2030],
        msg: "Join year cannot exceed 2030",
      },
    },
  })
  join_year: number;

  @Column({
    type: DataType.ENUM(
      "ACTIVE",
      "ACADEMIC_LEAVE",
      "GRADUATED",
      "EXPELLED",
      "TRANSFERRED",
      ""
    ),
    allowNull: true,
    defaultValue: "ACTIVE",
  })
  status: string;

  @ForeignKey(() => DormitoryRoom)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  dormitory_room_id: number;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => StudyForm)
  studyForm: StudyForm;

  @BelongsTo(() => EducationType)
  educationType: EducationType;

  @BelongsTo(() => ContractType)
  contractType: ContractType;

  @BelongsTo(() => Group)
  group: Group;

  @BelongsTo(() => Faculty)
  faculty: Faculty;

  @BelongsTo(() => HousingType)
  housingType: HousingType;

  @BelongsTo(() => DormitoryRoom)
  dormitoryRoom: DormitoryRoom;
}
