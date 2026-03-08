export type SinJeemDifficulty = 200 | 400 | 600;

export interface SinJeemCategory {
  id: string;
  name_ar: string;
  name_en: string;
  icon: string | null;
  created_at: string;
}

export interface SinJeemQuestion {
  id: string;
  category_id: string;
  difficulty: SinJeemDifficulty;
  question_ar: string;
  question_en: string | null;
  answer_ar: string;
  answer_en: string | null;
  image_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  created_at: string;
}

export interface TileState {
  questions: SinJeemQuestion[];
  isDouble: boolean;
  usedCount: number; // 0..questions.length; when usedCount >= questions.length tile is done
}

export type BoardState = Record<string, Record<SinJeemDifficulty, TileState>>;

export interface SinJeemGameState {
  team1Name: string;
  team2Name: string;
  categoryIds: string[];
  categories: SinJeemCategory[];
  board: BoardState;
  team1Score: number;
  team2Score: number;
  currentTile: { categoryId: string; difficulty: SinJeemDifficulty } | null;
  currentQuestion: SinJeemQuestion | null;
  questionRevealed: boolean;
  soundsEnabled: boolean;
}
