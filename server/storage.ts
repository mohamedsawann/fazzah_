import { type Game, type Player, type Question, type PlayerAnswer, type SiteStats, type InsertGame, type InsertPlayer, type InsertQuestion, type InsertPlayerAnswer, siteStats, games, players, questions, playerAnswers } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, sql, desc, lt, and } from "drizzle-orm";

export interface IStorage {
  // Games
  createGame(game: InsertGame, questions: InsertQuestion[]): Promise<Game>;
  getGameByCode(code: string): Promise<Game | undefined>;
  getGame(id: string): Promise<Game | undefined>;
  getAllGames(): Promise<Game[]>;
  
  // Players
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByGame(gameId: string): Promise<Player[]>;
  getAllPlayers(): Promise<Player[]>;
  getWinnersCount(): Promise<number>;
  updatePlayerScore(playerId: string, score: number, correctAnswers: number, totalAnswers: number, averageTime: number): Promise<void>;
  completePlayer(playerId: string): Promise<void>;
  
  // Questions
  getGameQuestions(gameId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  
  // Player Answers
  createPlayerAnswer(answer: InsertPlayerAnswer): Promise<PlayerAnswer>;
  getPlayerAnswers(playerId: string): Promise<PlayerAnswer[]>;
  
  // Site Stats
  incrementVisitors(): Promise<number>;
  getVisitorCount(): Promise<number>;
}

// Database connection
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}
const sql_client = neon(dbUrl);
const db = drizzle(sql_client);

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize cleanup job that runs every hour
    this.startCleanupJob();
  }

  private generateGameCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async generateUniqueGameCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      code = this.generateGameCode();
      const existingGame = await this.getGameByCode(code);
      if (!existingGame) {
        return code;
      }
      attempts++;
    } while (attempts < maxAttempts);
    
    // If we can't generate a unique code after 10 attempts, add timestamp
    return this.generateGameCode() + Date.now().toString().slice(-2);
  }

  private startCleanupJob(): void {
    // Run cleanup every hour
    setInterval(async () => {
      try {
        await this.cleanupOldGames();
      } catch (error) {
        console.error('Cleanup job error:', error);
      }
    }, 60 * 60 * 1000); // 1 hour in milliseconds
    
    // Run initial cleanup
    this.cleanupOldGames().catch(console.error);
  }

  private async cleanupOldGames(): Promise<void> {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    try {
      // Get games older than 48 hours
      const oldGames = await db
        .select({ id: games.id })
        .from(games)
        .where(lt(games.createdAt, fortyEightHoursAgo));

      if (oldGames.length > 0) {
        const gameIds = oldGames.map(game => game.id);
        
        // Delete in correct order due to foreign key constraints
        // 1. Delete player answers first
        for (const gameId of gameIds) {
          await db.delete(playerAnswers)
            .where(sql`${playerAnswers.playerId} IN (SELECT id FROM ${players} WHERE ${players.gameId} = ${gameId})`);
        }
        
        // 2. Delete players
        for (const gameId of gameIds) {
          await db.delete(players)
            .where(eq(players.gameId, gameId));
        }
        
        // 3. Delete questions
        for (const gameId of gameIds) {
          await db.delete(questions)
            .where(eq(questions.gameId, gameId));
        }
        
        // 4. Finally delete games
        for (const gameId of gameIds) {
          await db.delete(games)
            .where(eq(games.id, gameId));
        }
        
        console.log(`Cleaned up ${oldGames.length} games older than 48 hours`);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  async createGame(insertGame: InsertGame, questionsList: InsertQuestion[]): Promise<Game> {
    const code = await this.generateUniqueGameCode();
    
    // Insert game
    const [game] = await db
      .insert(games)
      .values({
        ...insertGame,
        code,
      })
      .returning();

    // Insert questions for this game
    if (questionsList.length > 0) {
      const questionsToInsert = questionsList.map((questionData, index) => ({
        ...questionData,
        gameId: game.id,
        order: index + 1,
      }));

      await db.insert(questions).values(questionsToInsert);
    }

    return game;
  }

  async getGameByCode(code: string): Promise<Game | undefined> {
    const result = await db
      .select()
      .from(games)
      .where(eq(games.code, code))
      .limit(1);
    
    return result[0];
  }

  async getGame(id: string): Promise<Game | undefined> {
    const result = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1);
    
    return result[0];
  }

  async getAllGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(desc(games.createdAt));
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.id, id))
      .limit(1);
    
    return result[0];
  }

  async getPlayersByGame(gameId: string): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(eq(players.gameId, gameId))
      .orderBy(desc(players.score));
  }

  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async getWinnersCount(): Promise<number> {
    const allGames = await this.getAllGames();
    let winnersCount = 0;
    
    for (const game of allGames) {
      const gamePlayers = await this.getPlayersByGame(game.id);
      // Count completed players (those who finished the game)
      const completedPlayers = gamePlayers.filter(p => p.completedAt !== null);
      
      // If there are completed players, the top scorer is the winner
      if (completedPlayers.length > 0) {
        winnersCount += 1; // One winner per game
      }
    }
    
    return winnersCount;
  }

  async updatePlayerScore(playerId: string, score: number, correctAnswers: number, totalAnswers: number, averageTime: number): Promise<void> {
    await db
      .update(players)
      .set({
        score,
        correctAnswers,
        totalAnswers,
        averageTime,
      })
      .where(eq(players.id, playerId));
  }

  async completePlayer(playerId: string): Promise<void> {
    await db
      .update(players)
      .set({
        completedAt: new Date(),
      })
      .where(eq(players.id, playerId));
  }

  async getGameQuestions(gameId: string): Promise<Question[]> {
    const gameQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.gameId, gameId))
      .orderBy(questions.order);
    
    // Randomize question order
    const shuffledQuestions = [...gameQuestions].sort(() => Math.random() - 0.5);
    
    // Randomize answer options for each question and update correct answer index
    return shuffledQuestions.map(question => {
      const optionsWithIndex = question.options.map((option, index) => ({
        option,
        wasCorrect: index === question.correctAnswer
      }));
      
      // Shuffle the options
      const shuffledOptions = [...optionsWithIndex].sort(() => Math.random() - 0.5);
      
      // Find the new index of the correct answer
      const newCorrectIndex = shuffledOptions.findIndex(item => item.wasCorrect);
      
      return {
        ...question,
        options: shuffledOptions.map(item => item.option),
        correctAnswer: newCorrectIndex
      };
    });
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);
    
    return result[0];
  }

  async createPlayerAnswer(insertAnswer: InsertPlayerAnswer): Promise<PlayerAnswer> {
    // Calculate points based on correctness and speed
    let points = 0;
    if (insertAnswer.isCorrect) {
      // Base points for correct answer: 1000
      // Bonus points for speed: max 500 points (decreases with time)
      const basePoints = 1000;
      const speedBonus = Math.max(0, 500 - (insertAnswer.timeSpent * 25));
      points = Math.round(basePoints + speedBonus);
    }

    const [playerAnswer] = await db
      .insert(playerAnswers)
      .values({
        ...insertAnswer,
        points,
      })
      .returning();
    
    return playerAnswer;
  }

  async getPlayerAnswers(playerId: string): Promise<PlayerAnswer[]> {
    return await db
      .select()
      .from(playerAnswers)
      .where(eq(playerAnswers.playerId, playerId));
  }

  async incrementVisitors(): Promise<number> {
    // Atomic increment with upsert to handle concurrent visitors properly
    const result = await db
      .insert(siteStats)
      .values({ id: 'main', visitors: 1 })
      .onConflictDoUpdate({
        target: siteStats.id,
        set: {
          visitors: sql`${siteStats.visitors} + 1`,
          updatedAt: new Date()
        }
      })
      .returning();
    
    return result[0].visitors;
  }

  async getVisitorCount(): Promise<number> {
    const stats = await db.select().from(siteStats).where(eq(siteStats.id, 'main'));
    return stats.length > 0 ? stats[0].visitors : 0;
  }
}

export const storage = new DatabaseStorage();
