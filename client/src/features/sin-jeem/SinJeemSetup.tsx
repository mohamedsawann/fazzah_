import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { fetchSinJeemCategories } from "./api";
import type { SinJeemCategory } from "./types";
import { cn } from "@/lib/utils";

const MIN_CATEGORIES = 4;
const MAX_CATEGORIES = 6;
// Coin faces used during spin (not displayed — we use CSS animation instead)
const COIN_FACES = ["🪙", "⭕", "🪙", "⭕", "🪙", "⭕"];

interface SinJeemSetupProps {
  onStart: (team1Name: string, team2Name: string, categoryIds: string[]) => void;
}

export function SinJeemSetup({ onStart }: SinJeemSetupProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;

  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<string | null>(null);
  const [coinFace, setCoinFace] = useState("🪙");
  const flipIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sin-jeem-categories"],
    queryFn: fetchSinJeemCategories,
  });

  const flipCoin = () => {
    const t1 = team1Name.trim();
    const t2 = team2Name.trim();
    if (!t1 || !t2) return;
    setCoinFlipping(true);
    setCoinResult(null);
    setCoinFace("🪙");
    if (flipIntervalRef.current) clearTimeout(flipIntervalRef.current);
    // Let the CSS animation play for 1.5s, then show result
    flipIntervalRef.current = setTimeout(() => {
      const winner = Math.random() < 0.5 ? t1 : t2;
      setCoinFace(winner === t1 ? "🟡" : "⚪");
      setCoinResult(winner);
      setCoinFlipping(false);
    }, 1500);
  };

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_CATEGORIES) {
        next.add(id);
      }
      return next;
    });
  };

  const canStart =
    team1Name.trim().length > 0 &&
    team2Name.trim().length > 0 &&
    selectedIds.size >= MIN_CATEGORIES &&
    selectedIds.size <= MAX_CATEGORIES;

  const handleStart = () => {
    if (!canStart) return;
    onStart(team1Name.trim(), team2Name.trim(), Array.from(selectedIds));
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-10 px-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-2xl space-y-8">

        {/* ── Title ── */}
        <div className="text-center space-y-1">
          <h1 className="text-5xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
            سين جيم
          </h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Sin Jeem Game</p>
        </div>

        {/* ── Team names ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-amber-300 font-bold text-sm">
              {isArabic ? "الفريق الأول" : "Team 1"}
            </label>
            <input
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              placeholder={isArabic ? "اسم الفريق الأول" : "Team 1 Name"}
              className="w-full rounded-xl bg-slate-800 border-2 border-amber-500/30 focus:border-amber-400 focus:outline-none text-white text-center text-lg font-bold py-3 px-4 placeholder:text-slate-500 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-cyan-300 font-bold text-sm">
              {isArabic ? "الفريق الثاني" : "Team 2"}
            </label>
            <input
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              placeholder={isArabic ? "اسم الفريق الثاني" : "Team 2 Name"}
              className="w-full rounded-xl bg-slate-800 border-2 border-cyan-500/30 focus:border-cyan-400 focus:outline-none text-white text-center text-lg font-bold py-3 px-4 placeholder:text-slate-500 transition"
            />
          </div>
        </div>

        {/* ── Coin flip ── */}
        {team1Name.trim() && team2Name.trim() && (
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 flex flex-col items-center gap-4 text-center">
            {/* CSS keyframe for realistic Y-axis coin spin */}
            <style>{`
              @keyframes coinFlipY {
                0%   { transform: perspective(300px) rotateY(0deg); }
                100% { transform: perspective(300px) rotateY(1080deg); }
              }
              .coin-flip-anim {
                animation: coinFlipY 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              }
            `}</style>

            <p className="text-slate-400 text-sm">
              {isArabic ? "اقلب العملة لتحديد من يبدأ" : "Flip the coin to decide who goes first"}
            </p>

            <span
              key={coinFlipping ? "flipping" : coinResult ?? "idle"}
              className={cn("text-7xl select-none inline-block", coinFlipping && "coin-flip-anim")}
            >
              {coinFace}
            </span>

            <button
              onClick={flipCoin}
              disabled={coinFlipping}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-black py-3 px-8 rounded-2xl text-lg shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              {coinFlipping
                ? isArabic ? "جارٍ القلب…" : "Flipping…"
                : isArabic ? "🪙 اقلب العملة" : "🪙 Flip Coin"}
            </button>

            {coinResult && !coinFlipping && (
              <div className="text-2xl font-black text-amber-400 animate-bounce mt-1">
                🏆 {isArabic ? "يبدأ أولاً:" : "Goes first:"} {coinResult}
              </div>
            )}
          </div>
        )}

        {/* ── Category selection ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-lg">
              {isArabic ? "اختر الفئات" : "Choose Categories"}
            </span>
            <span
              className={cn(
                "font-black text-lg tabular-nums",
                selectedIds.size >= MIN_CATEGORIES ? "text-emerald-400" : "text-slate-400"
              )}
            >
              {selectedIds.size}
              <span className="text-slate-500 font-normal text-sm">
                /{MAX_CATEGORIES}
              </span>
            </span>
          </div>

          {isLoading && (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-slate-800/60 border border-slate-700 h-[110px] animate-pulse"
                />
              ))}
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">
              {isArabic ? "خطأ في تحميل الفئات" : "Failed to load categories"}
            </p>
          )}

          {!isLoading && categories.length === 0 && !error && (
            <p className="text-slate-500 text-sm text-center py-4">
              {isArabic
                ? "لا توجد فئات — أضفها من /admin/sinjeem"
                : "No categories yet — add them at /admin/sinjeem"}
            </p>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {categories.map((c: SinJeemCategory) => {
              const selected = selectedIds.has(c.id);
              const disabled = !selected && selectedIds.size >= MAX_CATEGORIES;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !disabled && toggleCategory(c.id)}
                  disabled={disabled}
                  className={cn(
                    "relative rounded-2xl p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 min-h-[110px] border-2",
                    selected
                      ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.03]"
                      : disabled
                        ? "bg-slate-800/30 border-slate-700/30 opacity-40 cursor-not-allowed"
                        : "bg-slate-800/60 border-slate-700 hover:border-amber-500/50 hover:bg-slate-700/60 cursor-pointer"
                  )}
                >
                  {selected && (
                    <span className="absolute top-2 end-2 bg-amber-400 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                  )}
                  <span className="text-4xl leading-none">{c.icon || "📚"}</span>
                  <span
                    className={cn(
                      "text-xs font-bold text-center leading-tight line-clamp-2",
                      selected ? "text-amber-300" : "text-slate-300"
                    )}
                  >
                    {isArabic ? c.name_ar : c.name_en}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedIds.size < MIN_CATEGORIES && selectedIds.size > 0 && (
            <p className="text-amber-400 text-xs text-center">
              {isArabic
                ? `اختر ${MIN_CATEGORIES - selectedIds.size} فئة أخرى على الأقل`
                : `Select ${MIN_CATEGORIES - selectedIds.size} more categor${MIN_CATEGORIES - selectedIds.size === 1 ? "y" : "ies"}`}
            </p>
          )}
        </div>

        {/* ── Start button ── */}
        <button
          disabled={!canStart}
          onClick={handleStart}
          className={cn(
            "w-full text-xl font-black py-5 rounded-2xl shadow-xl transition-all duration-200",
            canStart
              ? "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black shadow-amber-500/30 active:scale-[0.98]"
              : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
          )}
        >
          {isArabic ? "ابدأ اللعبة 🎮" : "Start Game 🎮"}
        </button>
      </div>
    </div>
  );
}
