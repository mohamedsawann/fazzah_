import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { SinJeemSetup } from "./SinJeemSetup";
import { SinJeemBoard } from "./SinJeemBoard";
import { QuestionModal } from "./QuestionModal";
import { ScoreBoard } from "./ScoreBoard";
import { GameEnd } from "./GameEnd";
import {
  fetchSinJeemQuestionsByCategoryIds,
  fetchSinJeemCategories,
} from "./api";
import {
  buildBoardFromQuestions,
  getNextQuestion,
  isTileFullyUsed,
} from "./utils";
import type {
  SinJeemCategory,
  SinJeemGameState,
  BoardState,
  SinJeemDifficulty,
} from "./types";
import { playSound } from "@/lib/soundUtils";

type Phase = "setup" | "board" | "ended";
type TeamTurn = "team1" | "team2";

export function SinJeemPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;

  const [phase, setPhase] = useState<Phase>("setup");
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<SinJeemCategory[]>([]);
  const [board, setBoard] = useState<BoardState>({});
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<TeamTurn>("team1");
  const [team1Avatar] = useState("🦅");
  const [team2Avatar] = useState("🐆");
  const [team1PowerUps, setTeam1PowerUps] = useState({
    double: true,
    skip: true,
  });
  const [team2PowerUps, setTeam2PowerUps] = useState({
    double: true,
    skip: true,
  });
  const [pendingDoubleForTeam, setPendingDoubleForTeam] =
    useState<TeamTurn | null>(null);
  const [stealToast, setStealToast] = useState<{
    open: boolean;
    team: TeamTurn;
    multiplier: number;
    points: number;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] =
    useState<SinJeemGameState["currentQuestion"]>(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [currentIsDouble, setCurrentIsDouble] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);

  const switchTurn = useCallback(() => {
    setCurrentTurn((prev) => (prev === "team1" ? "team2" : "team1"));
  }, []);

  const handleStart = useCallback(
    async (t1: string, t2: string, ids: string[]) => {
      setTeam1Name(t1);
      setTeam2Name(t2);
      setCategoryIds(ids);
      const cats = await fetchSinJeemCategories();
      const selectedCats = cats.filter((c) => ids.includes(c.id));
      setCategories(selectedCats);
      const questionsByCategory = await fetchSinJeemQuestionsByCategoryIds(ids);
      const newBoard = buildBoardFromQuestions(ids, questionsByCategory);
      setBoard(newBoard);
      setTeam1Score(0);
      setTeam2Score(0);
      setCurrentTurn("team1");
      setTeam1PowerUps({ double: true, skip: true });
      setTeam2PowerUps({ double: true, skip: true });
      setPendingDoubleForTeam(null);
      setPhase("board");
      playSound.gameStart();
    },
    [],
  );

  const openTile = useCallback(
    (
      categoryId: string,
      difficulty: SinJeemDifficulty,
      forceDouble = false,
    ) => {
      const tile = board[categoryId]?.[difficulty];
      if (!tile || isTileFullyUsed(tile)) return;
      const q = getNextQuestion(tile);
      if (!q) return;

      setBoard((prev) => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          [difficulty]: {
            ...prev[categoryId][difficulty],
            usedCount: prev[categoryId][difficulty].usedCount + 1,
          },
        },
      }));

      const powerDouble = pendingDoubleForTeam === currentTurn;
      setCurrentQuestion(q);
      setCurrentPoints(difficulty);
      setCurrentIsDouble(forceDouble || powerDouble);
      if (powerDouble) setPendingDoubleForTeam(null);
      setAnswerRevealed(false);
      setTimerRunning(true);
      setModalOpen(true);
    },
    [board, pendingDoubleForTeam, currentTurn],
  );

  const handleSelectTile = useCallback(
    (categoryId: string, difficulty: SinJeemDifficulty) => {
      openTile(categoryId, difficulty, false);
    },
    [openTile],
  );

  const handleDoublePoints = useCallback(() => {
    const available: { categoryId: string; difficulty: SinJeemDifficulty }[] =
      [];
    for (const catId of categoryIds) {
      for (const d of [200, 400, 600] as SinJeemDifficulty[]) {
        const tile = board[catId]?.[d];
        if (tile && !isTileFullyUsed(tile)) {
          available.push({ categoryId: catId, difficulty: d });
        }
      }
    }
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    openTile(pick.categoryId, pick.difficulty, true);
  }, [board, categoryIds, openTile]);

  const hasAvailableTiles = categoryIds.some((catId) =>
    ([200, 400, 600] as SinJeemDifficulty[]).some(
      (d) => board[catId]?.[d] && !isTileFullyUsed(board[catId][d]),
    ),
  );

  const handleRevealAnswer = useCallback(() => {
    setAnswerRevealed(true);
    setTimerRunning(false);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setCurrentQuestion(null);
    setTimerRunning(false);
  }, []);

  useEffect(() => {
    if (phase !== "board" || modalOpen || categoryIds.length === 0) return;
    const allUsed = categoryIds.every((catId) => {
      const catBoard = board[catId];
      if (!catBoard) return true;
      return ([200, 400, 600] as SinJeemDifficulty[]).every((d) =>
        isTileFullyUsed(catBoard[d]),
      );
    });
    if (allUsed) {
      setModalOpen(false);
      setCurrentQuestion(null);
      setTimerRunning(false);
      setPhase("ended");
      playSound.gameComplete();
    }
  }, [phase, modalOpen, board, categoryIds]);

  const handleAwardCurrentTeam = useCallback(() => {
    const pts = currentIsDouble ? currentPoints * 2 : currentPoints;
    if (currentTurn === "team1") {
      setTeam1Score((s) => s + pts);
    } else {
      setTeam2Score((s) => s + pts);
    }
    playSound.correctAnswer();
    switchTurn();
    closeModal();
  }, [currentIsDouble, currentPoints, currentTurn, closeModal, switchTurn]);

  const handleStealByOtherTeam = useCallback(() => {
    // coin flip: 50% full points, 50% half points
    const multiplier = Math.random() < 0.5 ? 1 : 0.5;
    const base = currentIsDouble ? currentPoints * 2 : currentPoints;
    const stealPoints = Math.round(base * multiplier);
    const otherTeam = currentTurn === "team1" ? "team2" : "team1";
    if (otherTeam === "team1") {
      setTeam1Score((s) => s + stealPoints);
    } else {
      setTeam2Score((s) => s + stealPoints);
    }
    setStealToast({
      open: true,
      team: otherTeam,
      multiplier,
      points: stealPoints,
    });
    setCurrentTurn(otherTeam);
    playSound.correctAnswer();
    closeModal();
  }, [currentTurn, currentIsDouble, currentPoints, closeModal]);

  const handleNoPoints = useCallback(() => {
    playSound.wrongAnswer();
    switchTurn();
    closeModal();
  }, [closeModal, switchTurn]);

  const handleTimerExpire = useCallback(() => setTimerRunning(false), []);

  const handleUseDoublePower = useCallback(() => {
    if (currentTurn === "team1") {
      if (!team1PowerUps.double) return;
      setTeam1PowerUps((p) => ({ ...p, double: false }));
    } else {
      if (!team2PowerUps.double) return;
      setTeam2PowerUps((p) => ({ ...p, double: false }));
    }
    setPendingDoubleForTeam(currentTurn);
    playSound.buttonClick();
  }, [currentTurn, team1PowerUps.double, team2PowerUps.double]);

  const handleUseSkipPower = useCallback(() => {
    if (currentTurn === "team1") {
      if (!team1PowerUps.skip) return;
      setTeam1PowerUps((p) => ({ ...p, skip: false }));
      setCurrentTurn("team2");
    } else {
      if (!team2PowerUps.skip) return;
      setTeam2PowerUps((p) => ({ ...p, skip: false }));
      setCurrentTurn("team1");
    }
    playSound.buttonClick();
  }, [currentTurn, team1PowerUps.skip, team2PowerUps.skip]);

  const handlePlayAgain = useCallback(() => {
    setPhase("setup");
    setBoard({});
    setCategoryIds([]);
    setCategories([]);
    setModalOpen(false);
    setCurrentQuestion(null);
    setPendingDoubleForTeam(null);
    setStealToast(null);
  }, []);

  useEffect(() => {
    if (!stealToast?.open) return;
    const timeout = setTimeout(() => {
      setStealToast((prev) => (prev ? { ...prev, open: false } : prev));
    }, 2200);
    return () => clearTimeout(timeout);
  }, [stealToast]);

  if (phase === "ended") {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <GameEnd
          team1Name={team1Name}
          team2Name={team2Name}
          team1Score={team1Score}
          team2Score={team2Score}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {phase === "board" && (
        <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-2">
          <Link href="/">
            <button className="text-slate-400 hover:text-white flex items-center gap-1 text-sm py-1 px-2 rounded-lg hover:bg-white/5 transition">
              <ArrowRight className="w-4 h-4" />
              {t("common.back")}
            </button>
          </Link>
          <span className="text-amber-400 font-black text-lg tracking-wide">
            سين جيم
          </span>
          <div className="w-20" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-3 py-4 space-y-4">
        {phase === "setup" && (
          <>
            <div className="pt-2">
              <Link href="/">
                <button className="text-slate-400 hover:text-white flex items-center gap-1 text-sm py-1 px-2 rounded-lg hover:bg-white/5 transition">
                  <ArrowRight className="w-4 h-4" />
                  {t("common.back")}
                </button>
              </Link>
            </div>
            <SinJeemSetup onStart={handleStart} />
          </>
        )}

        {phase === "board" && (
          <>
            <ScoreBoard
              team1Name={team1Name}
              team2Name={team2Name}
              team1Score={team1Score}
              team2Score={team2Score}
              team1Avatar={team1Avatar}
              team2Avatar={team2Avatar}
              currentTurn={currentTurn}
              team1PowerUps={team1PowerUps}
              team2PowerUps={team2PowerUps}
              onUseDouble={handleUseDoublePower}
              onUseSkip={handleUseSkipPower}
            />
            <SinJeemBoard
              categories={categories}
              board={board}
              onSelectTile={handleSelectTile}
              onDoublePoints={handleDoublePoints}
              hasAvailableTiles={hasAvailableTiles}
            />
          </>
        )}
      </div>

      {phase === "board" && (
        <QuestionModal
          open={modalOpen}
          question={currentQuestion}
          points={currentPoints}
          isDouble={currentIsDouble}
          team1Name={team1Name}
          team2Name={team2Name}
          currentTurn={currentTurn}
          team1Avatar={team1Avatar}
          team2Avatar={team2Avatar}
          timerRunning={timerRunning}
          answerRevealed={answerRevealed}
          onRevealAnswer={handleRevealAnswer}
          onAwardCurrentTeam={handleAwardCurrentTeam}
          onStealByOtherTeam={handleStealByOtherTeam}
          onNoPoints={handleNoPoints}
          onTimerExpire={handleTimerExpire}
          onPlayTick={playSound.warningTick}
          onPlayBuzzer={playSound.timeWarning}
          onClose={closeModal}
        />
      )}

      {phase === "board" && stealToast?.open && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[220] animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="rounded-2xl border border-amber-300/40 bg-slate-900/95 backdrop-blur px-5 py-3 shadow-2xl shadow-amber-500/20 text-center min-w-[260px]">
            <p className="text-xs text-slate-400 mb-1">
              {isArabic ? "نتيجة السرقة" : "Steal Result"}
            </p>
            <p className="text-base font-black text-amber-300">
              {stealToast.team === "team1"
                ? `${team1Avatar} ${team1Name}`
                : `${team2Avatar} ${team2Name}`}
            </p>
            <p className="text-sm font-bold text-white mt-0.5">
              {stealToast.multiplier === 1
                ? isArabic
                  ? "🪙 نقاط كاملة"
                  : "🪙 Full points"
                : isArabic
                  ? "🪙 نصف النقاط"
                  : "🪙 Half points"}
              {" · +"}
              {stealToast.points}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
