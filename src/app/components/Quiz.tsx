import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, Trophy } from "lucide-react";
import { Progress } from "./ui/progress";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export function Quiz() {
  const [questions] = useState<Question[]>([
    {
      id: "1",
      question: "¿Cuál es la fórmula química del agua?",
      options: ["H2O", "CO2", "O2", "H2O2"],
      correctAnswer: 0,
      explanation: "El agua está compuesta por dos átomos de hidrógeno y uno de oxígeno (H2O).",
    },
    {
      id: "2",
      question: "¿En qué año comenzó la Segunda Guerra Mundial?",
      options: ["1935", "1939", "1941", "1945"],
      correctAnswer: 1,
      explanation: "La Segunda Guerra Mundial comenzó el 1 de septiembre de 1939 con la invasión alemana de Polonia.",
    },
    {
      id: "3",
      question: "¿Cuál es la derivada de x²?",
      options: ["x", "2x", "x²", "2"],
      correctAnswer: 1,
      explanation: "La derivada de x² es 2x, aplicando la regla de potencias.",
    },
    {
      id: "4",
      question: "¿Qué orgánulo celular produce energía?",
      options: ["Núcleo", "Ribosoma", "Mitocondria", "Cloroplasto"],
      correctAnswer: 2,
      explanation: "La mitocondria es conocida como la 'central eléctrica' de la célula porque produce ATP.",
    },
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = (answeredCount / questions.length) * 100;

  const handleSelectAnswer = (answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (answeredCount < questions.length) {
      toast.error(`Por favor responde todas las preguntas (${answeredCount}/${questions.length})`);
      return;
    }
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const score = calculateScore();
  const percentage = (score / questions.length) * 100;

  const generateQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    toast.success("Quiz generado con IA");
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Generador de Quiz
            </h1>
            <p className="text-slate-600 mb-8">
              Genera quizzes personalizados basados en tus materiales de estudio
            </p>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Crear Nuevo Quiz</CardTitle>
                <CardDescription>
                  Selecciona un archivo de tu biblioteca para generar preguntas automáticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar archivo de la biblioteca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file1">Introducción a la Química Orgánica.pdf</SelectItem>
                    <SelectItem value="file2">Historia Mundial Siglo XX.docx</SelectItem>
                    <SelectItem value="file3">Matemáticas Avanzadas - Cálculo.pdf</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="10">
                  <SelectTrigger>
                    <SelectValue placeholder="Número de preguntas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 preguntas</SelectItem>
                    <SelectItem value="10">10 preguntas</SelectItem>
                    <SelectItem value="15">15 preguntas</SelectItem>
                    <SelectItem value="20">20 preguntas</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="mixed">
                  <SelectTrigger>
                    <SelectValue placeholder="Dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Intermedio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                    <SelectItem value="mixed">Mixto</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={generateQuiz} className="w-full gap-2" size="lg">
                  <Sparkles className="h-5 w-5" />
                  Generar Quiz con IA
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card className="mb-6">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-yellow-100 rounded-full">
                    <Trophy className="h-12 w-12 text-yellow-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl">¡Quiz Completado!</CardTitle>
                <CardDescription className="text-lg">
                  Tu puntuación: {score} / {questions.length} ({Math.round(percentage)}%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={percentage} className="h-3 mb-4" />
                {percentage >= 80 && (
                  <p className="text-center text-green-600 font-medium">
                    ¡Excelente trabajo! Dominas el material.
                  </p>
                )}
                {percentage >= 60 && percentage < 80 && (
                  <p className="text-center text-blue-600 font-medium">
                    ¡Bien hecho! Sigue practicando para mejorar.
                  </p>
                )}
                {percentage < 60 && (
                  <p className="text-center text-orange-600 font-medium">
                    Sigue estudiando. Revisa los temas que fallaste.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Revisión de Respuestas</h3>
              {questions.map((q, index) => {
                const userAnswer = selectedAnswers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <Card key={q.id}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            Pregunta {index + 1}: {q.question}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {q.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg border ${
                              optionIndex === q.correctAnswer
                                ? "bg-green-50 border-green-300"
                                : optionIndex === userAnswer && !isCorrect
                                ? "bg-red-50 border-red-300"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            {option}
                            {optionIndex === q.correctAnswer && (
                              <Badge className="ml-2" variant="outline">
                                Correcta
                              </Badge>
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <Badge className="ml-2" variant="destructive">
                                Tu respuesta
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-1">Explicación:</p>
                        <p className="text-sm text-blue-700">{q.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setQuizStarted(false)} className="flex-1">
                Crear Nuevo Quiz
              </Button>
              <Button variant="outline" onClick={() => {
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
              }} className="flex-1">
                Reintentar
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quiz en Progreso</CardTitle>
                <Badge variant="secondary">
                  {answeredCount} / {questions.length} respondidas
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge>Pregunta {currentQuestionIndex + 1} de {questions.length}</Badge>
                {selectedAnswers[currentQuestion.id] !== undefined && (
                  <Badge variant="outline">Respondida</Badge>
                )}
              </div>
              <CardTitle className="text-xl mt-4">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={selectedAnswers[currentQuestion.id]?.toString()}
                onValueChange={(value) => handleSelectAnswer(parseInt(value))}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Anterior
            </Button>
            <div className="flex-1" />
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Finalizar Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
