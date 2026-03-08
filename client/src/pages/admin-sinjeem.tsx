import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchSinJeemCategories } from "@/features/sin-jeem/api";
import type { SinJeemCategory } from "@/features/sin-jeem/types";

const DIFFICULTIES = [200, 400, 600] as const;

export default function AdminSinJeem() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState<number>(400);
  const [question_ar, setQuestionAr] = useState("");
  const [question_en, setQuestionEn] = useState("");
  const [answer_ar, setAnswerAr] = useState("");
  const [answer_en, setAnswerEn] = useState("");
  const [image_url, setImageUrl] = useState("");
  const [audio_url, setAudioUrl] = useState("");
  const [video_url, setVideoUrl] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["sin-jeem-categories"],
    queryFn: fetchSinJeemCategories,
  });

  const insertMutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase.from("sin_jeem_questions").insert({
        category_id: categoryId,
        difficulty,
        question_ar: question_ar.trim(),
        question_en: question_en.trim() || null,
        answer_ar: answer_ar.trim(),
        answer_en: answer_en.trim() || null,
        image_url: image_url.trim() || null,
        audio_url: audio_url.trim() || null,
        video_url: video_url.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sin-jeem-categories"] });
      setQuestionAr("");
      setQuestionEn("");
      setAnswerAr("");
      setAnswerEn("");
    },
  });

  const insertCategoryMutation = useMutation({
    mutationFn: async (names: { name_ar: string; name_en: string }) => {
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase
        .from("sin_jeem_categories")
        .insert(names);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sin-jeem-categories"] }),
  });

  const [newCatAr, setNewCatAr] = useState("");
  const [newCatEn, setNewCatEn] = useState("");

  return (
    <div
      className="min-h-screen bg-background p-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">
              <ArrowRight className="w-4 h-4 ml-2" />
              {t("common.back")}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {isArabic ? "إدارة أسئلة سين جيم" : "Sin Jeem Question Admin"}
          </h1>
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <h2 className="font-semibold">
            {isArabic ? "إضافة فئة" : "Add Category"}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder={
                isArabic ? "اسم الفئة (عربي)" : "Category name (Arabic)"
              }
              value={newCatAr}
              onChange={(e) => setNewCatAr(e.target.value)}
            />
            <Input
              placeholder={
                isArabic ? "اسم الفئة (إنجليزي)" : "Category name (English)"
              }
              value={newCatEn}
              onChange={(e) => setNewCatEn(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (newCatAr.trim() && newCatEn.trim()) {
                insertCategoryMutation.mutate({
                  name_ar: newCatAr.trim(),
                  name_en: newCatEn.trim(),
                });
                setNewCatAr("");
                setNewCatEn("");
              }
            }}
          >
            {isArabic ? "إضافة" : "Add"}
          </Button>
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <h2 className="font-semibold">
            {isArabic ? "إضافة سؤال" : "Add Question"}
          </h2>
          <div className="space-y-2">
            <Label>{isArabic ? "الفئة" : "Category"}</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={isArabic ? "اختر الفئة" : "Select category"}
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c: SinJeemCategory) => (
                  <SelectItem key={c.id} value={c.id}>
                    {isArabic ? c.name_ar : c.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{isArabic ? "الصعوبة (نقاط)" : "Difficulty (points)"}</Label>
            <Select
              value={String(difficulty)}
              onValueChange={(v) => setDifficulty(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{isArabic ? "السؤال (عربي)" : "Question (Arabic)"}</Label>
            <Textarea
              value={question_ar}
              onChange={(e) => setQuestionAr(e.target.value)}
              placeholder={isArabic ? "نص السؤال" : "Question text"}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>
              {isArabic ? "السؤال (إنجليزي)" : "Question (English)"}
            </Label>
            <Textarea
              value={question_en}
              onChange={(e) => setQuestionEn(e.target.value)}
              placeholder="Optional"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>{isArabic ? "الإجابة (عربي)" : "Answer (Arabic)"}</Label>
            <Input
              value={answer_ar}
              onChange={(e) => setAnswerAr(e.target.value)}
              placeholder={isArabic ? "الإجابة الصحيحة" : "Correct answer"}
            />
          </div>
          <div className="space-y-2">
            <Label>{isArabic ? "الإجابة (إنجليزي)" : "Answer (English)"}</Label>
            <Input
              value={answer_en}
              onChange={(e) => setAnswerEn(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Input
              value={image_url}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
            />
            <Input
              value={audio_url}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="Audio URL (optional)"
            />
            <Input
              value={video_url}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Video URL (optional)"
            />
          </div>
          <Button
            onClick={() => insertMutation.mutate()}
            disabled={
              !categoryId ||
              !question_ar.trim() ||
              !answer_ar.trim() ||
              insertMutation.isPending
            }
          >
            {insertMutation.isPending
              ? t("common.loading")
              : isArabic
                ? "إضافة السؤال"
                : "Add Question"}
          </Button>
          {insertMutation.isError && (
            <p className="text-sm text-destructive">
              {(insertMutation.error as Error).message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
