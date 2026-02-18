import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

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
        <div dir="ltr" style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
            <Button
                variant="outline"
                onClick={toggleLanguage}
                className="bg-orange-500 hover:bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-500/30 font-medium"
            >
                {i18n.language === "ar" ? "English" : "العربية"}
            </Button>
        </div>
    );
}
