import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  Game,
  Player,
  Question,
  PlayerAnswer,
  SiteStats,
  InsertGame,
  InsertPlayer,
  InsertQuestion,
  InsertPlayerAnswer,
} from "@shared/schema";

export interface IStorage {
  createGame(game: InsertGame, questions: InsertQuestion[]): Promise<Game>;
  getGameByCode(code: string): Promise<Game | undefined>;
  getGame(id: string): Promise<Game | undefined>;
  getAllGames(): Promise<Game[]>;
  findExistingPlayer(name: string, phone: string, gameId: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByGame(gameId: string): Promise<Player[]>;
  getAllPlayers(): Promise<Player[]>;
  getWinnersCount(): Promise<number>;
  updatePlayerScore(
    playerId: string,
    score: number,
    correctAnswers: number,
    totalAnswers: number,
    averageTime: number
  ): Promise<void>;
  completePlayer(playerId: string): Promise<void>;
  getGameQuestions(gameId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createPlayerAnswer(answer: InsertPlayerAnswer): Promise<PlayerAnswer>;
  getPlayerAnswers(playerId: string): Promise<PlayerAnswer[]>;
  incrementVisitors(): Promise<number>;
  getVisitorCount(): Promise<number>;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. Get them from Supabase Dashboard → Settings → API."
  );
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Supabase returns snake_case; our app uses camelCase. Map row from DB shape to app shape.
function rowToGame(row: Record<string, unknown>): Game {
  return {
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    createdAt: row.created_at as string,
    isActive: row.is_active as boolean,
  };
}

function rowToPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    gameId: row.game_id as string,
    score: row.score as number,
    correctAnswers: row.correct_answers as number,
    totalAnswers: row.total_answers as number,
    averageTime: row.average_time as number,
    completedAt: (row.completed_at as string | null) ?? null,
  };
}

function rowToQuestion(row: Record<string, unknown>): Question {
  return {
    id: row.id as string,
    gameId: row.game_id as string,
    text: row.text as string,
    options: row.options as string[],
    correctAnswer: row.correct_answer as number,
    order: row.order as number,
  };
}

function rowToPlayerAnswer(row: Record<string, unknown>): PlayerAnswer {
  return {
    id: row.id as string,
    playerId: row.player_id as string,
    questionId: row.question_id as string,
    selectedAnswer: row.selected_answer as number,
    isCorrect: row.is_correct as boolean,
    timeSpent: row.time_spent as number,
    points: row.points as number,
  };
}

function rowToSiteStats(row: Record<string, unknown>): SiteStats {
  return {
    id: row.id as string,
    visitors: row.visitors as number,
    updatedAt: row.updated_at as string,
  };
}

export class SupabaseStorage implements IStorage {
  constructor() {
    this.startCleanupJob();
  }

