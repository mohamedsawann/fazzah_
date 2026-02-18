import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload, FileSpreadsheet, Eye, CheckCircle2, AlertCircle, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import * as XLSX from 'xlsx';

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function CreateGame() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [gameName, setGameName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: ["", "", "", ""], correctAnswer: 0 }
  ]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Excel import states
  const [isImporting, setIsImporting] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState<Question[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  const createGameMutation = useMutation({
    mutationFn: async (gameData: { name: string; questions: Question[] }) => {
      const response = await apiRequest("POST", "/api/games", gameData);
      return response.json();
    },
    onSuccess: (game) => {
      setLocation(`/game-created?gameId=${game.id}`);
    },
    onError: (error: any) => {
      console.error("Game creation error:", error);
      toast({
        title: t('common.error'),
        description: t('createGame.errorCreateGame'),
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", ""], correctAnswer: 0 }]);
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
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length < 6) {
      updatedQuestions[questionIndex].options.push("");
      setQuestions(updatedQuestions);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      // Adjust correct answer if needed
      if (updatedQuestions[questionIndex].correctAnswer >= optionIndex) {
        updatedQuestions[questionIndex].correctAnswer = Math.max(0, updatedQuestions[questionIndex].correctAnswer - 1);
      }
      setQuestions(updatedQuestions);
    }
  };

  const validateQuestions = () => {
    return questions.every(q => {
      const validOptions = q.options.filter(opt => opt.trim() !== "");
      return q.text.trim() !== "" &&
        validOptions.length >= 2 &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < validOptions.length;
    });
  };

  const getQuestionStatus = (question: Question) => {
    const validOptions = question.options.filter(opt => opt.trim() !== "");
    const isValid = question.text.trim() !== "" &&
      validOptions.length >= 2 &&
      question.correctAnswer >= 0 &&
      question.correctAnswer < validOptions.length;
    return isValid;
  };

  const getCompletionProgress = () => {
    const completedQuestions = questions.filter(getQuestionStatus).length;
    return (completedQuestions / questions.length) * 100;
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

    // Randomly select questions
    const shuffled = shuffleArray(importedQuestions);
    const selectedQuestions = shuffled.slice(0, questionCount);

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
      const validOptions = q.options.map((opt, index) => ({ opt: opt.trim(), originalIndex: index }))
        .filter(({ opt }) => opt !== "");

      // Find the new index of the correct answer after filtering
      const newCorrectAnswerIndex = validOptions.findIndex(({ originalIndex }) => originalIndex === q.correctAnswer);

      return {
        ...q,
        options: validOptions.map(({ opt }) => opt),
        correctAnswer: Math.max(0, newCorrectAnswerIndex) // Fallback to 0 if not found
      };
    });

    createGameMutation.mutate({
      name: gameName,
      questions: cleanedQuestions,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden trivia-background">
      {/* Stronger overlay for better content readability */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors bg-background/60 backdrop-blur-sm"
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

        {/* Game Name */}
        <Card className="mb-6 border-2 border-primary/50 shadow-2xl shadow-primary/40 bg-gradient-to-br from-card/95 to-primary/10 backdrop-blur-md hover:shadow-primary/60 transition-all duration-300">
          <CardContent className="pt-6">
            <Label htmlFor="gameName" className="text-lg font-semibold mb-4 block text-primary">
              {t('createGame.gameNameLabel')}
            </Label>
            <Input
              id="gameName"
              type="text"
              placeholder={t('createGame.gameNamePlaceholder')}
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="text-lg py-4 bg-background/90 border-2 border-primary/50 focus:ring-4 focus:ring-primary/50 shadow-lg"
              data-testid="input-game-name"
            />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual" className="text-base">
              {t('createGame.manualTab')}
            </TabsTrigger>
            <TabsTrigger value="excel" className="text-base">
              {t('createGame.excelTab')}
            </TabsTrigger>
          </TabsList>

          {/* Manual Creation Tab */}
          <TabsContent value="manual" className="space-y-6">
            {/* Progress Summary */}
            <Card className="border-2 border-primary/50 shadow-2xl shadow-primary/40 bg-gradient-to-br from-card/95 to-primary/10 backdrop-blur-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Badge variant={questions.length > 0 ? "default" : "secondary"}>
                      {t('createGame.questionsCount', { count: questions.length })}
                    </Badge>
                    <Badge variant={getCompletionProgress() === 100 ? "default" : "secondary"}>
                      {questions.filter(getQuestionStatus).length} {t('createGame.completed')}
                    </Badge>
                  </div>
                  <Button onClick={addQuestion} variant="outline" size="sm" data-testid="button-add-question">
                    <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    {t('createGame.addQuestion')}
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-primary">
                    <span>{t('createGame.progress')}</span>
                    <span>{Math.round(getCompletionProgress())}%</span>
                  </div>
                  <Progress value={getCompletionProgress()} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Questions Accordion */}
            <Accordion type="multiple" className="space-y-4" defaultValue={["item-0"]}>
              {questions.map((question, questionIndex) => (
                <AccordionItem
                  key={questionIndex}
                  value={`item-${questionIndex}`}
                  className="border-2 border-primary/40 rounded-lg shadow-xl bg-gradient-to-br from-card/95 to-accent/10 backdrop-blur-sm hover:shadow-primary/50 transition-all duration-300"
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
                        ) : (
                          <p className="text-sm text-primary italic">
                            {t('createGame.questionPlaceholder')}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ltr:ml-2 rtl:mr-2">
                        {question.options.filter(opt => opt.trim()).length} {t('createGame.options')}
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
                          className="min-h-[80px]"
                          data-testid={`textarea-question-${questionIndex}`}
                        />
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
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
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
                                value={option}
                                onChange={(e) =>
                                  updateQuestionOption(questionIndex, optionIndex, e.target.value)
                                }
                                className="flex-1"
                                data-testid={`input-option-${questionIndex}-${optionIndex}`}
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  className="text-destructive hover:text-destructive"
                                  data-testid={`button-remove-option-${questionIndex}-${optionIndex}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
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
                              className="text-destructive hover:text-destructive"
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
          </TabsContent>

          {/* Excel Import Tab */}
          <TabsContent value="excel" className="space-y-6">
            <Card className="border-2 border-accent/50 shadow-2xl shadow-accent/40 bg-gradient-to-br from-card/95 to-accent/10 backdrop-blur-md">
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
                    className="cursor-pointer"
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
                      data-testid="input-question-count"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      {t('createGame.importMode')}
                    </Label>
                    <Select value={importMode} onValueChange={(value: 'replace' | 'append') => setImportMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="replace">{t('createGame.replace')}</SelectItem>
                        <SelectItem value="append">{t('createGame.append')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Import Status */}
                {importedQuestions.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg">
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
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
                <div className="p-4 bg-muted rounded-lg">
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
          </TabsContent>
        </Tabs>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-md border-t-2 border-primary/50 shadow-2xl p-4 z-40">
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
                    <Button variant="outline" disabled={!validateQuestions()} data-testid="button-preview">
                      <Eye className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                      {t('common.preview')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t('createGame.previewTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">{gameName || t('createGame.newGame')}</h3>
                        <p className="text-sm text-primary">
                          {t('createGame.questionsCount', { count: questions.length })} • {questions.filter(getQuestionStatus).length} {t('createGame.completed')}
                        </p>
                      </div>
                      {questions.filter(getQuestionStatus).map((question, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <h4 className="font-medium mb-3">{t('createGame.question', { number: index + 1 })}</h4>
                            <p className="mb-3">{question.text}</p>
                            <div className="space-y-2">
                              {question.options.filter(opt => opt.trim()).map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded border ${optIndex === question.correctAnswer
                                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                                    : 'bg-muted'
                                    }`}
                                >
                                  <span className="font-medium ltr:mr-2 rtl:ml-2">{String.fromCharCode(65 + optIndex)}</span>
                                  {option}
                                  {optIndex === question.correctAnswer && (
                                    <CheckCircle2 className="w-4 h-4 text-primary ltr:ml-2 rtl:mr-2 inline" />
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
                >
                  {createGameMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ltr:mr-2 rtl:ml-2"></div>
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