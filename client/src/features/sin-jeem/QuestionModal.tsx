import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Timer } from "./Timer";
import type { SinJeemQuestion } from "./types";

interface QuestionModalProps {
  open: boolean;
  question: SinJeemQuestion | null;
  points: number;
  isDouble: boolean;
  team1Name: string;
  team2Name: string;
  timerRunning: boolean;
  answerRevealed: boolean;
  onRevealAnswer: () => void;
  onAwardTeam1: () => void;
  onAwardTeam2: () => void;
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
  timerRunning,
  answerRevealed,
  onRevealAnswer,
  onAwardTeam1,
  onAwardTeam2,
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isDouble && (
              <span className="text-amber-500 font-bold mx-2">
                ⭐ {isArabic ? "مضاعفة النقاط" : "Double Points"} ⭐
              </span>
            )}
            {!isDouble && (
              <span>
                {displayPoints} {isArabic ? "نقطة" : "pts"}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-lg font-medium leading-relaxed">{questionText}</p>
          {question?.image_url && (
            <img
              src={question.image_url}
              alt=""
              className="w-full rounded-lg object-contain max-h-48"
            />
          )}
          {question?.audio_url && (
            <audio src={question.audio_url} controls className="w-full" />
          )}
          {question?.video_url && (
            <video
              src={question.video_url}
              controls
              className="w-full rounded-lg"
            />
          )}
          <Timer
            running={timerRunning}
            onExpire={onTimerExpire}
            playTick={onPlayTick}
            playBuzzer={onPlayBuzzer}
          />
          {!answerRevealed ? (
            <Button
              size="lg"
              className="w-full text-lg"
              onClick={onRevealAnswer}
            >
              {isArabic ? "كشف الإجابة" : "Reveal Answer"}
            </Button>
          ) : (
            <>
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4 border-2 border-green-500/50">
                <p className="text-sm opacity-80 mb-1">
                  {isArabic ? "الإجابة:" : "Answer:"}
                </p>
                <p className="text-xl font-bold text-green-700 dark:text-green-400">
                  {answerText}
                </p>
              </div>
              <p className="text-sm font-bold text-center">
                +{displayPoints} {isArabic ? "للفريق الأول" : "Team 1"} / +
                {displayPoints} {isArabic ? "للفريق الثاني" : "Team 2"}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onAwardTeam1}
                >
                  +{displayPoints} {team1Name}
                </Button>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={onAwardTeam2}
                >
                  +{displayPoints} {team2Name}
                </Button>
                <Button variant="outline" onClick={onNoPoints}>
                  {isArabic ? "لا نقاط" : "No Points"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
