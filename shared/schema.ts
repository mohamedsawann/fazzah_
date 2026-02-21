import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 6 }).notNull().unique(),
  name: text("name").notNull(),
  questionDurationSeconds: integer("question_duration").notNull().default(20),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  gameId: varchar("game_id").references(() => games.id).notNull(),
  score: integer("score").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  totalAnswers: integer("total_answers").notNull().default(0),
  averageTime: integer("average_time").notNull().default(0), // in seconds
  completedAt: timestamp("completed_at"),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").references(() => games.id).notNull(),
  text: text("text").notNull(),
  options: text("options").array().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  order: integer("order").notNull(),
});


export const playerAnswers = pgTable("player_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").references(() => players.id).notNull(),
  questionId: varchar("question_id").references(() => questions.id).notNull(),
  selectedAnswer: integer("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").notNull(), // in seconds
  points: integer("points").notNull().default(0),
});

export const siteStats = pgTable("site_stats", {
  id: varchar("id").primaryKey(),
  visitors: integer("visitors").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  code: true,
  isActive: true,
}).extend({
  questionDurationSeconds: z.number().min(5).max(120).optional(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  score: true,
  correctAnswers: true,
  totalAnswers: true,
  averageTime: true,
  completedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertPlayerAnswerSchema = createInsertSchema(playerAnswers).omit({
  id: true,
  points: true,
});

// Types
export type Game = typeof games.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type PlayerAnswer = typeof playerAnswers.$inferSelect;
export type SiteStats = typeof siteStats.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertPlayerAnswer = z.infer<typeof insertPlayerAnswerSchema>;
