import { supabase } from "@/lib/supabase";
import type { SinJeemCategory, SinJeemQuestion, SinJeemDifficulty } from "./types";

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
