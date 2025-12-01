import { 
  type User, type InsertUser, 
  type Teacher, type InsertTeacher,
  type Feedback, type InsertFeedback,
  users, teachers, feedback 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  deleteTeacher(id: string): Promise<void>;
  
  getFeedbackByTeacher(teacherId: string): Promise<Feedback[]>;
  getFeedbackByStudent(studentId: string): Promise<Feedback[]>;
  createFeedback(feedbackData: InsertFeedback & { studentName: string }): Promise<Feedback>;
  hasFeedback(teacherId: string, studentId: string): Promise<boolean>;
  getStudentFeedbackTeachers(studentId: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        username: insertUser.email.split("@")[0],
      })
      .returning();
    return user;
  }

  async getTeachers(): Promise<Teacher[]> {
    return db.select().from(teachers).orderBy(teachers.name);
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const [teacher] = await db
      .insert(teachers)
      .values(insertTeacher)
      .returning();
    return teacher;
  }

  async deleteTeacher(id: string): Promise<void> {
    await db.delete(teachers).where(eq(teachers.id, id));
  }

  async getFeedbackByTeacher(teacherId: string): Promise<Feedback[]> {
    return db
      .select()
      .from(feedback)
      .where(eq(feedback.teacherId, teacherId))
      .orderBy(desc(feedback.createdAt));
  }

  async getFeedbackByStudent(studentId: string): Promise<Feedback[]> {
    return db
      .select()
      .from(feedback)
      .where(eq(feedback.studentId, studentId))
      .orderBy(desc(feedback.createdAt));
  }

  async hasFeedback(teacherId: string, studentId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(feedback)
      .where(and(eq(feedback.teacherId, teacherId), eq(feedback.studentId, studentId)));
    return !!existing;
  }

  async getStudentFeedbackTeachers(studentId: string): Promise<string[]> {
    const result = await db
      .select({ teacherId: feedback.teacherId })
      .from(feedback)
      .where(eq(feedback.studentId, studentId));
    return result.map(r => r.teacherId);
  }

  async createFeedback(feedbackData: InsertFeedback & { studentName: string }): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    
    // Update teacher's average rating
    const allFeedback = await this.getFeedbackByTeacher(feedbackData.teacherId);
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    
    await db
      .update(teachers)
      .set({
        averageRating: avgRating,
        totalFeedback: allFeedback.length,
      })
      .where(eq(teachers.id, feedbackData.teacherId));

    return newFeedback;
  }
}

export const storage = new DatabaseStorage();
