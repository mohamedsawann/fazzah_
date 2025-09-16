import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { ArrowRight, Plus, Trash2, Upload, FileSpreadsheet } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/soundUtils";
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
    setQuestions([...questions, { text: "", options: ["", "", "", ""], correctAnswer: 0 }]);
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

  const validateQuestions = () => {
    return questions.every(q => 
      q.text.trim() !== "" && 
      q.options.every(opt => opt.trim() !== "") &&
      q.correctAnswer >= 0 && q.correctAnswer < q.options.length
    );
  };

  // Fisher-Yates shuffle for random question selection
  const shuffleArray = function<T>(array: T[]): T[] {
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
        description: "يرجى التأكد من ملء جميع الأسئلة والخيارات بشكل صحيح.",
        variant: "destructive",
      });
      return;
    }

    createGameMutation.mutate({
      name: gameName,
      questions,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(0 0% 12%) 0%, hsl(25 60% 20%) 25%, hsl(35 50% 25%) 50%, hsl(25 60% 20%) 75%, hsl(0 0% 12%) 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }}></div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-0"
              data-testid="button-back"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة</span>
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8" data-testid="header-create-game">
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2 animate-pulse">
            إنشاء لعبة ✨
          </h2>
          <p className="text-muted-foreground">Create New Game</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Name */}
          <Card className="border border-primary/30 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <Label htmlFor="gameName" className="block text-sm font-medium mb-2">
                اسم اللعبة / Game Name
              </Label>
              <Input
                id="gameName"
                type="text"
                placeholder="أدخل اسم اللعبة"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                data-testid="input-game-name"
              />
            </CardContent>
          </Card>

          {/* Excel Import Section */}
          <Card className="border border-blue-500/30 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-card to-blue-500/5 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <FileSpreadsheet className="w-5 h-5" />
                استيراد من Excel / Import from Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">
                    اختر ملف Excel / Choose Excel File
                  </Label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    disabled={isImporting}
                    className="cursor-pointer"
                    data-testid="input-excel-file"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    يدعم .xlsx و .xls (الحد الأقصى 5 ميجابايت)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="questionCount" className="block text-sm font-medium mb-2">
                    عدد الأسئلة / Question Count
                  </Label>
                  <Input
                    id="questionCount"
                    type="number"
                    min="1"
                    max="100"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                    className="w-full"
                    data-testid="input-question-count"
                  />
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">
                  وضع الاستيراد / Import Mode
                </Label>
                <Select value={importMode} onValueChange={(value: 'replace' | 'append') => setImportMode(value)}>
                  <SelectTrigger data-testid="select-import-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="replace">استبدال الأسئلة الحالية / Replace Current</SelectItem>
                    <SelectItem value="append">إضافة للأسئلة الحالية / Append to Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {importedQuestions.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium mb-2">
                    ✅ تم استيراد {importedQuestions.length} سؤال بنجاح
                  </p>
                  <Button
                    type="button"
                    onClick={applyImportedQuestions}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-apply-imported"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    تطبيق الأسئلة المستوردة / Apply Imported
                  </Button>
                </div>
              )}

              {isImporting && (
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    ⚡ جارٍ معالجة الملف... / Processing file...
                  </p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                <p className="font-medium mb-2">تنسيق ملف Excel المطلوب / Required Excel Format:</p>
                <ul className="space-y-1">
                  <li>• Question/السؤال: نص السؤال</li>
                  <li>• Option1-Option6/الخيار 1-6: الخيارات (على الأقل خياران)</li>
                  <li>• Correct/الإجابة الصحيحة: رقم الإجابة (1-6) أو حرف (A-F)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="border border-accent/30 shadow-lg shadow-accent/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.01]">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      السؤال {questionIndex + 1} / Question {questionIndex + 1}
                    </h3>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-question-${questionIndex}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium mb-2">
                        نص السؤال / Question Text
                      </Label>
                      <Input
                        type="text"
                        placeholder="اكتب السؤال هنا..."
                        value={question.text}
                        onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                        className="w-full bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        data-testid={`input-question-text-${questionIndex}`}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-2">
                        الخيارات / Options
                      </Label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2 items-center">
                            <Input
                              type="text"
                              placeholder={`الخيار ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                              className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                              data-testid={`input-option-${questionIndex}-${optionIndex}`}
                            />
                            <Button
                              type="button"
                              variant={question.correctAnswer === optionIndex ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                              className="min-w-[80px]"
                              data-testid={`button-correct-answer-${questionIndex}-${optionIndex}`}
                            >
                              {question.correctAnswer === optionIndex ? "صحيح" : "اختر"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Question Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              playSound.buttonClick();
              addQuestion();
            }}
            className="w-full bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.02] hover:rotate-1"
            data-testid="button-add-question"
          >
            <Plus className="w-5 h-5 mr-2 animate-bounce" />
            إضافة سؤال جديد ➕ / Add New Question
          </Button>

          {/* Create Game Button */}
          <Button
            type="submit"
            disabled={createGameMutation.isPending || !gameName.trim() || !validateQuestions()}
            onClick={playSound.buttonClick}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-[1.02] hover:-rotate-1"
            data-testid="button-create-game"
          >
            {createGameMutation.isPending ? "جارٍ الإنشاء... ⚡" : "إنشاء اللعبة 🎮"}
          </Button>
        </form>
      </div>
    </div>
  );
}