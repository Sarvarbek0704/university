import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, fn, col, literal } from "sequelize";
import { Prerequisite } from "./models/prerequisite.model";
import { Subject } from "../subjects/models/subject.model";
import { Student } from "../students/models/student.model";
import { ExamResult } from "../exam_results/models/exam_result.model";
import { CreatePrerequisiteDto } from "./dto/create-prerequisite.dto";
import { UpdatePrerequisiteDto } from "./dto/update-prerequisite.dto";
import { FilterPrerequisiteDto } from "./dto/filter-prerequisite.dto";
import { PrerequisiteCheckDto } from "./dto/prerequisite-check.dto";
import { Exam } from "../exams/models/exam.model";
import { Group } from "../groups/models/group.model";

@Injectable()
export class PrerequisitesService {
  constructor(
    @InjectModel(Prerequisite)
    private readonly prerequisiteModel: typeof Prerequisite,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(ExamResult)
    private readonly examResultModel: typeof ExamResult
  ) {}

  async create(
    createPrerequisiteDto: CreatePrerequisiteDto
  ): Promise<Prerequisite> {
    // Fanlarni tekshirish
    await this.validateSubjects(
      createPrerequisiteDto.subject_id,
      createPrerequisiteDto.prerequisite_subject_id
    );

    // Bir xil prerequisite mavjudligini tekshirish
    const existingPrerequisite = await this.prerequisiteModel.findOne({
      where: {
        subject_id: createPrerequisiteDto.subject_id,
        prerequisite_subject_id: createPrerequisiteDto.prerequisite_subject_id,
      },
    });

    if (existingPrerequisite) {
      throw new ConflictException(
        "Prerequisite for this subject and prerequisite subject already exists"
      );
    }

    // Circular dependency ni tekshirish
    await this.checkCircularDependency(
      createPrerequisiteDto.subject_id,
      createPrerequisiteDto.prerequisite_subject_id
    );

    const prerequisite = await this.prerequisiteModel.create({
      subject_id: createPrerequisiteDto.subject_id,
      prerequisite_subject_id: createPrerequisiteDto.prerequisite_subject_id,
      required_grade: createPrerequisiteDto.required_grade,
      note: createPrerequisiteDto.note,
      is_mandatory: createPrerequisiteDto.is_mandatory ?? true,
      min_semester: createPrerequisiteDto.min_semester,
      min_score: createPrerequisiteDto.min_score,
    } as any);

    return this.findOne(prerequisite.id);
  }

  async createBulk(prerequisites: CreatePrerequisiteDto[]): Promise<{
    created: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      created: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const prerequisiteDto of prerequisites) {
      try {
        await this.create(prerequisiteDto);
        result.created++;
      } catch (error) {
        result.failed++;
        result.errors.push(
          `Subject ${prerequisiteDto.subject_id} -> Prerequisite ${prerequisiteDto.prerequisite_subject_id}: ${error.message}`
        );
      }
    }

