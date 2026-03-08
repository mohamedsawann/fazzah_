import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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
  pickQuestionFromTile,
  isTileFullyUsed,
} from "./utils";
import type {
  SinJeemCategory,
  SinJeemGameState,
  BoardState,
  SinJeemDifficulty,
} from "./types";
import { useQuery } from "@tanstack/react-query";
import { playSound } from "@/lib/soundUtils";

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
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  const { data: categoriesList = [] } = useQuery({
    queryKey: ["sin-jeem-categories"],
    queryFn: fetchSinJeemCategories,
    enabled: phase !== "setup",
  });

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

  const handleSelectTile = useCallback(
    (categoryId: string, difficulty: SinJeemDifficulty) => {
      const tile = board[categoryId]?.[difficulty];
      if (!tile || isTileFullyUsed(tile)) return;
      const q = pickQuestionFromTile(tile);
      if (!q) return;
      setCurrentQuestion(q);
      setCurrentPoints(difficulty);
      setCurrentIsDouble(tile.isDouble);
      setAnswerRevealed(false);
      setTimerRunning(true);
      setModalOpen(true);
      if (soundsEnabled && playSound?.buttonClick) playSound.buttonClick();
    },
    [board, soundsEnabled],
  );

  const handleRevealAnswer = useCallback(() => {
    setAnswerRevealed(true);
    setTimerRunning(false);
  }, []);

  const closeModalAndCheckEnd = useCallback(() => {
    setModalOpen(false);
    setCurrentQuestion(null);
  }, []);

  useEffect(() => {
    if (phase !== "board" || modalOpen || categoryIds.length === 0) return;
    let allUsed = true;
    for (const catId of categoryIds) {
      const catBoard = board[catId];
      if (!catBoard) continue;
      for (const d of [200, 400, 600] as SinJeemDifficulty[]) {
        if (!isTileFullyUsed(catBoard[d])) {
          allUsed = false;
          break;
        }
      }
      if (!allUsed) break;
    }
    if (allUsed) setPhase("ended");
  }, [phase, modalOpen, board, categoryIds]);

  const handleAwardTeam1 = useCallback(() => {
    const pts = currentIsDouble ? currentPoints * 2 : currentPoints;
    setTeam1Score((s) => s + pts);
    closeModalAndCheckEnd();
  }, [currentPoints, currentIsDouble, closeModalAndCheckEnd]);

  const handleAwardTeam2 = useCallback(() => {
    const pts = currentIsDouble ? currentPoints * 2 : currentPoints;
    setTeam2Score((s) => s + pts);
    closeModalAndCheckEnd();
  }, [currentPoints, currentIsDouble, closeModalAndCheckEnd]);

  const handleNoPoints = useCallback(() => {
    closeModalAndCheckEnd();
  }, [closeModalAndCheckEnd]);

  const handleTimerExpire = useCallback(() => {
    setTimerRunning(false);
    if (soundsEnabled && playSound?.buttonClick) playSound.buttonClick();
  }, [soundsEnabled]);

  const handlePlayAgain = useCallback(() => {
    setPhase("setup");
    setBoard({});
    setCategoryIds([]);
  }, []);

  if (phase === "ended") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
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
      className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowRight className="w-4 h-4 ml-2" />
              {t("common.back")}
            </Button>
          </Link>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={soundsEnabled}
              onChange={(e) => setSoundsEnabled(e.target.checked)}
            />
            {t("sinJeem.sounds")}
          </label>
        </div>

        {phase === "setup" && <SinJeemSetup onStart={handleStart} />}

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
            />
          </>
        )}
      </div>

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
        onPlayTick={soundsEnabled ? () => {} : undefined}
        onPlayBuzzer={soundsEnabled ? () => {} : undefined}
        onClose={() => {
          setTimerRunning(false);
          closeModalAndCheckEnd();
        }}
      />
    </div>
  );
}
