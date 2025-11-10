import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Default,
  AllowNull,
  BeforeUpdate,
  BeforeCreate,
} from "sequelize-typescript";
import { DormitoryRoom } from "./dormitory-room.model";

@Table({
  tableName: "dormitories",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["name"],
    },
    {
      fields: ["capacity"],
    },
    {
      fields: ["is_active"],
    },
    {
      fields: ["is_available"],
    },
  ],
})
export class Dormitory extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Dormitory name cannot be empty",
      },
      len: {
        args: [2, 50],
        msg: "Dormitory name must be between 2 and 50 characters",
      },
    },
  })
  name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Address cannot be empty",
      },
    },
  })
  address: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Capacity must be at least 1",
      },
      max: {
        args: [5000],
        msg: "Capacity cannot exceed 5000",
      },
    },
  })
  capacity: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^\+?[1-9]\d{1,14}$/,
        msg: "Please provide a valid phone number",
      },
    },
  })
  phone: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    validate: {
      isEmail: {
        msg: "Please provide a valid email address",
      },
    },
  })
  email: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  location_details: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: "Floors count must be at least 1",
      },
      max: {
        args: [20],
        msg: "Floors count cannot exceed 20",
      },
    },
  })
  floors_count: number;

  @Column({
    type: DataType.STRING(4),
    allowNull: true,
    validate: {
      len: {
        args: [4, 4],
        msg: "Built year must be 4 characters",
      },
    },
  })
  built_year: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_available: boolean;

  // Associations
  @HasMany(() => DormitoryRoom)
  rooms: DormitoryRoom[];

  @BeforeUpdate
  @BeforeCreate
  static validateCapacity(dormitory: Dormitory) {
    if (dormitory.capacity < 1) {
      throw new Error("Capacity must be at least 1");
    }
  }

  // Instance methods
  async getOccupiedBedsCount(): Promise<number> {
    const rooms = (await this.$get("rooms", {
      include: ["students"],
    })) as any[];

    return rooms.reduce((total, room) => {
      return total + (room.students?.length || 0);
    }, 0);
  }

  async getAvailableBedsCount(): Promise<number> {
    const occupied = await this.getOccupiedBedsCount();
    return this.capacity - occupied;
  }
}
