import { supabase } from "@/lib/supabase";
import type { SinJeemCategory, SinJeemQuestion, SinJeemDifficulty } from "./types";

// ── Read ──────────────────────────────────────────────────────────────────

export async function fetchSinJeemCategories(): Promise<SinJeemCategory[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("sin_jeem_categories")
    .select("*")
    .order("name_ar");
  if (error) throw error;
  return (data ?? []) as SinJeemCategory[];
}

export async function fetchSinJeemQuestionsByCategoryIds(
  categoryIds: string[]
): Promise<Record<string, Record<SinJeemDifficulty, SinJeemQuestion[]>>> {
  if (!supabase || categoryIds.length === 0) return {};
  const { data, error } = await supabase
    .from("sin_jeem_questions")
    .select("*")
    .in("category_id", categoryIds)
    .in("difficulty", [200, 400, 600]);
  if (error) throw error;
  const list = (data ?? []) as SinJeemQuestion[];
  const byCategory: Record<string, Record<SinJeemDifficulty, SinJeemQuestion[]>> = {};
  categoryIds.forEach((id) => {
    byCategory[id] = { 200: [], 400: [], 600: [] };
  });
  list.forEach((q) => {
    const d = q.difficulty as SinJeemDifficulty;
    if (byCategory[q.category_id] && byCategory[q.category_id][d]) {
      byCategory[q.category_id][d].push(q);
    }
  });
  return byCategory;
}

/** Fetch flat list of questions for a single category, ordered by difficulty */
export async function fetchQuestionsByCategory(categoryId: string): Promise<SinJeemQuestion[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("sin_jeem_questions")
    .select("*")
    .eq("category_id", categoryId)
    .order("difficulty")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as SinJeemQuestion[];
}

// ── Category mutations ────────────────────────────────────────────────────

export async function insertCategory(payload: {
  name_ar: string;
  name_en: string;
  icon?: string;
}): Promise<SinJeemCategory> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("sin_jeem_categories")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as SinJeemCategory;
}

export async function updateCategory(
  id: string,
  payload: { name_ar: string; name_en: string; icon?: string }
): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("sin_jeem_categories")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("sin_jeem_categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Question mutations ────────────────────────────────────────────────────

export interface QuestionPayload {
  category_id: string;
  difficulty: SinJeemDifficulty;
  question_ar: string;
  question_en?: string | null;
  answer_ar: string;
  answer_en?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
}

export async function insertQuestion(payload: QuestionPayload): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("sin_jeem_questions").insert(payload);
  if (error) throw error;
}

export async function updateQuestion(
  id: string,
  payload: Partial<QuestionPayload>
): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("sin_jeem_questions")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteQuestion(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("sin_jeem_questions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
