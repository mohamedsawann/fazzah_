import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
      <Card className="w-full max-w-md mx-4 relative z-10">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">{t('notFound')}</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {t('notFoundDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
