import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Plus, Pencil, Trash2, X, Check, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchSinJeemCategories,
  fetchQuestionsByCategory,
  insertCategory,
  updateCategory,
  deleteCategory,
  insertQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionPayload,
} from "@/features/sin-jeem/api";
import type { SinJeemCategory, SinJeemQuestion, SinJeemDifficulty } from "@/features/sin-jeem/types";

// ── Simple password gate ──────────────────────────────────────────────────
const ADMIN_PASSWORD = "fazzah1234"; // Change this to whatever you want

const DIFF_COLORS: Record<number, string> = {
  200: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  400: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  600: "bg-rose-500/20 text-rose-300 border-rose-500/40",
};

const DIFF_LABEL: Record<number, string> = { 200: "سهل", 400: "متوسط", 600: "صعب" };

type View =
  | { kind: "login" }
  | { kind: "categories" }
  | { kind: "category-questions"; category: SinJeemCategory }
  | { kind: "category-form"; editing?: SinJeemCategory }
  | { kind: "question-form"; category: SinJeemCategory; editing?: SinJeemQuestion };

// ── Login Screen ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("sj_admin", "1");
      onLogin();
    } else {
      setError(true);
      setPw("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="text-5xl">🔐</div>
          <h1 className="text-2xl font-black text-white">لوحة الإدارة</h1>
          <p className="text-slate-400 text-sm">Sin Jeem Admin</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            placeholder="كلمة المرور"
            autoFocus
            className={cn(
              "w-full bg-slate-800 border-2 rounded-xl px-4 py-3 text-white text-center text-lg focus:outline-none transition",
              error ? "border-red-500 shake" : "border-slate-600 focus:border-amber-400"
            )}
          />
          {error && (
            <p className="text-red-400 text-sm text-center">كلمة المرور غير صحيحة</p>
          )}
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl text-lg transition active:scale-95"
          >
            دخول
          </button>
        </form>
        <div className="text-center">
          <Link href="/">
            <span className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer">
              ← رجوع للرئيسية
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Category Form ─────────────────────────────────────────────────────────
function CategoryForm({
  editing,
  onBack,
  onSaved,
}: {
  editing?: SinJeemCategory;
  onBack: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [nameAr, setNameAr] = useState(editing?.name_ar ?? "");
  const [nameEn, setNameEn] = useState(editing?.name_en ?? "");
  const [icon, setIcon] = useState(editing?.icon ?? "");

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateCategory(editing.id, { name_ar: nameAr.trim(), name_en: nameEn.trim(), icon: icon.trim() || undefined })
        : insertCategory({ name_ar: nameAr.trim(), name_en: nameEn.trim(), icon: icon.trim() || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sin-jeem-categories"] });
      onSaved();
    },
  });

  const canSave = nameAr.trim().length > 0 && nameEn.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
          <ArrowRight className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-white">
          {editing ? "تعديل الفئة" : "فئة جديدة"}
        </h2>
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-amber-300 text-sm font-semibold">اسم الفئة (عربي) *</label>
          <input
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: كرة القدم"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-right focus:outline-none focus:border-amber-400 transition"
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <label className="text-amber-300 text-sm font-semibold">Category Name (English) *</label>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Football"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <label className="text-amber-300 text-sm font-semibold">أيقونة (إيموجي)</label>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="⚽"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-center text-2xl focus:outline-none focus:border-amber-400 transition"
          />
          {icon && <div className="text-center text-6xl">{icon}</div>}
        </div>
      </div>

      <button
        disabled={!canSave || saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black py-4 rounded-2xl text-lg transition active:scale-95"
      >
        {saveMutation.isPending ? "جاري الحفظ…" : editing ? "حفظ التغييرات ✓" : "إضافة الفئة +"}
      </button>
      {saveMutation.isError && (
        <p className="text-red-400 text-sm text-center">
          {(saveMutation.error as Error).message}
        </p>
      )}
    </div>
  );
}

// ── Question Form ─────────────────────────────────────────────────────────
function QuestionForm({
  category,
  editing,
  onBack,
  onSaved,
}: {
  category: SinJeemCategory;
  editing?: SinJeemQuestion;
  onBack: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [difficulty, setDifficulty] = useState<SinJeemDifficulty>(editing?.difficulty ?? 200);
  const [qAr, setQAr] = useState(editing?.question_ar ?? "");
  const [qEn, setQEn] = useState(editing?.question_en ?? "");
  const [aAr, setAAr] = useState(editing?.answer_ar ?? "");
  const [aEn, setAEn] = useState(editing?.answer_en ?? "");
  const [imgUrl, setImgUrl] = useState(editing?.image_url ?? "");
  const [audioUrl, setAudioUrl] = useState(editing?.audio_url ?? "");
  const [videoUrl, setVideoUrl] = useState(editing?.video_url ?? "");

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: Partial<QuestionPayload> = {
        category_id: category.id,
        difficulty,
        question_ar: qAr.trim(),
        question_en: qEn.trim() || null,
        answer_ar: aAr.trim(),
        answer_en: aEn.trim() || null,
        image_url: imgUrl.trim() || null,
        audio_url: audioUrl.trim() || null,
        video_url: videoUrl.trim() || null,
      };
      return editing
        ? updateQuestion(editing.id, payload)
        : insertQuestion(payload as QuestionPayload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-questions", category.id] });
      onSaved();
    },
  });

  const canSave = qAr.trim().length > 0 && aAr.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-white">
            {editing ? "تعديل السؤال" : "سؤال جديد"}
          </h2>
          <p className="text-slate-400 text-xs">{category.icon} {category.name_ar}</p>
        </div>
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 space-y-4">
        {/* Difficulty picker */}
        <div className="space-y-2">
          <label className="text-amber-300 text-sm font-semibold">مستوى الصعوبة *</label>
          <div className="grid grid-cols-3 gap-2">
            {([200, 400, 600] as SinJeemDifficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "py-3 rounded-xl font-black text-lg border-2 transition",
                  difficulty === d
                    ? DIFF_COLORS[d]
                    : "border-slate-600 text-slate-500 hover:border-slate-400"
                )}
              >
                {d} — {DIFF_LABEL[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Question AR */}
        <div className="space-y-2">
          <label className="text-amber-300 text-sm font-semibold">السؤال (عربي) *</label>
          <textarea
            value={qAr}
            onChange={(e) => setQAr(e.target.value)}
            placeholder="نص السؤال بالعربي"
            rows={3}
            dir="rtl"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-right resize-none focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        {/* Answer AR */}
        <div className="space-y-2">
          <label className="text-amber-300 text-sm font-semibold">الإجابة (عربي) *</label>
          <input
            value={aAr}
            onChange={(e) => setAAr(e.target.value)}
            placeholder="الإجابة الصحيحة"
            dir="rtl"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-right focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        {/* Question EN */}
        <div className="space-y-2">
          <label className="text-slate-400 text-sm">Question (English) — optional</label>
          <textarea
            value={qEn}
            onChange={(e) => setQEn(e.target.value)}
            placeholder="Question in English"
            rows={2}
            dir="ltr"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-slate-400 transition"
          />
        </div>

        {/* Answer EN */}
        <div className="space-y-2">
          <label className="text-slate-400 text-sm">Answer (English) — optional</label>
          <input
            value={aEn}
            onChange={(e) => setAEn(e.target.value)}
            placeholder="English answer"
            dir="ltr"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-slate-400 transition"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className="text-slate-400 text-sm">رابط الصورة — image URL (optional)</label>
          <input
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="https://..."
            dir="ltr"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-slate-400 transition"
          />
          {imgUrl && (
            <img src={imgUrl} alt="" className="rounded-xl max-h-40 object-contain border border-slate-600" />
          )}
        </div>

        {/* Audio / Video */}
        <div className="grid grid-cols-1 gap-3">
          <input
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="Audio URL (optional)"
            dir="ltr"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-slate-400 transition"
          />
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Video URL (optional)"
            dir="ltr"
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-slate-400 transition"
          />
        </div>
      </div>

      <button
        disabled={!canSave || saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black py-4 rounded-2xl text-lg transition active:scale-95"
      >
        {saveMutation.isPending ? "جاري الحفظ…" : editing ? "حفظ التغييرات ✓" : "إضافة السؤال +"}
      </button>
      {saveMutation.isError && (
        <p className="text-red-400 text-sm text-center">
          {(saveMutation.error as Error).message}
        </p>
      )}
    </div>
  );
}

// ── Category Questions Drill-Down ─────────────────────────────────────────
function CategoryQuestions({
  category,
  onBack,
  onAddQuestion,
  onEditQuestion,
}: {
  category: SinJeemCategory;
  onBack: () => void;
  onAddQuestion: () => void;
  onEditQuestion: (q: SinJeemQuestion) => void;
}) {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["admin-questions", category.id],
    queryFn: () => fetchQuestionsByCategory(category.id),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-questions", category.id] });
      setConfirmDelete(null);
    },
  });

  const grouped: Record<number, SinJeemQuestion[]> = { 200: [], 400: [], 600: [] };
  questions.forEach((q) => {
    if (grouped[q.difficulty]) grouped[q.difficulty].push(q);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition">
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-3xl">{category.icon || "📚"}</span>
              {category.name_ar}
            </h2>
            <p className="text-slate-400 text-xs">{category.name_en} · {questions.length} سؤال</p>
          </div>
        </div>
        <button
          onClick={onAddQuestion}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl transition active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          سؤال جديد
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-slate-800/40 h-16 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && questions.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <div className="text-5xl">📭</div>
          <p className="text-slate-400">لا توجد أسئلة في هذه الفئة</p>
          <button onClick={onAddQuestion} className="text-amber-400 hover:text-amber-300 font-bold text-sm">
            + أضف أول سؤال
          </button>
        </div>
      )}

      {/* Questions grouped by difficulty */}
      {([200, 400, 600] as SinJeemDifficulty[]).map((diff) => {
        const qs = grouped[diff];
        if (!qs || qs.length === 0) return null;
        return (
          <div key={diff} className="space-y-2">
            <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold border", DIFF_COLORS[diff])}>
              {diff} نقطة — {DIFF_LABEL[diff]}
            </div>
            <div className="space-y-2">
              {qs.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex gap-3 items-start"
                >
                  {q.image_url && (
                    <img src={q.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-slate-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-snug" dir="rtl">
                      {q.question_ar}
                    </p>
                    <p className="text-emerald-400 text-xs mt-1 font-bold" dir="rtl">
                      ✓ {q.answer_ar}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEditQuestion(q)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {confirmDelete === q.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(q.id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(q.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Categories Dashboard ──────────────────────────────────────────────────
function CategoriesDashboard({
  onAddCategory,
  onEditCategory,
  onOpenCategory,
  onLogout,
}: {
  onAddCategory: () => void;
  onEditCategory: (c: SinJeemCategory) => void;
  onOpenCategory: (c: SinJeemCategory) => void;
  onLogout: () => void;
}) {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["sin-jeem-categories"],
    queryFn: fetchSinJeemCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sin-jeem-categories"] });
      setConfirmDelete(null);
    },
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">لوحة الإدارة</h1>
          <p className="text-slate-400 text-sm">Sin Jeem Admin Panel</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddCategory}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            فئة جديدة
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-800/40 h-36 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="text-6xl">📂</div>
          <p className="text-slate-400">لا توجد فئات بعد</p>
          <button onClick={onAddCategory} className="text-amber-400 hover:text-amber-300 font-bold">
            + أضف أول فئة
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-slate-500 transition group overflow-hidden"
          >
            {/* Main clickable area */}
            <button
              onClick={() => onOpenCategory(cat)}
              className="w-full p-4 flex flex-col items-center gap-2 text-center"
            >
              <span className="text-5xl">{cat.icon || "📚"}</span>
              <span className="text-white font-bold text-sm leading-tight">{cat.name_ar}</span>
              <span className="text-slate-500 text-xs">{cat.name_en}</span>
            </button>

            {/* Action buttons overlay */}
            <div className="absolute top-2 end-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={(e) => { e.stopPropagation(); onEditCategory(cat); }}
                className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {confirmDelete === cat.id ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(cat.id); }}
                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                    className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(cat.id); }}
                  className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 text-center">
        <Link href="/">
          <span className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer flex items-center gap-1 justify-center">
            <ArrowRight className="w-4 h-4" /> رجوع للرئيسية
          </span>
        </Link>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────
export default function AdminSinJeem() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("sj_admin") === "1"
  );
  const [view, setView] = useState<View>({ kind: "categories" });

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  const logout = () => {
    sessionStorage.removeItem("sj_admin");
    setAuthed(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-4" dir="rtl">
      <div className="max-w-2xl mx-auto py-4">
        {view.kind === "categories" && (
          <CategoriesDashboard
            onAddCategory={() => setView({ kind: "category-form" })}
            onEditCategory={(c) => setView({ kind: "category-form", editing: c })}
            onOpenCategory={(c) => setView({ kind: "category-questions", category: c })}
            onLogout={logout}
          />
        )}

        {view.kind === "category-form" && (
          <CategoryForm
            editing={view.editing}
            onBack={() => setView({ kind: "categories" })}
            onSaved={() => setView({ kind: "categories" })}
          />
        )}

        {view.kind === "category-questions" && (
          <CategoryQuestions
            category={view.category}
            onBack={() => setView({ kind: "categories" })}
            onAddQuestion={() =>
              setView({ kind: "question-form", category: view.category })
            }
            onEditQuestion={(q) =>
              setView({ kind: "question-form", category: view.category, editing: q })
            }
          />
        )}

        {view.kind === "question-form" && (
          <QuestionForm
            category={view.category}
            editing={view.editing}
            onBack={() =>
              setView({ kind: "category-questions", category: view.category })
            }
            onSaved={() =>
              setView({ kind: "category-questions", category: view.category })
            }
          />
        )}
      </div>
    </div>
  );
}
