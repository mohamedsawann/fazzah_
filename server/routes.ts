import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabaseAdmin } from "./supabase";
import { insertGameSchema, insertPlayerSchema, insertPlayerAnswerSchema, insertQuestionSchema } from "@shared/schema";
import { z } from "zod";

const BUCKET_NAME = "game-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function registerRoutes(app: Express): Promise<Server> {

  // Upload image to Supabase Storage
  app.post("/api/upload-image", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          message: "Image upload is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
        });
      }
      const { image } = req.body as { image?: string };
      if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
        return res.status(400).json({ message: "Invalid image data. Expected base64 data URL (data:image/...;base64,...)" });
      }
      const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ message: "Invalid image format" });
      }
      const ext = match[1] === "jpeg" ? "jpg" : match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");
      if (buffer.length > MAX_IMAGE_SIZE) {
        return res.status(400).json({ message: "Image too large. Maximum size is 5MB." });
      }
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, {
          contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
          upsert: false,
        });
      if (error) {
        console.error("Supabase storage upload error:", error);
        return res.status(500).json({
          message: error.message || "Failed to upload image. Ensure the 'game-images' bucket exists in Supabase Storage.",
        });
      }
      const { data: urlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(data.path);
      res.json({ url: urlData.publicUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      res.status(500).json({ message: msg });
    }
  });

  // Create a new game with questions
  app.post("/api/games", async (req, res) => {
    try {
      const optionSchema = z.union([
        z.object({ text: z.string(), image: z.string().optional() }),
        z.string()
      ]);
      const requestSchema = z.object({
        name: z.string().min(1),
        questionDurationSeconds: z.number().min(5).max(120).optional(),
        questions: z.array(z.object({
          text: z.string().min(1),
          image: z.string().optional(),
          options: z.array(optionSchema).min(2).max(6),
          correctAnswer: z.number().min(0)
        })).min(1).max(50)
      });
      
      const { name, questionDurationSeconds, questions } = requestSchema.parse(req.body);
      
      const questionsForStorage = questions.map((q, index) => ({
        text: q.text,
        image: q.image,
        options: q.options.map(opt => (typeof opt === "string" ? { text: opt } : { text: opt.text, image: opt.image })),
        correctAnswer: q.correctAnswer,
        gameId: "",
        order: index + 1
      }));
      
      const game = await storage.createGame(
        { name, questionDurationSeconds: questionDurationSeconds ?? 20 },
        questionsForStorage
      );
      
      res.json(game);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid game data";
      const isValidation = error instanceof z.ZodError;
      res.status(isValidation ? 400 : 500).json({ message });
    }
  });

  // Get game by ID
  app.get("/api/games/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
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
      
      // Check if player already exists for this game
      const existingPlayer = await storage.findExistingPlayer(
        playerData.name,
        playerData.phone,
        playerData.gameId
      );
      
      if (existingPlayer) {
        // Player already exists - return existing player info
        res.json({ 
          ...existingPlayer, 
          isExisting: true,
          hasCompleted: !!existingPlayer.completedAt 
        });
        return;
      }
      
      // Create new player if doesn't exist
      const player = await storage.createPlayer(playerData);
      res.json({ ...player, isExisting: false, hasCompleted: false });
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

  // Get today's game statistics
  app.get("/api/stats/today", async (req, res) => {
    try {
      // Count games and players created today
      const allGames = await storage.getAllGames();
      const allPlayers = await storage.getAllPlayers();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const gamesPlayedToday = allGames.filter(game => {
        const gameDate = new Date(game.createdAt);
        gameDate.setHours(0, 0, 0, 0);
        return gameDate.getTime() === today.getTime();
      }).length;
      
      const totalPlayers = allPlayers.length;
      
      res.json({
        gamesPlayedToday,
        totalPlayers
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin endpoint - only for you to see analytics with phone numbers
  // Removed admin analytics endpoint for security - exposed PII without authentication

  // Track visitor
  app.post("/api/visitors/track", async (req, res) => {
    try {
      const newCount = await storage.incrementVisitors();
      res.json({ count: newCount });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get visitor count
  app.get("/api/visitors/count", async (req, res) => {
    try {
      const count = await storage.getVisitorCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate trivia questions with AI
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Add OPENAI_API_KEY to .env" });
      }
      const { topic, count = 5, language = "en" } = req.body;
      if (typeof topic !== "string" || !topic.trim()) {
        return res.status(400).json({ error: "Topic is required" });
      }
      const numQuestions = Math.min(50, Math.max(1, parseInt(String(count), 10) || 5));

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey });

      const langHint = language?.startsWith("ar") ? "Write all questions and options in Arabic." : "Write all questions and options in English.";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `Generate ${numQuestions} trivia multiple-choice questions about "${topic.trim()}". ${langHint}

Return ONLY a valid JSON array, no other text. Each item: { "text": "question text", "options": ["A", "B", "C", "D"], "correctAnswer": 0 }
- correctAnswer is 0-based index of the correct option
- Each question must have 2-6 options
- Make questions varied and engaging`,
        }],
      });

      const raw = completion.choices[0]?.message?.content?.trim() ?? "";
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : raw;
      const parsed = JSON.parse(jsonStr) as Array<{ text: string; options: string[]; correctAnswer: number }>;

      const questions = parsed.slice(0, numQuestions).map((q) => {
        const opts = (Array.isArray(q.options) ? q.options : []).slice(0, 6)
          .map((o) => ({ text: String(o || "").trim() }))
          .filter((o) => o.text);
        const correctIdx = Math.max(0, Math.min((q.correctAnswer ?? 0), opts.length - 1));
        return { text: String(q.text || "").trim(), options: opts, correctAnswer: correctIdx };
      }).filter((q) => q.text && q.options.length >= 2);

      res.json({ questions });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to generate questions";
      res.status(500).json({ error: msg });
    }
  });

  // Chat (OpenAI API)
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Chat is not configured. Add OPENAI_API_KEY to .env" });
      }
      const { message } = req.body;
      if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message.trim() }],
      });
      const reply = completion.choices[0]?.message?.content ?? "";
      res.json({ reply });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Chat failed";
      res.status(500).json({ error: msg });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
