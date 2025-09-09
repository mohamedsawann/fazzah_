import { type Game, type Player, type Question, type PlayerAnswer, type InsertGame, type InsertPlayer, type InsertQuestion, type InsertPlayerAnswer } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private games: Map<string, Game>;
  private players: Map<string, Player>;
  private questions: Map<string, Question>;
  private playerAnswers: Map<string, PlayerAnswer>;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.questions = new Map();
    this.playerAnswers = new Map();
  }

  private generateGameCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createGame(insertGame: InsertGame, questions: InsertQuestion[]): Promise<Game> {
    const id = randomUUID();
    const code = this.generateGameCode();
    const game: Game = {
      ...insertGame,
      id,
      code,
      createdAt: new Date(),
      isActive: true,
    };
    this.games.set(id, game);

    // Create questions for this game
    questions.forEach((questionData, index) => {
      const questionId = randomUUID();
      const question: Question = {
        ...questionData,
        id: questionId,
        gameId: id,
        order: index + 1,
      };
      this.questions.set(questionId, question);
    });

    return game;
  }

  async getGameByCode(code: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(game => game.code === code);
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      ...insertPlayer,
      id,
      score: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      averageTime: 0,
      completedAt: null,
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByGame(gameId: string): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(player => player.gameId === gameId)
      .sort((a, b) => b.score - a.score);
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getWinnersCount(): Promise<number> {
    const allGames = await this.getAllGames();
    let winnersCount = 0;
    
    for (const game of allGames) {
      const players = await this.getPlayersByGame(game.id);
      // Count completed players (those who finished the game)
      const completedPlayers = players.filter(p => p.completedAt !== null);
      
      // If there are completed players, the top scorer is the winner
      if (completedPlayers.length > 0) {
        winnersCount += 1; // One winner per game
      }
    }
    
    return winnersCount;
  }

  async updatePlayerScore(playerId: string, score: number, correctAnswers: number, totalAnswers: number, averageTime: number): Promise<void> {
    const player = this.players.get(playerId);
    if (player) {
      player.score = score;
      player.correctAnswers = correctAnswers;
      player.totalAnswers = totalAnswers;
      player.averageTime = averageTime;
      this.players.set(playerId, player);
    }
  }

  async completePlayer(playerId: string): Promise<void> {
    const player = this.players.get(playerId);
    if (player) {
      player.completedAt = new Date();
      this.players.set(playerId, player);
    }
  }

  async getGameQuestions(gameId: string): Promise<Question[]> {
    const questions = Array.from(this.questions.values())
      .filter(q => q.gameId === gameId)
      .sort((a, b) => a.order - b.order);
    
    // Randomize question order
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    
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
    return this.questions.get(id);
  }

  async createPlayerAnswer(insertAnswer: InsertPlayerAnswer): Promise<PlayerAnswer> {
    const id = randomUUID();
    
    // Calculate points based on correctness and speed
    let points = 0;
    if (insertAnswer.isCorrect) {
      // Base points for correct answer: 1000
      // Bonus points for speed: max 500 points (decreases with time)
      const basePoints = 1000;
      const speedBonus = Math.max(0, 500 - (insertAnswer.timeSpent * 25));
      points = Math.round(basePoints + speedBonus);
    }

    const playerAnswer: PlayerAnswer = {
      ...insertAnswer,
      id,
      points,
    };
    this.playerAnswers.set(id, playerAnswer);
    return playerAnswer;
  }

  async getPlayerAnswers(playerId: string): Promise<PlayerAnswer[]> {
    return Array.from(this.playerAnswers.values())
      .filter(answer => answer.playerId === playerId);
  }
}

export const storage = new MemStorage();
