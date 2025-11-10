import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
  AllowNull,
  BeforeUpdate,
  BeforeCreate,
} from "sequelize-typescript";
import { Dormitory } from "./dormitory.model";
// import { InfoStudent } from "../../info-students/models/info-student.model";

@Table({
  tableName: "dormitory_rooms",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["dormitory_id", "room_number"],
    },
    {
      fields: ["dormitory_id"],
    },
    {
      fields: ["floor"],
    },
    {
      fields: ["is_available"],
    },
    {
      fields: ["room_type"],
    },
  ],
})
export class DormitoryRoom extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Dormitory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Dormitory ID must be a positive number",
      },
    },
  })
  dormitory_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Room number must be at least 1",
      },
      max: {
        args: [9999],
        msg: "Room number cannot exceed 9999",
      },
    },
  })
  room_number: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Beds count must be at least 1",
      },
      max: {
        args: [6],
        msg: "Beds count cannot exceed 6",
      },
    },
  })
  beds_count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: "Floor must be at least 1",
      },
      max: {
        args: [20],
        msg: "Floor cannot exceed 20",
      },
    },
  })
  floor: number;

  @Column({
    type: DataType.ENUM("STANDARD", "COMFORT", "LUXURY", "SUPERIOR"),
    allowNull: true,
    defaultValue: "STANDARD",
  })
  room_type: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: "Monthly rent cannot be negative",
      },
    },
  })
  monthly_rent: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  amenities: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_available: boolean;

  // Associations
  @BelongsTo(() => Dormitory)
  dormitory: Dormitory;

  //   @HasMany(() => InfoStudent)
  //   students: InfoStudent[];

  @BeforeUpdate
  @BeforeCreate
  static validateRoomData(room: DormitoryRoom) {
    if (room.beds_count < 1 || room.beds_count > 6) {
      throw new Error("Beds count must be between 1 and 6");
    }
  }

  // Instance methods
  async getOccupiedBedsCount(): Promise<number> {
    const studentsCount = await this.$count("students");
    return studentsCount;
  }

  async getAvailableBedsCount(): Promise<number> {
    const occupied = await this.getOccupiedBedsCount();
    return this.beds_count - occupied;
  }

  async isFull(): Promise<boolean> {
    const occupied = await this.getOccupiedBedsCount();
    return occupied >= this.beds_count;
  }
}