    return result;
  }

  async checkPrerequisites(
    prerequisiteCheckDto: PrerequisiteCheckDto
  ): Promise<any> {
    const subject = await this.subjectModel.findByPk(
      prerequisiteCheckDto.subject_id
    );
    if (!subject) {
      throw new NotFoundException(
        `Subject with ID ${prerequisiteCheckDto.subject_id} not found`
      );
    }

    const prerequisites = await this.prerequisiteModel.findAll({
      where: {
        subject_id: prerequisiteCheckDto.subject_id,
        is_active: true,
      },
      include: [
        {
          model: Subject,
          as: "prerequisite_subject",
          attributes: ["id", "name", "credit"],
        },
      ],
    });

    const results: any[] = [];

    for (const studentData of prerequisiteCheckDto.students) {
      const student = await this.studentModel.findByPk(studentData.student_id);
      if (!student) {
        results.push({
          student_id: studentData.student_id,
          status: "ERROR",
          error: "Student not found",
          prerequisites: [],
        });
        continue;
      }

      const studentResults = await this.checkStudentPrerequisitesInternal(
        studentData.student_id,
        prerequisites,
        studentData.completed_subjects,
        prerequisiteCheckDto.include_details
      );

      results.push({
        student_id: studentData.student_id,
        student_name: student.full_name,
        status: studentResults.allMet ? "ELIGIBLE" : "NOT_ELIGIBLE",
        ...studentResults,
      });
    }

    return {
      subject: {
        id: subject.id,
        name: subject.name,
        credit: subject.credit,
      },
      total_prerequisites: prerequisites.length,
      mandatory_prerequisites: prerequisites.filter((p) => p.is_mandatory)
        .length,
      results,
    };
  }

  async findAll(filterDto: FilterPrerequisiteDto): Promise<Prerequisite[]> {
    const whereClause: any = {};

    if (filterDto.subject_id) {
      whereClause.subject_id = filterDto.subject_id;
    }

    if (filterDto.prerequisite_subject_id) {
      whereClause.prerequisite_subject_id = filterDto.prerequisite_subject_id;
    }

    if (filterDto.required_grade) {
      whereClause.required_grade = filterDto.required_grade;
    }

    if (filterDto.is_mandatory !== undefined) {
      whereClause.is_mandatory = filterDto.is_mandatory;
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.prerequisiteModel.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          as: "subject",
          attributes: ["id", "name", "credit", "semester_number"],
        },
        {
          model: Subject,
          as: "prerequisite_subject",
          attributes: ["id", "name", "credit", "semester_number"],
        },
      ],
      order: [
        [filterDto.sort_by || "created_at", filterDto.sort_order || "ASC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Prerequisite> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid prerequisite ID");
    }

    const prerequisite = await this.prerequisiteModel.findByPk(id, {
      include: [
        {
          model: Subject,
          as: "subject",
          attributes: [
            "id",
            "name",
            "credit",
            "semester_number",
            "description",
          ],
        },
        {
          model: Subject,
          as: "prerequisite_subject",
          attributes: [
            "id",
            "name",
            "credit",
            "semester_number",
            "description",
          ],
        },
      ],
    });

    if (!prerequisite) {
      throw new NotFoundException(`Prerequisite with ID ${id} not found`);
    }

    return prerequisite;
  }

  async findBySubject(subjectId: number): Promise<Prerequisite[]> {
    if (!subjectId || isNaN(subjectId)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.subjectModel.findByPk(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    return this.prerequisiteModel.findAll({
      where: {
        subject_id: subjectId,
        is_active: true,
      },
      include: [
        {
          model: Subject,
          as: "prerequisite_subject",
          attributes: ["id", "name", "credit", "semester_number"],
        },
      ],
      order: [["is_mandatory", "DESC"]],
    });
  }

  async findByPrerequisiteSubject(subjectId: number): Promise<Prerequisite[]> {
    if (!subjectId || isNaN(subjectId)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.subjectModel.findByPk(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    return this.prerequisiteModel.findAll({
      where: {
        prerequisite_subject_id: subjectId,
        is_active: true,
      },
      include: [
        {
          model: Subject,
          as: "subject",
          attributes: ["id", "name", "credit", "semester_number"],
        },
      ],
      order: [["is_mandatory", "DESC"]],
    });
  }

  async getPrerequisiteTree(subjectId: number): Promise<any> {
    if (!subjectId || isNaN(subjectId)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.subjectModel.findByPk(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    const buildTree = async (
      currentSubjectId: number,
      depth: number = 0,
      visited: Set<number> = new Set()
    ): Promise<any> => {
      if (visited.has(currentSubjectId) || depth > 10) {
        return {
          id: currentSubjectId,
          name: "CIRCULAR_REFERENCE",
          children: [],
        };
      }

      visited.add(currentSubjectId);

      const prerequisites = await this.prerequisiteModel.findAll({
        where: {
          subject_id: currentSubjectId,
          is_active: true,
        },
        include: [
          {
            model: Subject,
            as: "prerequisite_subject",
            attributes: ["id", "name", "credit", "semester_number"],
          },
        ],
      });

      const currentSubject = await this.subjectModel.findByPk(
        currentSubjectId,
        {
          attributes: ["id", "name", "credit", "semester_number"],
        }
      );

      const children = await Promise.all(
        prerequisites.map(async (prereq) => ({
          id: prereq.prerequisite_subject_id,
          name: prereq.prerequisite_subject.name,
          credit: prereq.prerequisite_subject.credit,
          semester: prereq.prerequisite_subject.semester_number,
          required_grade: prereq.required_grade,
          is_mandatory: prereq.is_mandatory,
          min_score: prereq.min_score,
          children: await buildTree(
            prereq.prerequisite_subject_id,
            depth + 1,
            new Set(visited)
          ),
        }))
      );

      return {
        id: currentSubject!.id,
        name: currentSubject!.name,
        credit: currentSubject!.credit,
        semester: currentSubject!.semester_number,
        children,
      };
    };

    return buildTree(subjectId);
  }

  async checkStudentPrerequisites(
    studentId: number,
    subjectId: number
  ): Promise<any> {
    const [student, subject] = await Promise.all([
      this.studentModel.findByPk(studentId),
      this.subjectModel.findByPk(subjectId),
    ]);

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    const prerequisites = await this.prerequisiteModel.findAll({
      where: {
        subject_id: subjectId,
        is_active: true,
      },
      include: [
        {
          model: Subject,
          as: "prerequisite_subject",
          attributes: ["id", "name", "credit"],
        },
      ],
    });

    return this.checkStudentPrerequisitesInternal(studentId, prerequisites);
  }

  async update(
    id: number,
    updatePrerequisiteDto: UpdatePrerequisiteDto
  ): Promise<Prerequisite> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid prerequisite ID");
    }

    const prerequisite = await this.findOne(id);

    await prerequisite.update(updatePrerequisiteDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid prerequisite ID");
    }

    const prerequisite = await this.findOne(id);
    await prerequisite.destroy();

    return { message: "Prerequisite deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Prerequisite> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid prerequisite ID");
    }

    const prerequisite = await this.findOne(id);
    await prerequisite.update({ is_active: !prerequisite.is_active });

    return this.findOne(id);
  }

  async checkCircularDependencies(): Promise<{
    hasCircular: boolean;
    cycles: any[];
  }> {
    const allPrerequisites = await this.prerequisiteModel.findAll({
      where: { is_active: true },
      attributes: ["subject_id", "prerequisite_subject_id"],
      raw: true,
    });

    const graph: Map<number, number[]> = new Map();

    // Graph qurish
    allPrerequisites.forEach((prereq) => {
      if (!graph.has(prereq.subject_id)) {
        graph.set(prereq.subject_id, []);
      }
      const adjacencyList = graph.get(prereq.subject_id);
      if (adjacencyList) {
        adjacencyList.push(prereq.prerequisite_subject_id);
      }
    });

    const cycles: number[][] = [];
    const visited: Set<number> = new Set();
    const recursionStack: Set<number> = new Set();

    const dfs = (node: number, path: number[]): boolean => {
      if (recursionStack.has(node)) {
        // Circular dependency topildi
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
        return true;
      }

      if (visited.has(node)) {
        return false;
      }

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor, [...path])) {
          recursionStack.delete(node);
          return true;
        }
      }

      recursionStack.delete(node);
      path.pop();
      return false;
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    // Cycle larni ma'lumotlar bilan to'ldirish
    const detailedCycles = await Promise.all(
      cycles.map(async (cycle) => {
        const subjects = await this.subjectModel.findAll({
          where: { id: cycle },
          attributes: ["id", "name"],
        });

        return {
          cycle: cycle.map((id) => {
            const subject = subjects.find((s) => s.id === id);
            return {
              id,
              name: subject ? subject.name : "Unknown",
            };
          }),
          length: cycle.length,
        };
      })
    );

    return {
      hasCircular: detailedCycles.length > 0,
      cycles: detailedCycles,
    };
  }

  async getMostRequiredPrerequisites(limit: number = 10): Promise<any> {
    const mostRequired = await this.prerequisiteModel.findAll({
      attributes: [
        "prerequisite_subject_id",
        [fn("COUNT", col("id")), "requirement_count"],
      ],
      include: [
        {
          model: Subject,
          as: "prerequisite_subject",
          attributes: ["id", "name", "credit"],
        },
      ],
      where: { is_active: true },
      group: ["prerequisite_subject_id", "prerequisite_subject.id"],
      order: [[literal("requirement_count"), "DESC"]],
      limit,
      raw: false,
    });

    return mostRequired.map((item) => ({
      subject: {
        id: item.prerequisite_subject.id,
        name: item.prerequisite_subject.name,
        credit: item.prerequisite_subject.credit,
      },
      requirement_count: parseInt(item.get("requirement_count") as string),
    }));
  }

  async getEligibleSubjects(studentId: number): Promise<any> {
    const student = await this.studentModel.findByPk(studentId, {
      include: [
        {
          model: Group,
          attributes: ["id", "name", "course_number"],
        },
      ],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Talabaning tamomlagan fanlari va ballari
    const completedSubjects = await this.examResultModel.findAll({
      where: {
        student_id: studentId,
        score: { [Op.gte]: 60 }, // Faqat o'tgan fanlar
      },
      include: [
        {
          model: Exam,
          attributes: ["id"],
          include: [
            {
              model: Subject,
              attributes: ["id", "name", "semester_number"],
            },
          ],
        },
      ],
      attributes: ["id", "score"],
    });

    const completedMap = new Map();
    completedSubjects.forEach((result) => {
      if (result.exam && result.exam.subject) {
        completedMap.set(result.exam.subject.id, {
          score: result.score,
          semester: result.exam.subject.semester_number,
        });
      }
    });

    // Barcha fanlarni olish
    const allSubjects = await this.subjectModel.findAll({
      attributes: ["id", "name", "credit", "semester_number", "description"],
    });

    const eligibleSubjects: any[] = [];
    const ineligibleSubjects: any[] = [];

    for (const subject of allSubjects) {
      const prerequisites = await this.prerequisiteModel.findAll({
        where: {
          subject_id: subject.id,
          is_active: true,
        },
        include: [
          {
            model: Subject,
            as: "prerequisite_subject",
            attributes: ["id", "name"],
          },
        ],
      });

      const prerequisiteCheck = await this.checkPrerequisitesForSubject(
        prerequisites,
        completedMap
      );

      if (prerequisiteCheck.allMet) {
        eligibleSubjects.push({
          subject: {
            id: subject.id,
            name: subject.name,
            credit: subject.credit,
            semester: subject.semester_number,
          },
          prerequisites_met: true,
          missing_prerequisites: [],
        } as any);
      } else {
        ineligibleSubjects.push({
          subject: {
            id: subject.id,
            name: subject.name,
            credit: subject.credit,
            semester: subject.semester_number,
          },
          prerequisites_met: false,
          missing_prerequisites: prerequisiteCheck.missingPrerequisites,
        } as any);
      }
    }

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
        group: (student as any).infoStudent?.group?.name || "Unknown",
        course_number: (student as any).infoStudent?.group?.course_number || 0,
      },
      completed_subjects_count: completedMap.size,
      eligible_subjects_count: eligibleSubjects.length,
      ineligible_subjects_count: ineligibleSubjects.length,
      eligible_subjects: eligibleSubjects,
      ineligible_subjects: ineligibleSubjects,
    };
  }

  // ========== UTILITY METHODS ==========

  private async validateSubjects(
    subjectId: number,
    prerequisiteSubjectId: number
  ): Promise<void> {
    const [subject, prerequisiteSubject] = await Promise.all([
      this.subjectModel.findByPk(subjectId),
      this.subjectModel.findByPk(prerequisiteSubjectId),
    ]);

    if (!subject) throw new NotFoundException("Subject not found");
    if (!prerequisiteSubject)
      throw new NotFoundException("Prerequisite subject not found");
  }

  private async checkCircularDependency(
    subjectId: number,
    prerequisiteSubjectId: number
  ): Promise<void> {
    // Oddiy circular dependency tekshiruvi
    if (subjectId === prerequisiteSubjectId) {
      throw new BadRequestException(
        "Subject cannot be a prerequisite for itself"
      );
    }

    // Chuqurroq circular dependency tekshiruvi
    const visited = new Set<number>([subjectId]);
    const queue = [prerequisiteSubjectId];

    while (queue.length > 0) {
      const currentSubjectId = queue.shift()!;

      if (visited.has(currentSubjectId)) {
        if (currentSubjectId === subjectId) {
          throw new BadRequestException("Circular dependency detected");
        }
        continue;
      }

      visited.add(currentSubjectId);

      const prerequisites = await this.prerequisiteModel.findAll({
        where: {
          subject_id: currentSubjectId,
          is_active: true,
        },
        attributes: ["prerequisite_subject_id"],
        raw: true,
      });

      for (const prereq of prerequisites) {
        queue.push(prereq.prerequisite_subject_id);
      }
    }
  }

  private async checkStudentPrerequisitesInternal(
    studentId: number,
    prerequisites: Prerequisite[],
    completedSubjects?: number[],
    includeDetails: boolean = false
  ): Promise<any> {
    const result = {
      allMet: true,
      metPrerequisites: [] as any[],
      unmetPrerequisites: [] as any[],
      mandatoryMet: true,
      totalPrerequisites: prerequisites.length,
      metCount: 0,
      unmetCount: 0,
    };

    // Agar completedSubjects berilgan bo'lsa, shundan foydalanish
    if (completedSubjects && completedSubjects.length > 0) {
      for (const prerequisite of prerequisites) {
        const isCompleted = completedSubjects.includes(
          prerequisite.prerequisite_subject_id
        );

        if (isCompleted) {
          result.metCount++;
          result.metPrerequisites.push({
            prerequisite_subject: prerequisite.prerequisite_subject,
            required_grade: prerequisite.required_grade,
            status: "MET",
            details: includeDetails ? prerequisite.gradeDescription : undefined,
          });
        } else {
          result.allMet = false;
          result.unmetCount++;
          if (prerequisite.is_mandatory) {
            result.mandatoryMet = false;
          }
          result.unmetPrerequisites.push({
            prerequisite_subject: prerequisite.prerequisite_subject,
            required_grade: prerequisite.required_grade,
            is_mandatory: prerequisite.is_mandatory,
            status: "NOT_COMPLETED",
            details: includeDetails ? `Subject not completed` : undefined,
          });
        }
      }
    } else {
      // Talabaning imtihon natijalaridan foydalanish
      for (const prerequisite of prerequisites) {
        const examResult = await this.examResultModel.findOne({
          where: {
            student_id: studentId,
            "$exam.subject_id$": prerequisite.prerequisite_subject_id,
          },
          include: [
            {
              model: Exam,
              attributes: ["id"],
              include: [
                {
                  model: Subject,
                  attributes: ["id", "semester_number"],
                },
              ],
            },
          ],
          order: [["score", "DESC"]],
        });

        if (examResult && examResult.score >= prerequisite.requiredScore) {
          result.metCount++;
          result.metPrerequisites.push({
            prerequisite_subject: prerequisite.prerequisite_subject,
            required_grade: prerequisite.required_grade,
            actual_score: examResult.score,
            status: "MET",
            details: includeDetails
              ? `Score: ${examResult.score} (Required: ${prerequisite.gradeDescription})`
              : undefined,
          });
        } else {
          result.allMet = false;
          result.unmetCount++;
          if (prerequisite.is_mandatory) {
            result.mandatoryMet = false;
          }
          result.unmetPrerequisites.push({
            prerequisite_subject: prerequisite.prerequisite_subject,
            required_grade: prerequisite.required_grade,
            is_mandatory: prerequisite.is_mandatory,
            actual_score: examResult?.score || 0,
            status: examResult ? "LOW_SCORE" : "NOT_COMPLETED",
            details: includeDetails
              ? examResult
                ? `Score: ${examResult.score} (Required: ${prerequisite.gradeDescription})`
                : "Subject not completed"
              : undefined,
          });
        }
      }
    }

    return result;
  }

  private async checkPrerequisitesForSubject(
    prerequisites: Prerequisite[],
    completedMap: Map<number, { score: number; semester?: number }>
  ): Promise<{ allMet: boolean; missingPrerequisites: any[] }> {
    const result = {
      allMet: true,
      missingPrerequisites: [] as any[],
    };

    for (const prerequisite of prerequisites) {
      const completedData = completedMap.get(
        prerequisite.prerequisite_subject_id
      );

      if (!completedData) {
        result.allMet = false;
        result.missingPrerequisites.push({
          prerequisite_subject: prerequisite.prerequisite_subject,
          required_grade: prerequisite.required_grade,
          reason: "Subject not completed",
          is_mandatory: prerequisite.is_mandatory,
        });
        continue;
      }

      if (
        !prerequisite.checkPrerequisite(
          completedData.score,
          completedData.semester
        )
      ) {
        result.allMet = false;
        result.missingPrerequisites.push({
          prerequisite_subject: prerequisite.prerequisite_subject,
          required_grade: prerequisite.required_grade,
          actual_score: completedData.score,
          reason:
            completedData.score < prerequisite.requiredScore
              ? "Insufficient score"
              : "Semester requirement not met",
          is_mandatory: prerequisite.is_mandatory,
        });
      }
    }

    return result;
  }
}
