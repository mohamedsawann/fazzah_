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
import { ArrowRight, Plus, Trash2, Upload, FileSpreadsheet, Eye, CheckCircle2, AlertCircle, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function CreateGame() {
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
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء اللعبة. يرجى المحاولة مرة أخرى.",
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
        title: "خطأ",
        description: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: "خطأ",
        description: "نوع الملف غير مدعوم. يرجى استخدام ملفات Excel (.xlsx أو .xls).",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const parsedQuestions = await parseExcelFile(file);
      
      if (parsedQuestions.length === 0) {
        toast({
          title: "تحذير",
          description: "لم يتم العثور على أسئلة صالحة في الملف. تأكد من تنسيق البيانات.",
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
        title: "تم بنجاح!",
        description: `تم استيراد ${parsedQuestions.length} سؤال من الملف.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Excel parsing error:', error);
      toast({
        title: "خطأ",
        description: "فشل في قراءة الملف. تأكد من تنسيق البيانات.",
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
        title: "تم التطبيق!",
        description: `تم استبدال الأسئلة بـ ${selectedQuestions.length} سؤال عشوائي.`,
        variant: "default",
      });
    } else {
      setQuestions(prev => [...prev, ...selectedQuestions]);
      toast({
        title: "تم التطبيق!",
        description: `تم إضافة ${selectedQuestions.length} سؤال عشوائي.`,
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
        title: "خطأ",
        description: "يرجى إدخال اسم اللعبة.",
        variant: "destructive",
      });
      return;
    }

    if (!validateQuestions()) {
      toast({
        title: "خطأ",
        description: "يرجى التأكد من إكمال جميع الأسئلة بشكل صحيح.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty options before submitting
    const cleanedQuestions = questions.map(q => ({
      ...q,
      options: q.options.filter(opt => opt.trim() !== "")
    }));

    createGameMutation.mutate({
      name: gameName,
      questions: cleanedQuestions,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5" dir="rtl">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-back"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة</span>
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8" data-testid="header-create-game">
          <h1 className="text-4xl font-bold text-primary mb-2">
            إنشاء لعبة جديدة
          </h1>
          <p className="text-muted-foreground">Create New Trivia Game</p>
        </div>

        {/* Game Name */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Label htmlFor="gameName" className="text-base font-medium mb-3 block">
              اسم اللعبة / Game Name
            </Label>
            <Input
              id="gameName"
              type="text"
              placeholder="أدخل اسم اللعبة"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="text-lg py-3"
              data-testid="input-game-name"
            />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual" className="text-base">
              الإنشاء اليدوي
            </TabsTrigger>
            <TabsTrigger value="excel" className="text-base">
              الاستيراد من Excel
            </TabsTrigger>
          </TabsList>

          {/* Manual Creation Tab */}
          <TabsContent value="manual" className="space-y-6">
            {/* Progress Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Badge variant={questions.length > 0 ? "default" : "secondary"}>
                      {questions.length} سؤال
                    </Badge>
                    <Badge variant={getCompletionProgress() === 100 ? "default" : "secondary"}>
                      {questions.filter(getQuestionStatus).length} مكتمل
                    </Badge>
                  </div>
                  <Button onClick={addQuestion} variant="outline" size="sm" data-testid="button-add-question">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة سؤال
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>التقدم</span>
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
                  className="border rounded-lg shadow-sm"
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
                          السؤال {questionIndex + 1}
                        </span>
                      </div>
                      <div className="flex-1 text-right">
                        {question.text ? (
                          <p className="text-sm text-muted-foreground truncate">
                            {question.text}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            اكتب سؤالك هنا...
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {question.options.filter(opt => opt.trim()).length} خيار
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="space-y-6">
                      {/* Question Text */}
                      <div>
                        <Label className="text-base font-medium mb-2 block">
                          نص السؤال
                        </Label>
                        <Textarea
                          placeholder="اكتب سؤالك هنا... يُنصح بسؤال قصير وواضح"
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
                          الخيارات المتاحة
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
                                className="text-sm font-medium text-muted-foreground ml-2"
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </Label>
                              <Input
                                placeholder={`الخيار ${optionIndex + 1}`}
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
                              <Plus className="w-4 h-4 ml-1" />
                              إضافة خيار
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
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف السؤال
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <FileSpreadsheet className="w-5 h-5" />
                  استيراد الأسئلة من Excel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    اختر ملف Excel
                  </Label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    disabled={isImporting}
                    className="cursor-pointer"
                    data-testid="input-excel-file"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    يدعم .xlsx و .xls (الحد الأقصى 5 ميجابايت)
                  </p>
                </div>

                {/* Import Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      عدد الأسئلة المطلوبة
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
                      طريقة الاستيراد
                    </Label>
                    <Select value={importMode} onValueChange={(value: 'replace' | 'append') => setImportMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="replace">استبدال الأسئلة الحالية</SelectItem>
                        <SelectItem value="append">إضافة إلى الأسئلة الحالية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Import Status */}
                {importedQuestions.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          تم استيراد {importedQuestions.length} سؤال بنجاح!
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                          سيتم اختيار {Math.min(questionCount, importedQuestions.length)} سؤال عشوائياً
                        </p>
                      </div>
                      <Button 
                        onClick={applyImportedQuestions}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-apply-questions"
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        تطبيق الأسئلة
                      </Button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isImporting && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-blue-800 dark:text-blue-200">جاري معالجة الملف...</p>
                    </div>
                  </div>
                )}

                {/* Format Guide */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">تنسيق الملف المطلوب:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• العمود الأول: السؤال أو Question</p>
                    <p>• العمود الثاني: الخيار 1 أو Option1</p>
                    <p>• العمود الثالث: الخيار 2 أو Option2</p>
                    <p>• العمود الرابع: الخيار 3 أو Option3 (اختياري)</p>
                    <p>• العمود الخامس: الخيار 4 أو Option4 (اختياري)</p>
                    <p>• العمود الأخير: الإجابة الصحيحة أو Correct (رقم 1-6 أو حرف A-F)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 z-40">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{questions.length} سؤال</span>
                <span>•</span>
                <span>{questions.filter(getQuestionStatus).length} مكتمل</span>
              </div>
              <div className="flex gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={!validateQuestions()} data-testid="button-preview">
                      <Eye className="w-4 h-4 ml-2" />
                      معاينة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>معاينة اللعبة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">{gameName || "لعبة جديدة"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {questions.length} سؤال • {questions.filter(getQuestionStatus).length} مكتمل
                        </p>
                      </div>
                      {questions.filter(getQuestionStatus).map((question, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <h4 className="font-medium mb-3">السؤال {index + 1}</h4>
                            <p className="mb-3">{question.text}</p>
                            <div className="space-y-2">
                              {question.options.filter(opt => opt.trim()).map((option, optIndex) => (
                                <div 
                                  key={optIndex}
                                  className={`p-2 rounded border ${
                                    optIndex === question.correctAnswer 
                                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                                      : 'bg-muted'
                                  }`}
                                >
                                  <span className="font-medium ml-2">{String.fromCharCode(65 + optIndex)}</span>
                                  {option}
                                  {optIndex === question.correctAnswer && (
                                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      إنشاء اللعبة
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