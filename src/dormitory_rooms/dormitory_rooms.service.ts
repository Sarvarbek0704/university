import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Student } from "../students/models/student.model";
import { DormitoryRoom } from "../dormitories/models/dormitory-room.model";
import { Dormitory } from "../dormitories/models/dormitory.model";
import { CreateDormitoryRoomDto } from "./dto/create-dormitory_room.dto";
import { AssignStudentToRoomDto } from "../dormitories/dto/assign-student-to-room.dto";
import { InfoStudent } from "../info_students/models/info_student.model";

@Injectable()
export class DormitoryRoomsService {
  constructor(
    @InjectModel(DormitoryRoom)
    private readonly dormitoryRoomModel: typeof DormitoryRoom,
    @InjectModel(Dormitory)
    private readonly dormitoryModel: typeof Dormitory,
    @InjectModel(InfoStudent)
    private readonly infoStudentModel: typeof InfoStudent
  ) {}

  async create(createRoomDto: CreateDormitoryRoomDto): Promise<DormitoryRoom> {
    if (
      !createRoomDto?.dormitory_id ||
      !createRoomDto?.room_number ||
      !createRoomDto?.beds_count
    ) {
      throw new BadRequestException(
        "Dormitory ID, room number and beds count are required"
      );
    }

    const dormitory = await this.dormitoryModel.findByPk(
      createRoomDto.dormitory_id
    );
    if (!dormitory) {
      throw new NotFoundException("Dormitory not found");
    }

    const existingRoom = await this.dormitoryRoomModel.findOne({
      where: {
        dormitory_id: createRoomDto.dormitory_id,
        room_number: createRoomDto.room_number,
      },
    });

    if (existingRoom) {
      throw new ConflictException(
        "Room with this number already exists in this dormitory"
      );
    }

    const room = await this.dormitoryRoomModel.create({
      dormitory_id: createRoomDto.dormitory_id,
      room_number: createRoomDto.room_number,
      beds_count: createRoomDto.beds_count,
      floor: createRoomDto.floor,
      room_type: createRoomDto.room_type,
      monthly_rent: createRoomDto.monthly_rent,
      description: createRoomDto.description,
      amenities: createRoomDto.amenities,
      is_available: createRoomDto.is_available,
    } as any);

    return this.findOne(room.id);
  }

  async findOne(id: number): Promise<DormitoryRoom> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid room ID");
    }

    const room = await this.dormitoryRoomModel.findByPk(id, {
      include: [
        {
          model: Dormitory,
          attributes: ["id", "name", "address"],
        },
      ],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async findByDormitory(dormitoryId: number): Promise<DormitoryRoom[]> {
    if (!dormitoryId || isNaN(dormitoryId)) {
      throw new BadRequestException("Invalid dormitory ID");
    }

    const dormitory = await this.dormitoryModel.findByPk(dormitoryId);
    if (!dormitory) {
      throw new NotFoundException(`Dormitory with ID ${dormitoryId} not found`);
    }

    return this.dormitoryRoomModel.findAll({
      where: { dormitory_id: dormitoryId },
      include: [
        {
          model: Dormitory,
          attributes: ["id", "name"],
        },
        {
          model: InfoStudent,
          include: [Student],
          attributes: ["id", "student_id"],
        },
      ],
      order: [
        ["floor", "ASC"],
        ["room_number", "ASC"],
      ],
    });
  }

  async getRoomWithStudents(roomId: number): Promise<DormitoryRoom> {
    if (!roomId || isNaN(roomId)) {
      throw new BadRequestException("Invalid room ID");
    }

    const room = await this.dormitoryRoomModel.findByPk(roomId, {
      include: [
        {
          model: Dormitory,
          attributes: ["id", "name", "address"],
        },
        {
          model: InfoStudent,
          include: [
            {
              model: Student,
              attributes: ["id", "full_name", "phone", "email"],
            },
          ],
          attributes: ["id", "student_id", "status"],
        },
      ],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    return room;
  }

  async assignStudentToRoom(
    assignDto: AssignStudentToRoomDto
  ): Promise<{ message: string }> {
    const { student_id, dormitory_room_id, start_date, end_date, notes } =
      assignDto;

    const room = await this.findOne(dormitory_room_id);
    if (!room.is_available) {
      throw new ConflictException("Room is not available");
    }

    const occupiedBeds = await room.getOccupiedBedsCount();
    if (occupiedBeds >= room.beds_count) {
      throw new ConflictException("Room is full");
    }

    const infoStudent = await this.infoStudentModel.findOne({
      where: { student_id },
      include: [Student],
    });

    if (!infoStudent) {
      throw new NotFoundException("Student not found");
    }

    if (infoStudent.dormitory_room_id) {
      throw new ConflictException("Student already assigned to a room");
    }

    await infoStudent.update({
      dormitory_room_id,
      housing_type_id: 1,
    });

    const newOccupiedBeds = occupiedBeds + 1;
    if (newOccupiedBeds >= room.beds_count) {
      await room.update({ is_available: false });
    }

    return { message: "Student assigned to room successfully" };
  }

  async removeStudentFromRoom(
    roomId: number,
    studentId: number
  ): Promise<{ message: string }> {
    if (!roomId || isNaN(roomId) || !studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid room ID or student ID");
    }

    const room = await this.findOne(roomId);
    const infoStudent = await this.infoStudentModel.findOne({
      where: {
        student_id: studentId,
        dormitory_room_id: roomId,
      },
    });

    if (!infoStudent) {
      throw new NotFoundException("Student not found in this room");
    }

    await infoStudent.update({
      dormitory_room_id: null,
      housing_type_id: null,
    });

    const occupiedBeds = await room.getOccupiedBedsCount();
    if (!room.is_available && occupiedBeds < room.beds_count) {
      await room.update({ is_available: true });
    }

    return { message: "Student removed from room successfully" };
  }

  async updateRoomAvailability(roomId: number): Promise<void> {
    const room = await this.findOne(roomId);
    const occupiedBeds = await room.getOccupiedBedsCount();

    if (occupiedBeds >= room.beds_count) {
      await room.update({ is_available: false });
    } else {
      await room.update({ is_available: true });
    }
  }
}