  private generateGameCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async generateUniqueGameCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const code = this.generateGameCode();
      const game = await this.getGameByCode(code);
      if (!game) return code;
      attempts++;
    }
    return this.generateGameCode() + Date.now().toString().slice(-2);
  }

  private startCleanupJob(): void {
    setInterval(() => {
      this.cleanupOldGames().catch((err) => console.error("Cleanup job error:", err));
    }, 60 * 60 * 1000);
    this.cleanupOldGames().catch(console.error);
  }

  private async cleanupOldGames(): Promise<void> {
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const { data: oldGames, error: listError } = await supabase
      .from("games")
      .select("id")
      .lt("created_at", seventyTwoHoursAgo);

    if (listError || !oldGames?.length) {
      if (listError) console.error("Cleanup list error:", listError);
      return;
    }

    const gameIds = oldGames.map((g) => g.id);

    for (const gameId of gameIds) {
      const { data: gamePlayers } = await supabase.from("players").select("id").eq("game_id", gameId);
      const playerIds = (gamePlayers ?? []).map((p) => p.id);

      for (const playerId of playerIds) {
        await supabase.from("player_answers").delete().eq("player_id", playerId);
      }
      await supabase.from("players").delete().eq("game_id", gameId);
      await supabase.from("questions").delete().eq("game_id", gameId);
      await supabase.from("games").delete().eq("id", gameId);
    }

    console.log(`Cleaned up ${gameIds.length} games older than 72 hours`);
  }

  async createGame(insertGame: InsertGame, questionsList: InsertQuestion[]): Promise<Game> {
    const code = await this.generateUniqueGameCode();
    const { data: gameRow, error: gameError } = await supabase
      .from("games")
      .insert({
        code,
        name: insertGame.name,
      })
      .select()
      .single();

    if (gameError || !gameRow) throw new Error(gameError?.message ?? "Failed to create game");
    const game = rowToGame(gameRow);

    if (questionsList.length > 0) {
      const rows = questionsList.map((q, i) => ({
        game_id: game.id,
        text: q.text,
        options: q.options,
        correct_answer: q.correctAnswer,
        order: i + 1,
      }));
      await supabase.from("questions").insert(rows);
    }

    return game;
  }

  async getGameByCode(code: string): Promise<Game | undefined> {
    const { data, error } = await supabase.from("games").select("*").eq("code", code).limit(1).maybeSingle();
    if (error || !data) return undefined;
    return rowToGame(data);
  }

  async getGame(id: string): Promise<Game | undefined> {
    const { data, error } = await supabase.from("games").select("*").eq("id", id).maybeSingle();
    if (error || !data) return undefined;
    return rowToGame(data);
  }

  async getAllGames(): Promise<Game[]> {
    const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map(rowToGame);
  }

  async findExistingPlayer(name: string, phone: string, gameId: string): Promise<Player | undefined> {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("name", name)
      .eq("phone", phone)
      .eq("game_id", gameId)
      .limit(1)
      .maybeSingle();
    if (error || !data) return undefined;
    return rowToPlayer(data);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const { data, error } = await supabase
      .from("players")
      .insert({
        name: insertPlayer.name,
        phone: insertPlayer.phone,
        game_id: insertPlayer.gameId,
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create player");
    return rowToPlayer(data);
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const { data, error } = await supabase.from("players").select("*").eq("id", id).maybeSingle();
    if (error || !data) return undefined;
    return rowToPlayer(data);
  }

  async getPlayersByGame(gameId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("game_id", gameId)
      .order("score", { ascending: false });
    if (error) return [];
    return (data ?? []).map(rowToPlayer);
  }

  async getAllPlayers(): Promise<Player[]> {
    const { data, error } = await supabase.from("players").select("*");
    if (error) return [];
    return (data ?? []).map(rowToPlayer);
  }

  async getWinnersCount(): Promise<number> {
    const allGames = await this.getAllGames();
    let count = 0;
    for (const game of allGames) {
      const list = await this.getPlayersByGame(game.id);
      if (list.some((p) => p.completedAt != null)) count += 1;
    }
    return count;
  }

  async updatePlayerScore(
    playerId: string,
    score: number,
    correctAnswers: number,
    totalAnswers: number,
    averageTime: number
  ): Promise<void> {
    await supabase
      .from("players")
      .update({
        score,
        correct_answers: correctAnswers,
        total_answers: totalAnswers,
        average_time: averageTime,
      })
      .eq("id", playerId);
  }

  async completePlayer(playerId: string): Promise<void> {
    await supabase.from("players").update({ completed_at: new Date().toISOString() }).eq("id", playerId);
  }

  async getGameQuestions(gameId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("game_id", gameId)
      .order("order", { ascending: true });
    if (error) return [];

    const list = (data ?? []).map(rowToQuestion);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return shuffled.map((q) => {
      const optionsWithCorrect = q.options.map((opt, i) => ({ opt, correct: i === q.correctAnswer }));
      const shuffledOpts = [...optionsWithCorrect].sort(() => Math.random() - 0.5);
      const newCorrect = shuffledOpts.findIndex((o) => o.correct);
      return {
        ...q,
        options: shuffledOpts.map((o) => o.opt),
        correctAnswer: newCorrect >= 0 ? newCorrect : 0,
      };
    });
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const { data, error } = await supabase.from("questions").select("*").eq("id", id).maybeSingle();
    if (error || !data) return undefined;
    return rowToQuestion(data);
  }

  async createPlayerAnswer(insertAnswer: InsertPlayerAnswer): Promise<PlayerAnswer> {
    let points = 0;
    if (insertAnswer.isCorrect) {
      points = Math.round(1000 + Math.max(0, 500 - insertAnswer.timeSpent * 25));
    }
    const { data, error } = await supabase
      .from("player_answers")
      .insert({
        player_id: insertAnswer.playerId,
        question_id: insertAnswer.questionId,
        selected_answer: insertAnswer.selectedAnswer,
        is_correct: insertAnswer.isCorrect,
        time_spent: insertAnswer.timeSpent,
        points,
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create answer");
    return rowToPlayerAnswer(data);
  }

  async getPlayerAnswers(playerId: string): Promise<PlayerAnswer[]> {
    const { data, error } = await supabase.from("player_answers").select("*").eq("player_id", playerId);
    if (error) return [];
    return (data ?? []).map(rowToPlayerAnswer);
  }

  async incrementVisitors(): Promise<number> {
    const { data: existing } = await supabase.from("site_stats").select("visitors").eq("id", "main").maybeSingle();
    const next = (existing?.visitors ?? 0) + 1;
    await supabase
      .from("site_stats")
      .upsert({ id: "main", visitors: next, updated_at: new Date().toISOString() }, { onConflict: "id" });
    return next;
  }

  async getVisitorCount(): Promise<number> {
    const { data, error } = await supabase.from("site_stats").select("visitors").eq("id", "main").maybeSingle();
    if (error || !data) return 0;
    return data.visitors;
  }
}

export const storage = new SupabaseStorage();
