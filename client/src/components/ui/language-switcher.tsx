import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    // dir="ltr" isolates this element from the document RTL direction
    // so that right/left CSS values always mean the physical right/left
    <div
      dir="ltr"
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
      }}
    >
      <Button
        variant="outline"
        onClick={toggleLanguage}
        title={
          i18n.language === "ar" ? "Switch to English" : "التبديل إلى العربية"
        }
        aria-label={
          i18n.language === "ar" ? "Switch to English" : "التبديل إلى العربية"
        }
        className="h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-500/30"
      >
        <Languages className="h-4 w-4" />
      </Button>
    </div>
  );
}
