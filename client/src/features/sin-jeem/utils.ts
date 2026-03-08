import type { SinJeemDifficulty, SinJeemQuestion, TileState, BoardState } from "./types";

const DIFFICULTIES: SinJeemDifficulty[] = [200, 400, 600];
const QUESTIONS_PER_TILE = 2;

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  let currentIndex = arr.length;
  let randomIndex: number;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

export function buildBoardFromQuestions(
  categoryIds: string[],
  questionsByCategory: Record<string, Record<SinJeemDifficulty, SinJeemQuestion[]>>
): BoardState {
  const board: BoardState = {};

  categoryIds.forEach((categoryId) => {
    const byDiff = questionsByCategory[categoryId];
    if (!byDiff) return;

    board[categoryId] = {} as Record<SinJeemDifficulty, TileState>;

    const doubleDifficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

    DIFFICULTIES.forEach((d) => {
      const pool = byDiff[d] ?? [];
      const shuffled = shuffleArray(pool);
      const selected = shuffled.slice(0, QUESTIONS_PER_TILE);
      board[categoryId][d] = {
        questions: selected,
        isDouble: d === doubleDifficulty,
        usedCount: 0,
      };
    });
  });

  return board;
}

export function pickQuestionFromTile(tile: TileState): SinJeemQuestion | null {
  if (tile.usedCount >= tile.questions.length) return null;
  const q = tile.questions[tile.usedCount] ?? null;
  tile.usedCount++;
  return q;
}

export function isTileFullyUsed(tile: TileState): boolean {
  return tile.usedCount >= tile.questions.length;
}
