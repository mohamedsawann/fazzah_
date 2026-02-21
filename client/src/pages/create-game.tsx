import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Plus, PlusCircle, Trash2, Upload, FileSpreadsheet, Eye, CheckCircle2, AlertCircle, X, ImagePlus, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { uploadImage } from "@/lib/uploadImage";
import { useToast } from "@/hooks/use-toast";
import { StickersBackground } from "@/components/stickers-background";
import { useTranslation } from "react-i18next";
import * as XLSX from 'xlsx';

type OptionValue = string | { text: string; image?: string };

function getOptionText(opt: OptionValue): string {
  return typeof opt === "string" ? opt : opt.text;
}

function getOptionImage(opt: OptionValue): string | undefined {
  return typeof opt === "string" ? undefined : opt.image;
}

interface Question {
  text: string;
  image?: string;
  options: OptionValue[];
  correctAnswer: number;
}

export default function CreateGame() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [gameName, setGameName] = useState("");
  const [questionDurationSeconds, setQuestionDurationSeconds] = useState(20);
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }], correctAnswer: 0 }
  ]);

  const updateQuestionImage = (questionIndex: number, image: string | null) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], image: image || undefined };
    setQuestions(updatedQuestions);
  };
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Excel import states
  const [isImporting, setIsImporting] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState<Question[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  // Image upload loading state (questionIndex or "q-{i}-o-{j}" for option)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // AI generate states
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Content mode: manual creation or excel import
  const [contentMode, setContentMode] = useState<"manual" | "excel" | null>(null);

  const createGameMutation = useMutation({
    mutationFn: async (gameData: { name: string; questionDurationSeconds: number; questions: Question[] }) => {
      const response = await apiRequest("POST", "/api/games", gameData);
      return response.json();
    },
    onSuccess: (game) => {
      setLocation(`/game-created?gameId=${game.id}`);
    },
    onError: (error: Error) => {
      console.error("Game creation error:", error);
      let msg = error.message;
      try {
        const match = error.message.match(/\d+:\s*(\{.*\})/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          if (parsed.message) msg = parsed.message;
        }
      } catch {
        /* use original message */
      }
      toast({
        title: t('common.error'),
        description: msg || t('createGame.errorCreateGame'),
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: [{ text: "" }, { text: "" }], correctAnswer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const opt = updatedQuestions[questionIndex].options[optionIndex];
    updatedQuestions[questionIndex].options[optionIndex] = typeof opt === "string"
      ? { text: value, image: undefined }
      : { ...opt, text: value };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOptionImage = (questionIndex: number, optionIndex: number, image: string | null) => {
    const updatedQuestions = [...questions];
    const opt = updatedQuestions[questionIndex].options[optionIndex];
    const text = getOptionText(opt);
    updatedQuestions[questionIndex].options[optionIndex] = { text, image: image || undefined };
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length < 6) {
      updatedQuestions[questionIndex].options.push({ text: "" });
      setQuestions(updatedQuestions);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      if (updatedQuestions[questionIndex].correctAnswer >= optionIndex) {
        updatedQuestions[questionIndex].correctAnswer = Math.max(0, updatedQuestions[questionIndex].correctAnswer - 1);
      }
      setQuestions(updatedQuestions);
    }
  };

  const validateQuestions = () => {
    return questions.every(q => {
      const validOptions = q.options.filter(opt => getOptionText(opt).trim() !== "");
      return q.text.trim() !== "" &&
        validOptions.length >= 2 &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < validOptions.length;
    });
  };

  const getQuestionStatus = (question: Question) => {
    const validOptions = question.options.filter(opt => getOptionText(opt).trim() !== "");
    return question.text.trim() !== "" &&
      validOptions.length >= 2 &&
      question.correctAnswer >= 0 &&
      question.correctAnswer < validOptions.length;
  };

  // Fisher-Yates shuffle for random question selection
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Parse Excel file and extract questions
  const parseExcelFile = async (file: File): Promise<Question[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const parsedQuestions: Question[] = [];

          jsonData.forEach((row: any, index) => {
            try {
              // Support both Arabic and English headers
              const questionText = row['Question'] || row['السؤال'] || row['question'] || '';
              const option1 = row['Option1'] || row['الخيار 1'] || row['option1'] || '';
              const option2 = row['Option2'] || row['الخيار 2'] || row['option2'] || '';
              const option3 = row['Option3'] || row['الخيار 3'] || row['option3'] || '';
              const option4 = row['Option4'] || row['الخيار 4'] || row['option4'] || '';
              const option5 = row['Option5'] || row['الخيار 5'] || row['option5'] || '';
              const option6 = row['Option6'] || row['الخيار 6'] || row['option6'] || '';

              let correctAnswer = row['Correct'] || row['الإجابة الصحيحة'] || row['correct'] || 1;

              // Handle different correct answer formats
              if (typeof correctAnswer === 'string') {
                if (correctAnswer.match(/^[A-F]$/i)) {
                  // Letter format (A-F)
                  correctAnswer = correctAnswer.toUpperCase().charCodeAt(0) - 65;
                } else {
                  // Number format
                  correctAnswer = parseInt(correctAnswer) - 1; // Convert to 0-based
                }
              } else {
                correctAnswer = correctAnswer - 1; // Convert to 0-based
              }

              // Collect all non-empty options
              const options = [option1, option2, option3, option4, option5, option6]
                .map(opt => (opt || '').toString().trim())
                .filter(opt => opt !== '');

              // Validate question
              if (questionText.trim() && options.length >= 2 &&
                correctAnswer >= 0 && correctAnswer < options.length) {
                parsedQuestions.push({
                  text: questionText.trim(),
                  options: options.slice(0, 6), // Max 6 options
                  correctAnswer
                });
              }
            } catch (error) {
              console.warn(`Error parsing row ${index + 1}:`, error);
            }
          });

          resolve(parsedQuestions);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle Excel file upload
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('common.error'),
        description: t('createGame.errorFileTooLarge'),
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: t('common.error'),
        description: t('createGame.errorInvalidFileType'),
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const parsedQuestions = await parseExcelFile(file);

      if (parsedQuestions.length === 0) {
        toast({
          title: t('createGame.warning'),
          description: t('createGame.errorNoQuestions'),
          variant: "destructive",
        });
        setIsImporting(false);
        return;
      }

      setImportedQuestions(parsedQuestions);

      // Limit question count to available questions
      const maxQuestions = Math.min(questionCount, parsedQuestions.length);
      setQuestionCount(maxQuestions);

      toast({
        title: t('common.success'),
        description: t('createGame.importSuccess', { count: parsedQuestions.length }),
        variant: "default",
      });

    } catch (error) {
      console.error('Excel parsing error:', error);
      toast({
        title: t('common.error'),
        description: t('createGame.errorReadFile'),
        variant: "destructive",
      });
    }

    setIsImporting(false);
    // Clear the input
    event.target.value = '';
  };

  // Apply imported questions to the form
  const applyImportedQuestions = () => {
    if (importedQuestions.length === 0) return;

    // Randomly select questions and normalize options (Excel gives string[], we use { text, image? }[])
    const shuffled = shuffleArray(importedQuestions);
    const selectedQuestions = shuffled.slice(0, questionCount).map(q => ({
      ...q,
      options: q.options.map(o => (typeof o === "string" ? { text: o } : o))
    })) as Question[];

    if (importMode === 'replace') {
      setQuestions(selectedQuestions);
      toast({
        title: t('createGame.applySuccess'),
        description: t('createGame.applyReplaceDetail', { count: selectedQuestions.length }),
        variant: "default",
      });
    } else {
      setQuestions(prev => [...prev, ...selectedQuestions]);
      toast({
        title: t('createGame.applySuccess'),
        description: t('createGame.applyAppendDetail', { count: selectedQuestions.length }),
        variant: "default",
      });
    }

    // Clear imported questions after applying
    setImportedQuestions([]);
  };

  const handleAiGenerate = async () => {
    const topic = (aiTopic || gameName || "").trim();
    if (!topic) {
      toast({
        title: t("common.error"),
        description: t("createGame.aiGenerateTopicRequired"),
        variant: "destructive",
      });
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          count: Math.min(50, Math.max(1, aiCount)),
          language: i18n.language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      const generated = (data.questions || []) as Array<{ text: string; options: { text: string }[]; correctAnswer: number }>;
      if (generated.length === 0) throw new Error("No questions generated");
      const mapped: Question[] = generated.map((q) => ({
        text: q.text,
        options: (q.options || []).map((o) => ({ text: typeof o === "string" ? o : o.text })),
        correctAnswer: q.correctAnswer ?? 0,
      }));
      setQuestions(importMode === "replace" ? mapped : [...questions, ...mapped]);
      toast({
        title: t("common.success"),
        description: t("createGame.aiGenerateSuccess", { count: mapped.length }),
        variant: "default",
      });
      setAiDialogOpen(false);
    } catch (err) {
      toast({
        title: t("common.error"),
        description: (err as Error).message || t("createGame.aiGenerateError"),
        variant: "destructive",
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim()) {
      toast({
        title: t('common.error'),
        description: t('createGame.errorNoName'),
        variant: "destructive",
      });
      return;
    }

    if (!validateQuestions()) {
      toast({
        title: t('common.error'),
        description: t('createGame.errorInvalidQuestions'),
        variant: "destructive",
      });
      return;
    }

    // Filter out empty options and remap correct answer index
    const cleanedQuestions = questions.map(q => {
      const validOptions = q.options
        .map((opt, index) => ({
          text: getOptionText(opt).trim(),
          image: getOptionImage(opt),
          originalIndex: index
        }))
        .filter(({ text }) => text !== "");

      const newCorrectAnswerIndex = validOptions.findIndex(({ originalIndex }) => originalIndex === q.correctAnswer);

      return {
        text: q.text,
        image: q.image,
        options: validOptions.map(({ text, image }) => image ? { text, image } : text),
        correctAnswer: Math.max(0, newCorrectAnswerIndex)
      };
    });

    createGameMutation.mutate({
      name: gameName,
      questionDurationSeconds,
      questions: cleanedQuestions,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden trivia-background">
      <StickersBackground transparent />
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white bg-orange-500 hover:bg-orange-600 transition-colors px-3 py-2 rounded-md"
              data-testid="button-back"
            >
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t('common.back')}</span>
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8" data-testid="header-create-game">
          <h1 className="text-5xl md:text-6xl font-bold font-arabic text-primary mb-3 drop-shadow-lg">
            {t('createGame.pageTitle')}
          </h1>
          <p className="text-lg text-primary font-medium">{t('createGame.pageSubtitle')}</p>
        </div>

        {/* New Game - Game Name + Options */}
        <Card className="mb-6 bg-amber-600/15 border-2 border-orange-400">
          <CardHeader>
            <CardTitle className="text-primary">{t('createGame.newGame')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="gameName" className="text-lg font-semibold mb-2 block text-primary">
                {t('createGame.gameNameLabel')}
              </Label>
              <Input
                id="gameName"
                type="text"
                placeholder={t('createGame.gameNamePlaceholder')}
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="text-lg py-4 bg-white/70 border border-orange-400/50 focus:ring-2 focus:ring-orange-400/50"
                data-testid="input-game-name"
              />
            </div>
            <div>
              <Label htmlFor="questionDuration" className="text-lg font-semibold mb-2 block text-primary">
                {t('createGame.questionDurationLabel')}
              </Label>
              <Input
                id="questionDuration"
                type="number"
                min={5}
                max={120}
                value={questionDurationSeconds}
                onChange={(e) => setQuestionDurationSeconds(Math.min(120, Math.max(5, parseInt(e.target.value) || 20)))}
                className="text-lg py-4 bg-white/70 border border-orange-400/50 focus:ring-2 focus:ring-orange-400/50 w-32"
                data-testid="input-question-duration"
              />
              <p className="text-sm text-muted-foreground mt-1">{t('createGame.questionDurationHelp')}</p>
            </div>
            <div>
              <Label className="text-base font-semibold mb-3 block text-primary">
                {t('createGame.manualTab')} or {t('createGame.excelTab')}
              </Label>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setContentMode("manual")}
                  className={`flex-1 min-w-[140px] py-6 ${contentMode === "manual" ? "bg-orange-500/25 border-orange-400/50 ring-2 ring-orange-500/50" : "bg-orange-500/25 border-orange-400/50 hover:bg-orange-500/35"}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <PlusCircle className="w-6 h-6" />
                    <span className="font-bold">{t('createGame.manualTab')}</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setContentMode("excel")}
                  className={`flex-1 min-w-[140px] py-6 ${contentMode === "excel" ? "bg-orange-500/25 border-orange-400/50 ring-2 ring-orange-500/50" : "bg-orange-500/25 border-orange-400/50 hover:bg-orange-500/35"}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="w-6 h-6" />
                    <span className="font-bold">{t('createGame.excelTab')}</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content - shows when user picks an option */}
        {contentMode === "manual" && (
            <Card className="mb-6 bg-amber-600/15 border-2 border-orange-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <PlusCircle className="w-5 h-5" />
                  {t('createGame.manualTab')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
            {/* Add Question + AI Generate buttons */}
            <div className="flex flex-wrap justify-end gap-2">
              <Dialog open={aiDialogOpen} onOpenChange={(open) => { setAiDialogOpen(open); if (open) setAiTopic(gameName); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/70 border border-gray-300 hover:bg-white">
                    <Sparkles className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    {t("createGame.aiGenerate")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-orange-500/15 border border-orange-400/50 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle>{t("createGame.aiGenerateTitle")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label>{t("createGame.aiGenerateTopic")}</Label>
                      <Input
                        placeholder={t("createGame.aiGenerateTopicPlaceholder")}
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="mt-1 bg-white/70 border-orange-400/40"
                      />
                    </div>
                    <div>
                      <Label>{t("createGame.aiGenerateCount")}</Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={aiCount}
                        onChange={(e) => setAiCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 5)))}
                        className="mt-1 bg-white/70 border-orange-400/40"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Select value={importMode} onValueChange={(v: "replace" | "append") => setImportMode(v)}>
                        <SelectTrigger className="flex-1 bg-white/70">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="replace">{t("createGame.replace")}</SelectItem>
                          <SelectItem value="append">{t("createGame.append")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAiGenerate} disabled={isAiGenerating} className="bg-orange-500/60 hover:bg-orange-500/80 text-white">
                        {isAiGenerating ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t("createGame.aiGenerateButton")}
                          </span>
                        ) : (
                          t("createGame.aiGenerateButton")
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={addQuestion} variant="outline" size="sm" className="bg-white/70 border border-gray-300 hover:bg-white" data-testid="button-add-question">
                <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                {t("createGame.addQuestion")}
              </Button>
            </div>

            {/* Questions Accordion */}
            <Accordion type="multiple" className="space-y-4" defaultValue={["item-0"]}>
              {questions.map((question, questionIndex) => (
                <AccordionItem
                  key={questionIndex}
                  value={`item-${questionIndex}`}
                  className="border border-orange-400/50 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 transition-all"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {getQuestionStatus(question) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        )}
                        <span className="font-medium">
                          {t('createGame.question', { number: questionIndex + 1 })}
                        </span>
                      </div>
                      <div className="flex-1 text-end">
                        {question.text ? (
                          <p className="text-sm text-primary truncate">
                            {question.text}
                          </p>
                        ) : null}
                      </div>
                      <Badge variant="outline" className="ltr:ml-2 rtl:mr-2 bg-white/70 border-gray-300 hover:bg-white">
                        {question.options.filter(opt => getOptionText(opt).trim()).length} {t('createGame.options')}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="space-y-6">
                      {/* Question Text */}
                      <div>
                        <Label className="text-base font-medium mb-2 block">
                          {t('createGame.questionTextLabel')}
                        </Label>
                        <Textarea
                          placeholder={t('createGame.questionPlaceholder')}
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(questionIndex, "text", e.target.value)
                          }
                          className="min-h-[80px] bg-white/70"
                          data-testid={`textarea-question-${questionIndex}`}
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`q-img-${questionIndex}`}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const key = `q-${questionIndex}`;
                              setUploadingImage(key);
                              try {
                                const url = await uploadImage(file);
                                if (url) updateQuestionImage(questionIndex, url);
                              } catch (err) {
                                toast({
                                  title: t('common.error'),
                                  description: (err as Error).message || t('createGame.errorUploadImage'),
                                  variant: "destructive",
                                });
                              } finally {
                                setUploadingImage(null);
                              }
                              e.target.value = '';
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 bg-white/70 border border-gray-300 hover:bg-white"
                            title={t('createGame.addImage')}
                            onClick={() => document.getElementById(`q-img-${questionIndex}`)?.click()}
                            disabled={uploadingImage === `q-${questionIndex}`}
                          >
                            {uploadingImage === `q-${questionIndex}` ? (
                              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                            ) : (
                              <ImagePlus className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                            )}
                            {t('createGame.addImage')}
                          </Button>
                          {question.image && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuestionImage(questionIndex, null)}
                                className="bg-white/70 border border-gray-300 hover:bg-white text-destructive hover:text-destructive shrink-0"
                                title={t('createGame.removeImage')}
                              >
                                <X className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                                {t('createGame.removeImage')}
                              </Button>
                              <img
                                src={question.image}
                                alt=""
                                className="max-h-24 rounded object-contain border"
                                aria-hidden
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Options with Radio Selection */}
                      <div>
                        <Label className="text-base font-medium mb-3 block">
                          {t('createGame.optionsLabel')}
                        </Label>
                        <RadioGroup
                          value={question.correctAnswer.toString()}
                          onValueChange={(value) =>
                            updateQuestion(questionIndex, "correctAnswer", parseInt(value))
                          }
                          className="space-y-3"
                        >
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex flex-col gap-2 p-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <RadioGroupItem
                                  value={optionIndex.toString()}
                                  id={`q${questionIndex}-o${optionIndex}`}
                                />
                                <Label
                                  htmlFor={`q${questionIndex}-o${optionIndex}`}
                                  className="text-sm font-medium text-primary ltr:ml-2 rtl:mr-2"
                                >
                                  {String.fromCharCode(65 + optionIndex)}
                                </Label>
                                <Input
                                  placeholder={t('createGame.optionPlaceholder', { number: optionIndex + 1 })}
                                  value={getOptionText(option)}
                                  onChange={(e) =>
                                    updateQuestionOption(questionIndex, optionIndex, e.target.value)
                                  }
                                  className="flex-1 bg-white/70"
                                  data-testid={`input-option-${questionIndex}-${optionIndex}`}
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`img-${questionIndex}-${optionIndex}`}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const key = `q-${questionIndex}-o-${optionIndex}`;
                                    setUploadingImage(key);
                                    try {
                                      const url = await uploadImage(file);
                                      if (url) updateQuestionOptionImage(questionIndex, optionIndex, url);
                                    } catch (err) {
                                      toast({
                                        title: t('common.error'),
                                        description: (err as Error).message || t('createGame.errorUploadImage'),
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setUploadingImage(null);
                                    }
                                    e.target.value = '';
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0 bg-white/70 border border-gray-300 hover:bg-white"
                                  title={t('createGame.addImage')}
                                  onClick={() => document.getElementById(`img-${questionIndex}-${optionIndex}`)?.click()}
                                  disabled={uploadingImage === `q-${questionIndex}-o-${optionIndex}`}
                                >
                                  {uploadingImage === `q-${questionIndex}-o-${optionIndex}` ? (
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                                  ) : (
                                    <ImagePlus className="w-4 h-4" />
                                  )}
                                </Button>
                                {getOptionImage(option) && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQuestionOptionImage(questionIndex, optionIndex, null)}
                                    className="bg-white/70 border border-gray-300 hover:bg-white text-destructive hover:text-destructive shrink-0"
                                    title={t('createGame.removeImage')}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                                {question.options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeOption(questionIndex, optionIndex)}
                                    className="bg-white/70 border border-gray-300 hover:bg-white text-destructive hover:text-destructive shrink-0"
                                    data-testid={`button-remove-option-${questionIndex}-${optionIndex}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              {getOptionImage(option) && (
                                <div className="ltr:ml-8 rtl:mr-8">
                                  <img
                                    src={getOptionImage(option)}
                                    alt=""
                                    className="max-h-24 rounded object-contain border"
                                    aria-hidden
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </RadioGroup>

                        {/* Add/Remove Options */}
                        <div className="flex gap-2 mt-4">
                          {question.options.length < 6 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="bg-white/70 border border-gray-300 hover:bg-white"
                              onClick={() => addOption(questionIndex)}
                              data-testid={`button-add-option-${questionIndex}`}
                            >
                              <Plus className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                              {t('createGame.addOption')}
                            </Button>
                          )}
                          {questions.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuestion(questionIndex)}
                              className="bg-white/70 border border-gray-300 hover:bg-white text-destructive hover:text-destructive"
                              data-testid={`button-remove-question-${questionIndex}`}
                            >
                              <Trash2 className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                              {t('createGame.removeQuestion')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
              </CardContent>
            </Card>
        )}

        {contentMode === "excel" && (
            <Card className="mb-6 bg-amber-600/15 border-2 border-orange-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <FileSpreadsheet className="w-5 h-5" />
                  {t('createGame.importExcelTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    {t('createGame.uploadLabel')}
                  </Label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    disabled={isImporting}
                    className="cursor-pointer bg-white/70"
                    data-testid="input-excel-file"
                  />
                  <p className="text-sm text-primary mt-2">
                    {t('createGame.fileSupport')}
                  </p>
                </div>

                {/* Import Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      {t('createGame.questionCountReq')}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                      className="bg-white/70"
                      data-testid="input-question-count"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      {t('createGame.importMode')}
                    </Label>
                    <Select value={importMode} onValueChange={(value: 'replace' | 'append') => setImportMode(value)}>
                      <SelectTrigger className="bg-white/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="replace">{t('createGame.replace')}</SelectItem>
                        <SelectItem value="append">{t('createGame.append')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Import Status */}
                {importedQuestions.length > 0 && (
                  <div className="p-4 bg-orange-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary">
                          {t('createGame.importSuccess', { count: importedQuestions.length })}
                        </p>
                        <p className="text-sm text-accent mt-1">
                          {t('createGame.importSuccessDetail', { count: Math.min(questionCount, importedQuestions.length) })}
                        </p>
                      </div>
                      <Button
                        onClick={applyImportedQuestions}
                        className="bg-primary hover:bg-primary/80 text-primary-foreground"
                        data-testid="button-apply-questions"
                      >
                        <Upload className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                        {t('createGame.applyQuestions')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isImporting && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-blue-800 dark:text-blue-200">{t('createGame.processing')}</p>
                    </div>
                  </div>
                )}

                {/* Format Guide */}
                <div className="p-4 bg-orange-500/25 border border-orange-400/50 rounded-lg">
                  <h4 className="font-medium mb-2">{t('createGame.formatGuide')}</h4>
                  <div className="text-sm text-primary space-y-1">
                    <p>• {t('createGame.formatCol1')}</p>
                    <p>• {t('createGame.formatCol2')}</p>
                    <p>• {t('createGame.formatCol3')}</p>
                    <p>• {t('createGame.formatCol4')}</p>
                    <p>• {t('createGame.formatCol5')}</p>
                    <p>• {t('createGame.formatColLast')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-orange-500/20 border-t border-orange-400/50 backdrop-blur-sm p-4 z-40">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-primary">
                <span>{t('createGame.questionsCount', { count: questions.length })}</span>
                <span>•</span>
                <span>{questions.filter(getQuestionStatus).length} {t('createGame.completed')}</span>
              </div>
              <div className="flex gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={!validateQuestions()} data-testid="button-preview" className="bg-white hover:bg-white/95 text-primary">
                      <Eye className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                      {t('common.preview')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-orange-500/25 border-2 border-orange-400 backdrop-blur-sm">
                    <DialogHeader>
                      <DialogTitle>{t('createGame.previewTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border border-orange-400/50">
                        <h3 className="font-semibold text-lg mb-2">{gameName || t('createGame.newGame')}</h3>
                        <p className="text-sm text-primary">
                          {t('createGame.questionsCount', { count: questions.length })} • {questions.filter(getQuestionStatus).length} {t('createGame.completed')}
                        </p>
                      </div>
                      {questions.filter(getQuestionStatus).map((question, index) => (
                        <Card key={index} className="border border-orange-400/50 bg-white">
                          <CardContent className="pt-4">
                            <h4 className="font-medium mb-3">{t('createGame.question', { number: index + 1 })}</h4>
                            <p className="mb-3">{question.text}</p>
                            <div className="space-y-2">
                              {question.image && (
                                <img src={question.image} alt="" className="max-h-24 rounded object-contain mb-2" aria-hidden />
                              )}
                              {question.options.filter(opt => getOptionText(opt).trim()).map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded border flex items-start gap-2 ${optIndex === question.correctAnswer
                                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                                    : 'bg-muted'
                                    }`}
                                >
                                  <span className="font-medium shrink-0">{String.fromCharCode(65 + optIndex)}</span>
                                  <div className="min-w-0">
                                    {getOptionImage(option) && (
                                      <img src={getOptionImage(option)} alt="" className="max-h-16 rounded object-contain mb-1" aria-hidden />
                                    )}
                                    <span>{getOptionText(option)}</span>
                                  </div>
                                  {optIndex === question.correctAnswer && (
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={handleSubmit}
                  disabled={!gameName.trim() || !validateQuestions() || createGameMutation.isPending}
                  data-testid="button-create-game"
                  className="bg-white hover:bg-white/95 text-primary"
                >
                  {createGameMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ltr:mr-2 rtl:ml-2"></div>
                      {t('createGame.creating')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                      {t('createGame.createButton')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Padding for Sticky Bar */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}