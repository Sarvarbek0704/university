import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { CourseWork } from "./models/course_work.model";
import { Student } from "../students/models/student.model";
import { Subject } from "../subjects/models/subject.model";
import { CreateCourseWorkDto } from "./dto/create-course_work.dto";
import { UpdateCourseWorkDto } from "./dto/update-course_work.dto";

@Injectable()
export class CourseWorksService {
  constructor(
    @InjectModel(CourseWork)
    private readonly courseWorkModel: typeof CourseWork,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject
  ) {}

  async create(createCourseWorkDto: CreateCourseWorkDto): Promise<CourseWork> {
    const [student, subject] = await Promise.all([
      this.studentModel.findByPk(createCourseWorkDto.student_id),
      this.subjectModel.findByPk(createCourseWorkDto.subject_id),
    ]);

    if (!student) {
      throw new NotFoundException("Student not found");
    }
    if (!subject) {
      throw new NotFoundException("Subject not found");
    }

    const submissionDate = new Date(createCourseWorkDto.submission_date);
    if (submissionDate < new Date()) {
      throw new BadRequestException("Submission date cannot be in the past");
    }

    return this.courseWorkModel.create({
      ...createCourseWorkDto,
      grade: "PENDING",
      score: 0,
    });
  }

  async findAll(): Promise<CourseWork[]> {
    return this.courseWorkModel.findAll({
      include: [Student, Subject],
      order: [["submission_date", "DESC"]],
    });
  }

  async findPending(): Promise<CourseWork[]> {
    return this.courseWorkModel.findAll({
      where: { grade: "PENDING" },
      include: [Student, Subject],
      order: [["submission_date", "ASC"]],
    });
  }

  async findOverdue(): Promise<CourseWork[]> {
    const today = new Date();
    return this.courseWorkModel.findAll({
      where: {
        submission_date: { [Op.lt]: today },
        grade: "PENDING",
      },
      include: [Student, Subject],
      order: [["submission_date", "ASC"]],
    });
  }

  async findByStudent(studentId: number): Promise<CourseWork[]> {
    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.courseWorkModel.findAll({
      where: { student_id: studentId },
      include: [Subject],
      order: [["submission_date", "DESC"]],
    });
  }

  async findBySubject(subjectId: number): Promise<CourseWork[]> {
    const subject = await this.subjectModel.findByPk(subjectId);
    if (!subject) {
      throw new NotFoundException("Subject not found");
    }

    return this.courseWorkModel.findAll({
      where: { subject_id: subjectId },
      include: [Student],
      order: [["submission_date", "DESC"]],
    });
  }

  async findOne(id: number): Promise<CourseWork> {
    const courseWork = await this.courseWorkModel.findByPk(id, {
      include: [Student, Subject],
    });

    if (!courseWork) {
      throw new NotFoundException(`Course work with ID ${id} not found`);
    }

    return courseWork;
  }

  async update(
    id: number,
    updateCourseWorkDto: UpdateCourseWorkDto
  ): Promise<CourseWork> {
    const courseWork = await this.findOne(id);
    await courseWork.update(updateCourseWorkDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const courseWork = await this.findOne(id);
    await courseWork.destroy();
    return { message: "Course work deleted successfully" };
  }

  async grade(
    id: number,
    grade: string,
    score: number,
    feedback?: string
  ): Promise<CourseWork> {
    const courseWork = await this.findOne(id);

    if (courseWork.isGraded) {
      throw new BadRequestException("Course work already graded");
    }

    if (score < 0 || score > 100) {
      throw new BadRequestException("Score must be between 0 and 100");
    }

    await courseWork.update({
      grade: grade,
      score: score,
      feedback: feedback,
    });

    return this.findOne(id);
  }
}
