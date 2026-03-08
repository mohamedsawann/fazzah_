import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { SinJeemCategory, BoardState, SinJeemDifficulty } from "./types";
import { isTileFullyUsed } from "./utils";

const DIFFICULTIES: SinJeemDifficulty[] = [200, 400, 600];

const DIFF_STYLE: Record<number, { cell: string; badge: string; label: string }> = {
  200: {
    cell: "bg-sky-600/20 hover:bg-sky-500/40 border-sky-500/60 text-sky-100",
    badge: "bg-sky-600 text-white",
    label: "text-sky-400",
  },
  400: {
    cell: "bg-violet-600/20 hover:bg-violet-500/40 border-violet-500/60 text-violet-100",
    badge: "bg-violet-600 text-white",
    label: "text-violet-400",
  },
  600: {
    cell: "bg-rose-600/20 hover:bg-rose-500/40 border-rose-500/60 text-rose-100",
    badge: "bg-rose-600 text-white",
    label: "text-rose-400",
  },
};

interface SinJeemBoardProps {
  categories: SinJeemCategory[];
  board: BoardState;
  onSelectTile: (categoryId: string, difficulty: SinJeemDifficulty) => void;
  onDoublePoints: () => void;
  hasAvailableTiles: boolean;
}

export function SinJeemBoard({
  categories,
  board,
  onSelectTile,
  onDoublePoints,
  hasAvailableTiles,
}: SinJeemBoardProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;

  return (
    <div className="w-full space-y-4" dir={isArabic ? "rtl" : "ltr"}>

      {/* ── Double-points random button ── */}
      <button
        type="button"
        onClick={onDoublePoints}
        disabled={!hasAvailableTiles}
        className={cn(
          "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all duration-200 border-2",
          hasAvailableTiles
            ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400 text-amber-300 hover:from-amber-500/35 hover:to-yellow-500/35 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
            : "bg-slate-800/30 border-slate-700/40 text-slate-600 cursor-not-allowed"
        )}
      >
        <span className="text-2xl">⭐</span>
        <span>{isArabic ? "سؤال النقاط المضاعفة — سؤال عشوائي" : "Double Points — Random Question"}</span>
        <span className="text-2xl">⭐</span>
      </button>

      {/* ── Board table ── */}
      <div className="w-full overflow-x-auto pb-2 rounded-2xl border border-slate-700/60">
        <table className="w-full border-collapse bg-slate-900/80" style={{ minWidth: `${categories.length * 120 + 60}px` }}>
          <thead>
            <tr>
              {/* Points column header */}
              <th className="py-2 px-2 w-14 bg-slate-800/80 border-b border-e border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                {isArabic ? "نقاط" : "Pts"}
              </th>
              {categories.map((cat) => (
                <th
                  key={cat.id}
                  className="py-3 px-3 bg-slate-800/60 border-b border-e border-slate-700 last:border-e-0"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-3xl leading-none">{cat.icon || "📚"}</span>
                    <span className="text-xs font-bold text-white leading-tight text-center line-clamp-2 max-w-[100px]">
                      {isArabic ? cat.name_ar : cat.name_en}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIFFICULTIES.map((diff, rowIdx) => {
              const style = DIFF_STYLE[diff];
              return (
                <tr key={diff}>
                  {/* Row label */}
                  <td
                    className={cn(
                      "py-2 px-1 text-center font-black text-base border-b border-e border-slate-700",
                      rowIdx === DIFFICULTIES.length - 1 && "border-b-0",
                      style.label,
                      "bg-slate-800/40"
                    )}
                  >
                    {diff}
                  </td>

                  {categories.map((cat, colIdx) => {
                    const tile = board[cat.id]?.[diff];
                    const used = !tile || isTileFullyUsed(tile);
                    const isDouble = tile?.isDouble ?? false;

                    return (
                      <td
                        key={`${cat.id}-${diff}`}
                        className={cn(
                          "p-2 border-e border-b border-slate-700/50",
                          colIdx === categories.length - 1 && "border-e-0",
                          rowIdx === DIFFICULTIES.length - 1 && "border-b-0"
                        )}
                      >
                        <button
                          type="button"
                          disabled={used}
                          onClick={() => !used && onSelectTile(cat.id, diff)}
                          className={cn(
                            "w-full min-h-[72px] rounded-xl font-black text-xl transition-all duration-150 flex flex-col items-center justify-center gap-1 border-2",
                            used
                              ? "bg-slate-800/30 border-slate-700/20 text-slate-700 cursor-not-allowed"
                              : cn(
                                  style.cell,
                                  "border-2 active:scale-95 hover:scale-[1.04]",
                                  isDouble && "ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-lg shadow-amber-500/30"
                                )
                          )}
                        >
                          {used ? (
                            <span className="text-slate-700 text-2xl">—</span>
                          ) : (
                            <>
                              <span>{diff}</span>
                              {isDouble && (
                                <span className="text-amber-300 text-xs font-bold">
                                  ⭐ {isArabic ? "×٢" : "×2"}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
