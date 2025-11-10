import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Department } from "../../departments/models/department.model";

@Table({
  tableName: "admins",
  timestamps: true,
  paranoid: true,
})
export class Admin extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  full_name: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
  })
  phone: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password: string;

  @ForeignKey(() => Department)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  department_id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  position: string;

  @Column({
    type: DataType.ENUM("super_admin", "faculty_admin", "department_admin"),
    allowNull: false,
    defaultValue: "department_admin",
  })
  admin_type: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  permissions: string[];

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

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_approved: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_active: boolean;

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

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_email_verified: boolean;

  @BelongsTo(() => Department)
  department: Department;
}
