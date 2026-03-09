import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Timer } from "./Timer";
import type { SinJeemQuestion } from "./types";

interface QuestionModalProps {
  open: boolean;
  question: SinJeemQuestion | null;
  points: number;
  isDouble: boolean;
  team1Name: string;
  team2Name: string;
  currentTurn: "team1" | "team2";
  team1Avatar: string;
  team2Avatar: string;
  timerRunning: boolean;
  answerRevealed: boolean;
  onRevealAnswer: () => void;
  onAwardCurrentTeam: () => void;
  onStealByOtherTeam: () => void;
  onNoPoints: () => void;
  onTimerExpire: () => void;
  onPlayTick?: () => void;
  onPlayBuzzer?: () => void;
  onClose: () => void;
}

export function QuestionModal({
  open,
  question,
  points,
  isDouble,
  team1Name,
  team2Name,
  currentTurn,
  team1Avatar,
  team2Avatar,
  timerRunning,
  answerRevealed,
  onRevealAnswer,
  onAwardCurrentTeam,
  onStealByOtherTeam,
  onNoPoints,
  onTimerExpire,
  onPlayTick,
  onPlayBuzzer,
  onClose,
}: QuestionModalProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;
  const displayPoints = isDouble ? points * 2 : points;
  const questionText = isArabic
    ? (question?.question_ar ?? "")
    : (question?.question_en ?? question?.question_ar ?? "");
  const answerText = isArabic
    ? (question?.answer_ar ?? "")
    : (question?.answer_en ?? question?.answer_ar ?? "");
  const currentTeamName = currentTurn === "team1" ? team1Name : team2Name;
  const currentTeamAvatar = currentTurn === "team1" ? team1Avatar : team2Avatar;
  const otherTeamName = currentTurn === "team1" ? team2Name : team1Name;
  const otherTeamAvatar = currentTurn === "team1" ? team2Avatar : team1Avatar;

  // Prevent background scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !question) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ── Top bar: points badge + close ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition"
          aria-label="close"
        >
          ✕
        </button>

        {isDouble ? (
          <div className="flex-1 mx-4 text-center">
            <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-300 text-black rounded-full px-6 py-2 text-xl font-black shadow-xl shadow-amber-500/40 animate-pulse">
              ⭐&nbsp;نقاط مضاعفة&nbsp;·&nbsp;{displayPoints}&nbsp;نقطة&nbsp;⭐
            </span>
          </div>
        ) : (
          <div className="flex-1 mx-4 text-center">
            <span className="inline-block bg-blue-700 text-white rounded-full px-6 py-2 text-xl font-black shadow-xl shadow-blue-500/30">
              {displayPoints}&nbsp;{isArabic ? "نقطة" : "pts"}
            </span>
          </div>
        )}

        {/* spacer to centre badge */}
        <div className="w-10" />
      </div>

      {/* ── Timer ── */}
      <div className="flex justify-center flex-shrink-0 pb-2">
        <Timer
          running={timerRunning}
          onExpire={onTimerExpire}
          playTick={onPlayTick}
          playBuzzer={onPlayBuzzer}
        />
      </div>

      {/* ── Question text (scrollable if very long) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-16 overflow-y-auto">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-amber-300">
          <span>{currentTeamAvatar}</span>
          <span>
            {isArabic ? "الدور على" : "Turn:"} {currentTeamName}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center leading-relaxed max-w-3xl">
          {questionText}
        </p>

        {question.image_url && (
          <img
            src={question.image_url}
            alt=""
            className="mt-6 max-h-64 rounded-2xl object-contain shadow-2xl"
          />
        )}
        {question.audio_url && (
          <audio
            src={question.audio_url}
            controls
            className="mt-4 w-full max-w-sm"
          />
        )}
        {question.video_url && (
          <video
            src={question.video_url}
            controls
            className="mt-4 w-full max-w-lg rounded-2xl"
          />
        )}
      </div>

      {/* ── Answer / Award section ── */}
      <div className="flex-shrink-0 p-5 pb-8 max-w-3xl mx-auto w-full space-y-4">
        {!answerRevealed ? (
          <button
            onClick={onRevealAnswer}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xl font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all"
          >
            {isArabic ? "اكشف الإجابة 👁" : "Reveal Answer 👁"}
          </button>
        ) : (
          <>
            {/* Answer box */}
            <div className="rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 p-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-emerald-400 text-sm font-semibold mb-2">
                {isArabic ? "الإجابة" : "Answer"}
              </p>
              <p className="text-3xl font-black text-emerald-300 leading-snug">
                {answerText}
              </p>
            </div>

            {/* Award buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={onAwardCurrentTeam}
                className="flex flex-col items-center justify-center gap-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black py-4 rounded-2xl shadow-lg shadow-amber-500/30 transition-all"
              >
                <span className="text-xl">+{displayPoints}</span>
                <span className="text-xs truncate max-w-full px-2">
                  {currentTeamAvatar} {currentTeamName}
                </span>
              </button>
              <button
                onClick={onStealByOtherTeam}
                className="flex flex-col items-center justify-center gap-1 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-black py-4 rounded-2xl shadow-lg shadow-cyan-500/30 transition-all"
              >
                <span className="text-base">
                  {isArabic ? "سرقة 🎲" : "Steal 🎲"}
                </span>
                <span className="text-xs truncate max-w-full px-2">
                  {otherTeamAvatar} {otherTeamName}
                </span>
              </button>
              <button
                onClick={onNoPoints}
                className="flex flex-col items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-300 font-bold py-4 rounded-2xl transition-all"
              >
                <span className="text-xl">✗</span>
                <span className="text-xs">
                  {isArabic ? "لا نقاط" : "No Points"}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
