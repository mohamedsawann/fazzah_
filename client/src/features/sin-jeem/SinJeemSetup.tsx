import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { fetchSinJeemCategories } from "./api";
import type { SinJeemCategory } from "./types";
import { cn } from "@/lib/utils";

const MIN_CATEGORIES = 4;
const MAX_CATEGORIES = 6;

interface SinJeemSetupProps {
  onStart: (
    team1Name: string,
    team2Name: string,
    categoryIds: string[],
  ) => void;
}

export function SinJeemSetup({ onStart }: SinJeemSetupProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sin-jeem-categories"],
    queryFn: fetchSinJeemCategories,
  });

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_CATEGORIES) next.add(id);
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
    <div className="max-w-lg mx-auto space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <h2 className="text-2xl font-bold text-center text-primary">
        {t("sinJeem.setupTitle")}
      </h2>
      <div className="space-y-2">
        <Label>{t("sinJeem.team1Name")}</Label>
        <Input
          value={team1Name}
          onChange={(e) => setTeam1Name(e.target.value)}
          placeholder={isArabic ? "اسم الفريق الأول" : "Team 1 Name"}
          className="text-lg"
        />
      </div>
      <div className="space-y-2">
        <Label>{t("sinJeem.team2Name")}</Label>
        <Input
          value={team2Name}
          onChange={(e) => setTeam2Name(e.target.value)}
          placeholder={isArabic ? "اسم الفريق الثاني" : "Team 2 Name"}
          className="text-lg"
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t("sinJeem.selectCategories")} ({MIN_CATEGORIES}–{MAX_CATEGORIES})
        </Label>
        {isLoading && (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        )}
        {error && (
          <p className="text-sm text-destructive">
            {t("common.error")}: {(error as Error).message}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((c: SinJeemCategory) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategory(c.id)}
              className={cn(
                "rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                selectedIds.has(c.id)
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-muted border-muted-foreground/30 hover:border-amber-500/50",
              )}
            >
              {isArabic ? c.name_ar : c.name_en} {c.icon ?? ""}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedIds.size} / {MAX_CATEGORIES} {t("sinJeem.selected")}
        </p>
      </div>
      <Button
        size="lg"
        className="w-full text-lg"
        disabled={!canStart}
        onClick={handleStart}
      >
        {t("sinJeem.startGame")}
      </Button>
    </div>
  );
}
