import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertPlayerSchema, insertPlayerAnswerSchema, insertQuestionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new game with questions
  app.post("/api/games", async (req, res) => {
    try {
      const requestSchema = z.object({
        name: z.string().min(1),
        questions: z.array(z.object({
          text: z.string().min(1),
          options: z.array(z.string()).min(2).max(6),
          correctAnswer: z.number().min(0)
        })).min(1).max(50)
      });
      
      const { name, questions } = requestSchema.parse(req.body);
      const game = await storage.createGame({ name }, questions);
      
      res.json(game);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid game data" });
    }
  });

  // Get game by code
  app.get("/api/games/code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const game = await storage.getGameByCode(code.toUpperCase());
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get game questions
  app.get("/api/games/:gameId/questions", async (req, res) => {
    try {
      const { gameId } = req.params;
      const questions = await storage.getGameQuestions(gameId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a player
  app.post("/api/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid player data" });
    }
  });

  // Submit player answer
  app.post("/api/players/:playerId/answers", async (req, res) => {
    try {
      const { playerId } = req.params;
      const answerData = insertPlayerAnswerSchema.parse({
        ...req.body,
        playerId
      });
      
      const answer = await storage.createPlayerAnswer(answerData);
      res.json(answer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid answer data" });
    }
  });

  // Complete game for player
  app.post("/api/players/:playerId/complete", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      // Get all player answers to calculate final score
      const answers = await storage.getPlayerAnswers(playerId);
      const totalScore = answers.reduce((sum, answer) => sum + answer.points, 0);
      const correctAnswers = answers.filter(answer => answer.isCorrect).length;
      const totalAnswers = answers.length;
      const averageTime = Math.round(answers.reduce((sum, answer) => sum + answer.timeSpent, 0) / answers.length);
      
      await storage.updatePlayerScore(playerId, totalScore, correctAnswers, totalAnswers, averageTime);
      await storage.completePlayer(playerId);
      
      const player = await storage.getPlayer(playerId);
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get game leaderboard
  app.get("/api/games/:gameId/leaderboard", async (req, res) => {
    try {
      const { gameId } = req.params;
      const players = await storage.getPlayersByGame(gameId);
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get today's top players (across all games)
  app.get("/api/leaderboard/today", async (req, res) => {
    try {
      // For now, return mock data since we don't have date filtering
      // In a real implementation, you'd filter by today's date
      const mockLeaderboard = [
        { name: "أحمد محمد", score: 2580 },
        { name: "سارة علي", score: 2340 },
        { name: "محمد خالد", score: 2180 }
      ];
      res.json(mockLeaderboard);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
