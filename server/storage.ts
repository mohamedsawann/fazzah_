import { type Game, type Player, type Question, type GameQuestion, type PlayerAnswer, type InsertGame, type InsertPlayer, type InsertQuestion, type InsertPlayerAnswer } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Games
  createGame(game: InsertGame): Promise<Game>;
  getGameByCode(code: string): Promise<Game | undefined>;
  getGame(id: string): Promise<Game | undefined>;
  
  // Players
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByGame(gameId: string): Promise<Player[]>;
  updatePlayerScore(playerId: string, score: number, correctAnswers: number, totalAnswers: number, averageTime: number): Promise<void>;
  completePlayer(playerId: string): Promise<void>;
  
  // Questions
  getQuestionsByCategory(category: string, limit: number): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  
  // Game Questions
  createGameQuestion(gameId: string, questionId: string, order: number): Promise<GameQuestion>;
  getGameQuestions(gameId: string): Promise<(GameQuestion & { question: Question })[]>;
  
  // Player Answers
  createPlayerAnswer(answer: InsertPlayerAnswer): Promise<PlayerAnswer>;
  getPlayerAnswers(playerId: string): Promise<PlayerAnswer[]>;
}

export class MemStorage implements IStorage {
  private games: Map<string, Game>;
  private players: Map<string, Player>;
  private questions: Map<string, Question>;
  private gameQuestions: Map<string, GameQuestion>;
  private playerAnswers: Map<string, PlayerAnswer>;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.questions = new Map();
    this.gameQuestions = new Map();
    this.playerAnswers = new Map();
    
    // Initialize with sample questions
    this.initializeQuestions();
  }

  private initializeQuestions() {
    const sampleQuestions: Question[] = [
      {
        id: randomUUID(),
        text: "ما هي عاصمة المملكة العربية السعودية؟",
        options: ["الرياض", "جدة", "الدمام", "مكة المكرمة"],
        correctAnswer: 0,
        category: "ثقافة عامة",
        difficulty: "easy"
      },
      {
        id: randomUUID(),
        text: "كم عدد أيام السنة الميلادية؟",
        options: ["364", "365", "366", "367"],
        correctAnswer: 1,
        category: "ثقافة عامة",
        difficulty: "easy"
      },
      {
        id: randomUUID(),
        text: "من هو أول رئيس للولايات المتحدة الأمريكية؟",
        options: ["جورج واشنطن", "توماس جيفرسون", "أبراهام لنكولن", "جون آدامز"],
        correctAnswer: 0,
        category: "تاريخ",
        difficulty: "medium"
      },
      {
        id: randomUUID(),
        text: "ما هو أكبر كوكب في النظام الشمسي؟",
        options: ["زحل", "المشتري", "الأرض", "نبتون"],
        correctAnswer: 1,
        category: "علوم",
        difficulty: "easy"
      },
      {
        id: randomUUID(),
        text: "في أي عام تأسست المملكة العربية السعودية؟",
        options: ["1930", "1932", "1934", "1936"],
        correctAnswer: 1,
        category: "تاريخ",
        difficulty: "medium"
      },
      {
        id: randomUUID(),
        text: "كم عدد أهداف هاتريك في كرة القدم؟",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1,
        category: "رياضة",
        difficulty: "easy"
      },
      {
        id: randomUUID(),
        text: "ما هي أصغر قارة في العالم؟",
        options: ["أوروبا", "أستراليا", "أنتاركتيكا", "أمريكا الجنوبية"],
        correctAnswer: 1,
        category: "ثقافة عامة",
        difficulty: "medium"
      },
      {
        id: randomUUID(),
        text: "من كتب رواية 'مئة عام من العزلة'؟",
        options: ["غابرييل غارسيا ماركيز", "إيزابيل الليندي", "خورخي لويس بورخيس", "ماريو فارغاس يوسا"],
        correctAnswer: 0,
        category: "ثقافة عامة",
        difficulty: "hard"
      },
      {
        id: randomUUID(),
        text: "ما هو العنصر الكيميائي الذي رمزه Au؟",
        options: ["الفضة", "الذهب", "النحاس", "البلاتين"],
        correctAnswer: 1,
        category: "علوم",
        difficulty: "medium"
      },
      {
        id: randomUUID(),
        text: "في أي مدينة تقع جامعة الأزهر؟",
        options: ["القاهرة", "الإسكندرية", "الرياض", "دمشق"],
        correctAnswer: 0,
        category: "ثقافة عامة",
        difficulty: "easy"
      }
    ];

    sampleQuestions.forEach(question => {
      this.questions.set(question.id, question);
    });
  }

  private generateGameCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
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
    return game;
  }

  async getGameByCode(code: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(game => game.code === code);
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
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

  async getQuestionsByCategory(category: string, limit: number): Promise<Question[]> {
    const questions = Array.from(this.questions.values())
      .filter(q => q.category === category || category === "all");
    
    // Shuffle and return limited number
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createGameQuestion(gameId: string, questionId: string, order: number): Promise<GameQuestion> {
    const id = randomUUID();
    const gameQuestion: GameQuestion = {
      id,
      gameId,
      questionId,
      order,
    };
    this.gameQuestions.set(id, gameQuestion);
    return gameQuestion;
  }

  async getGameQuestions(gameId: string): Promise<(GameQuestion & { question: Question })[]> {
    const gameQuestions = Array.from(this.gameQuestions.values())
      .filter(gq => gq.gameId === gameId)
      .sort((a, b) => a.order - b.order);

    return gameQuestions.map(gq => ({
      ...gq,
      question: this.questions.get(gq.questionId)!
    }));
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
