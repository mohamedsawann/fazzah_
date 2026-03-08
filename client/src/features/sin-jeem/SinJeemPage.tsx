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

type Phase = "setup" | "board" | "ended";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] =
    useState<SinJeemGameState["currentQuestion"]>(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [currentIsDouble, setCurrentIsDouble] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);

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
      setPhase("board");
    },
    [],
  );

  // ── Open a tile — immutably increments usedCount in board state ──────────
  const openTile = useCallback(
    (categoryId: string, difficulty: SinJeemDifficulty, forceDouble = false) => {
      setBoard((prev) => {
        const tile = prev[categoryId]?.[difficulty];
        if (!tile || isTileFullyUsed(tile)) return prev;
        const q = getNextQuestion(tile);
        if (!q) return prev;

        // Immutable update
        const updated: BoardState = {
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            [difficulty]: {
              ...tile,
              usedCount: tile.usedCount + 1,
            },
          },
        };

        // Schedule modal open after state update
        setTimeout(() => {
          setCurrentQuestion(q);
          setCurrentPoints(difficulty);
          setCurrentIsDouble(forceDouble || tile.isDouble);
          setAnswerRevealed(false);
          setTimerRunning(true);
          setModalOpen(true);
        }, 0);

        return updated;
      });
    },
    [],
  );

  const handleSelectTile = useCallback(
    (categoryId: string, difficulty: SinJeemDifficulty) => {
      openTile(categoryId, difficulty, false);
    },
    [openTile],
  );

  // ── Double-points: pick a random available tile ───────────────────────────
  const handleDoublePoints = useCallback(() => {
    const available: { categoryId: string; difficulty: SinJeemDifficulty }[] = [];
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

  // ── Answer handling ───────────────────────────────────────────────────────
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
    if (allUsed) setPhase("ended");
  }, [phase, modalOpen, board, categoryIds]);

  const handleAwardTeam1 = useCallback(() => {
    const pts = currentIsDouble ? currentPoints * 2 : currentPoints;
    setTeam1Score((s) => s + pts);
    closeModal();
  }, [currentPoints, currentIsDouble, closeModal]);

  const handleAwardTeam2 = useCallback(() => {
    const pts = currentIsDouble ? currentPoints * 2 : currentPoints;
    setTeam2Score((s) => s + pts);
    closeModal();
  }, [currentPoints, currentIsDouble, closeModal]);

  const handleNoPoints = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleTimerExpire = useCallback(() => {
    setTimerRunning(false);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setPhase("setup");
    setBoard({});
    setCategoryIds([]);
    setCategories([]);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
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
      {/* ── Top bar (only on board phase) ── */}
      {phase === "board" && (
        <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-2">
          <Link href="/">
            <button className="text-slate-400 hover:text-white flex items-center gap-1 text-sm py-1 px-2 rounded-lg hover:bg-white/5 transition">
              <ArrowRight className="w-4 h-4" />
              {t("common.back")}
            </button>
          </Link>
          <span className="text-amber-400 font-black text-lg tracking-wide">سين جيم</span>
          <div className="w-20" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-3 py-4 space-y-4">
        {/* Setup phase */}
        {phase === "setup" && (
          <>
            {/* Back link on setup */}
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

        {/* Board phase */}
        {phase === "board" && (
          <>
            <ScoreBoard
              team1Name={team1Name}
              team2Name={team2Name}
              team1Score={team1Score}
              team2Score={team2Score}
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

      {/* Full-screen question overlay */}
      <QuestionModal
        open={modalOpen}
        question={currentQuestion}
        points={currentPoints}
        isDouble={currentIsDouble}
        team1Name={team1Name}
        team2Name={team2Name}
        timerRunning={timerRunning}
        answerRevealed={answerRevealed}
        onRevealAnswer={handleRevealAnswer}
        onAwardTeam1={handleAwardTeam1}
        onAwardTeam2={handleAwardTeam2}
        onNoPoints={handleNoPoints}
        onTimerExpire={handleTimerExpire}
        onPlayTick={undefined}
        onPlayBuzzer={undefined}
        onClose={closeModal}
      />
    </div>
  );
}
