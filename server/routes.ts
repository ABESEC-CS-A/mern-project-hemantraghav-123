import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, signupSchema, insertTeacherSchema, insertFeedbackSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const JWT_SECRET = process.env.SESSION_SECRET || "edufeedback-secret-key";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user = await storage.createUser({
        ...data,
        username: data.email.split("@")[0],
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Teacher Routes
  app.get("/api/teachers", async (_req, res) => {
    try {
      const teachersList = await storage.getTeachers();
      res.json(teachersList);
    } catch (error) {
      console.error("Get teachers error:", error);
      res.status(500).json({ error: "Failed to get teachers" });
    }
  });

  app.get("/api/teachers/:id", async (req, res) => {
    try {
      const teacher = await storage.getTeacher(req.params.id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      console.error("Get teacher error:", error);
      res.status(500).json({ error: "Failed to get teacher" });
    }
  });

  app.post("/api/teachers", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const data = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(data);
      res.status(201).json(teacher);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Create teacher error:", error);
      res.status(500).json({ error: "Failed to create teacher" });
    }
  });

  app.delete("/api/teachers/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const teacher = await storage.getTeacher(req.params.id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      await storage.deleteTeacher(req.params.id);
      res.json({ message: "Teacher deleted successfully" });
    } catch (error) {
      console.error("Delete teacher error:", error);
      res.status(500).json({ error: "Failed to delete teacher" });
    }
  });

  // Feedback Routes
  app.get("/api/feedback/teacher/:teacherId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const feedbackList = await storage.getFeedbackByTeacher(req.params.teacherId);
      res.json(feedbackList);
    } catch (error) {
      console.error("Get feedback error:", error);
      res.status(500).json({ error: "Failed to get feedback" });
    }
  });

  app.get("/api/feedback/my-submissions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const teacherIds = await storage.getStudentFeedbackTeachers(req.user!.id);
      res.json(teacherIds);
    } catch (error) {
      console.error("Get submissions error:", error);
      res.status(500).json({ error: "Failed to get submissions" });
    }
  });

  app.post("/api/feedback", authenticateToken, requireRole("student"), async (req: AuthRequest, res) => {
    try {
      const data = insertFeedbackSchema.parse(req.body);
      
      // Check for duplicate feedback
      const hasExisting = await storage.hasFeedback(data.teacherId, req.user!.id);
      if (hasExisting) {
        return res.status(400).json({ error: "You have already submitted feedback for this teacher" });
      }

      const teacher = await storage.getTeacher(data.teacherId);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      const newFeedback = await storage.createFeedback({
        ...data,
        studentId: req.user!.id,
        studentName: req.user!.name,
        subject: teacher.subject,
      });

      res.status(201).json(newFeedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Create feedback error:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // Get all feedback (for teachers to view their own)
  app.get("/api/feedback/received", authenticateToken, requireRole("teacher"), async (req: AuthRequest, res) => {
    try {
      // For now, return all feedback - in production, you'd link teachers to their user accounts
      // This is a simplified version
      const teachersList = await storage.getTeachers();
      const allFeedback: any[] = [];
      
      for (const teacher of teachersList) {
        const teacherFeedback = await storage.getFeedbackByTeacher(teacher.id);
        allFeedback.push(...teacherFeedback.map(f => ({
          ...f,
          teacherName: teacher.name,
        })));
      }
      
      allFeedback.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      res.json(allFeedback);
    } catch (error) {
      console.error("Get received feedback error:", error);
      res.status(500).json({ error: "Failed to get feedback" });
    }
  });

  return httpServer;
}
