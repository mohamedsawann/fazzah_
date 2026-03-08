import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { SinJeemCategory, BoardState, SinJeemDifficulty } from "./types";
import { isTileFullyUsed } from "./utils";

const DIFFICULTIES: SinJeemDifficulty[] = [200, 400, 600];

interface SinJeemBoardProps {
  categories: SinJeemCategory[];
  board: BoardState;
  onSelectTile: (categoryId: string, difficulty: SinJeemDifficulty) => void;
}

export function SinJeemBoard({
  categories,
  board,
  onSelectTile,
}: SinJeemBoardProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;

  return (
    <div className="w-full overflow-x-auto pb-4" dir={isArabic ? "rtl" : "ltr"}>
      <div className="inline-block min-w-full">
        <table className="w-full border-collapse rounded-xl overflow-hidden shadow-2xl bg-slate-900/95">
          <thead>
            <tr>
              <th className="w-24 sm:w-28 py-3 px-2 text-sm font-bold text-amber-400 bg-slate-800/80 border border-slate-600">
                {isArabic ? "نقاط" : "Points"}
              </th>
              {categories.map((cat) => (
                <th
                  key={cat.id}
                  className="py-3 px-2 text-sm font-bold text-white bg-slate-800 border border-slate-600 max-w-[120px]"
                >
                  {isArabic ? cat.name_ar : cat.name_en}
                  {cat.icon && <span className="ml-1">{cat.icon}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIFFICULTIES.map((diff) => (
              <tr key={diff}>
                <td className="py-2 px-2 text-center font-black text-lg text-amber-400 bg-slate-800/60 border border-slate-600">
                  {diff}
                </td>
                {categories.map((cat) => {
                  const tile = board[cat.id]?.[diff];
                  const used = tile ? isTileFullyUsed(tile) : true;
                  const isDouble = tile?.isDouble ?? false;
                  return (
                    <td
                      key={`${cat.id}-${diff}`}
                      className="p-2 border border-slate-600"
                    >
                      <button
                        type="button"
                        disabled={used}
                        onClick={() => !used && onSelectTile(cat.id, diff)}
                        className={cn(
                          "w-full min-h-[72px] sm:min-h-[80px] rounded-lg font-bold text-lg transition-all flex flex-col items-center justify-center gap-0.5",
                          used
                            ? "bg-slate-700/50 text-slate-500 cursor-not-allowed line-through"
                            : "bg-amber-500/20 hover:bg-amber-500/40 text-amber-100 border-2 border-amber-500/60 hover:scale-[1.02] active:scale-0.98",
                          isDouble &&
                            !used &&
                            "ring-2 ring-amber-400 shadow-lg shadow-amber-500/30",
                        )}
                      >
                        {!used && (
                          <>
                            <span>{diff}</span>
                            {isDouble && (
                              <span className="text-amber-300 text-sm">
                                ⭐ {isArabic ? "مضاعفة" : "Double"} ⭐
                              </span>
                            )}
                          </>
                        )}
                        {used && <span>—</span>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
