import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import {
  ArrowLeft,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../../contexts/UserContext';
import { aiAPI } from '../../utils/api';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  mastered: boolean;
}

interface EvaluationResult {
  cardId: string;
  userAnswer: string;
  status: 'correct' | 'partial' | 'incorrect';
  feedback: string;
  missingPoints?: string[];
  score: number;
  attempts: number;
}

export function Flashcards() {
  const { user } = useUser();
  const [mode, setMode] = useState<'study' | 'evaluate'>('study');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: '1',
      front: '¿Qué es la fotosíntesis?',
      back: 'Proceso por el cual las plantas convierten la luz solar, agua y dióxido de carbono en glucosa y oxígeno.',
      category: 'Biología',
      mastered: false,
    },
    {
      id: '2',
      front: 'Fórmula del teorema de Pitágoras',
      back: 'a² + b² = c², donde c es la hipotenusa del triángulo rectángulo.',
      category: 'Matemáticas',
      mastered: true,
    },
    {
      id: '3',
      front: '¿Cuál fue la causa principal de la Primera Guerra Mundial?',
      back: 'El asesinato del archiduque Francisco Fernando de Austria en Sarajevo, combinado con alianzas políticas complejas y tensiones imperialistas.',
      category: 'Historia',
      mastered: false,
    },
    {
      id: '4',
      front: '¿Qué es un enlace covalente?',
      back: 'Un enlace químico en el que dos átomos comparten uno o más pares de electrones.',
      category: 'Química',
      mastered: false,
    },
    {
      id: '5',
      front: '¿Qué es la homeostasis?',
      back: 'Conjunto de fenómenos de autorregulación que intentan mantener equilibradas las composiciones y propiedades del organismo.',
      category: 'Biología',
      mastered: false,
    },
  ]);

  // Study mode state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Evaluation mode state
  const [evaluationCards, setEvaluationCards] = useState<Flashcard[]>([]);
  const [currentEvalIndex, setCurrentEvalIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);
  const [secondChanceCards, setSecondChanceCards] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentCard = mode === 'study' ? flashcards[currentIndex] : evaluationCards[currentEvalIndex];
  const masteredCount = flashcards.filter((c) => c.mastered).length;
  const progress = (masteredCount / flashcards.length) * 100;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const toggleMastered = () => {
    if (currentCard) {
      setFlashcards(
        flashcards.map((card) =>
          card.id === currentCard.id ? { ...card, mastered: !card.mastered } : card
        )
      );
      toast.success(currentCard.mastered ? 'Marcada como no dominada' : '¡Tarjeta dominada!');
    }
  };

  const startEvaluation = () => {
    // Select at least 4 random cards
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(4, flashcards.length));

    setEvaluationCards(selected);
    setCurrentEvalIndex(0);
    setUserAnswer('');
    setEvaluationResults([]);
    setSecondChanceCards([]);
    setIsCompleted(false);
    setMode('evaluate');
    toast.info('Micro-evaluación iniciada. ¡Escribe tus respuestas!');
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Por favor escribe una respuesta');
      return;
    }

    const card = evaluationCards[currentEvalIndex];
    setIsEvaluating(true);
    setShowResult(false);

    try {
      const evaluation = await aiAPI.evaluateFlashcard(
        userAnswer,
        card.back,
        card.front,
        user?.career
      );

      const existingResult = evaluationResults.find((r) => r.cardId === card.id);
      const attempts = existingResult ? existingResult.attempts + 1 : 1;

      const result: EvaluationResult = {
        cardId: card.id,
        userAnswer,
        status: evaluation.status,
        feedback: evaluation.feedback,
        missingPoints: evaluation.missingPoints,
        score: evaluation.score,
        attempts,
      };

      // Update or add result
      const updatedResults = evaluationResults.filter((r) => r.cardId !== card.id);
      setEvaluationResults([...updatedResults, result]);
      setCurrentResult(result);
      setShowResult(true);

      // If incorrect and first attempt, mark for second chance
      if (evaluation.status === 'incorrect' && attempts === 1) {
        if (!secondChanceCards.includes(card.id)) {
          setSecondChanceCards([...secondChanceCards, card.id]);
        }
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      toast.error('Error al evaluar respuesta. Verifica tu API key de OpenAI.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextEvaluationCard = () => {
    setShowResult(false);
    setUserAnswer('');

    if (currentEvalIndex < evaluationCards.length - 1) {
      setCurrentEvalIndex(currentEvalIndex + 1);
    } else {
      // Check if there are cards for second chance
      if (secondChanceCards.length > 0) {
        // Filter cards that need second chance and haven't been retried yet
        const cardsNeedingRetry = evaluationCards.filter((card) => {
          const result = evaluationResults.find((r) => r.cardId === card.id);
          return secondChanceCards.includes(card.id) && result && result.attempts === 1;
        });

        if (cardsNeedingRetry.length > 0) {
          setEvaluationCards(cardsNeedingRetry);
          setCurrentEvalIndex(0);
          toast.info('Segunda oportunidad para las tarjetas incorrectas');
        } else {
          setIsCompleted(true);
        }
      } else {
        setIsCompleted(true);
      }
    }
  };

  const finishEvaluation = () => {
    setMode('study');
    setEvaluationCards([]);
    setEvaluationResults([]);
    setSecondChanceCards([]);

    const avgScore =
      evaluationResults.reduce((sum, r) => sum + r.score, 0) / evaluationResults.length;

    if (avgScore >= 80) {
      toast.success(`¡Excelente! Promedio: ${Math.round(avgScore)}%`);
    } else if (avgScore >= 60) {
      toast.info(`Buen trabajo. Promedio: ${Math.round(avgScore)}%`);
    } else {
      toast('Sigue practicando. Promedio: ' + Math.round(avgScore) + '%');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Volver</span>
              </Link>
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-base font-bold text-slate-900">Flashcards</h1>
              {mode === 'evaluate' && (
                <p className="text-xs text-slate-500">Modo Evaluación</p>
              )}
            </div>
            <div className="w-16 sm:w-auto">
              {mode === 'study' && (
                <Button size="sm" onClick={startEvaluation} className="gap-1">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Evaluar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Progress */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {mode === 'study' ? 'Tu Progreso' : 'Evaluación'}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {mode === 'study'
                  ? `${masteredCount} / ${flashcards.length} dominadas`
                  : `${currentEvalIndex + 1} / ${evaluationCards.length}`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {mode === 'study' ? (
              <>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-slate-600 mt-2">{Math.round(progress)}% completado</p>
              </>
            ) : (
              <>
                <Progress
                  value={((currentEvalIndex + 1) / evaluationCards.length) * 100}
                  className="h-2"
                />
                <p className="text-xs text-slate-600 mt-2">
                  {evaluationResults.length} evaluadas
                  {secondChanceCards.length > 0 && ` • ${secondChanceCards.length} para repetir`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Study Mode */}
        {mode === 'study' && currentCard && (
          <>
            <div className="mb-6 perspective-1000">
              <div
                className={`relative w-full h-80 cursor-pointer transition-transform duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front */}
                <Card
                  className="absolute w-full h-full backface-hidden shadow-xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge>{currentCard.category}</Badge>
                      <span className="text-sm text-slate-500">
                        {currentIndex + 1} / {flashcards.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-48">
                    <p className="text-2xl text-center font-medium text-slate-900">
                      {currentCard.front}
                    </p>
                  </CardContent>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-sm text-slate-500">Toca para ver la respuesta</p>
                  </div>
                </Card>

                {/* Back */}
                <Card
                  className="absolute w-full h-full backface-hidden bg-blue-50 shadow-xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{currentCard.category}</Badge>
                      <span className="text-sm text-slate-500">
                        {currentIndex + 1} / {flashcards.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-48">
                    <p className="text-xl text-center text-slate-900">{currentCard.back}</p>
                  </CardContent>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-sm text-slate-500">Toca para voltear</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Study Mode Controls */}
            <div className="flex gap-3 justify-center mb-4">
              <Button
                onClick={handlePrevious}
                variant="outline"
                size="lg"
                disabled={flashcards.length <= 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setIsFlipped(!isFlipped)}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <RotateCw className="h-5 w-5" />
                <span className="hidden sm:inline">Voltear</span>
              </Button>
              <Button onClick={handleNext} variant="outline" size="lg" disabled={flashcards.length <= 1}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={toggleMastered}
                variant={currentCard.mastered ? 'secondary' : 'default'}
                size="sm"
              >
                {currentCard.mastered ? 'No dominada' : 'Marcar dominada'}
              </Button>
            </div>
          </>
        )}

        {/* Evaluation Mode */}
        {mode === 'evaluate' && !isCompleted && currentCard && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge>{currentCard.category}</Badge>
                  <span className="text-sm text-slate-500">
                    Pregunta {currentEvalIndex + 1} / {evaluationCards.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                  <p className="text-xl font-medium text-slate-900 text-center">
                    {currentCard.front}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Tu respuesta:</label>
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    rows={4}
                    className="resize-none"
                    disabled={showResult}
                  />

                  {!showResult && (
                    <Button
                      onClick={submitAnswer}
                      disabled={isEvaluating || !userAnswer.trim()}
                      className="w-full gap-2"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Evaluando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Verificar Respuesta
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Evaluation Result */}
            {showResult && currentResult && (
              <Card
                className={`mb-6 ${
                  currentResult.status === 'correct'
                    ? 'border-green-300 bg-green-50'
                    : currentResult.status === 'partial'
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-red-300 bg-red-50'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentResult.status === 'correct' && (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <span className="text-green-900">¡Correcto!</span>
                      </>
                    )}
                    {currentResult.status === 'partial' && (
                      <>
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                        <span className="text-yellow-900">Parcialmente Correcto</span>
                      </>
                    )}
                    {currentResult.status === 'incorrect' && (
                      <>
                        <XCircle className="h-6 w-6 text-red-600" />
                        <span className="text-red-900">
                          {currentResult.attempts === 1 ? 'Incorrecto' : 'Segunda oportunidad'}
                        </span>
                      </>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Progress value={currentResult.score} className="h-2 flex-1" />
                    <Badge variant="outline">{currentResult.score}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Feedback:</p>
                    <p className="text-sm text-slate-900">{currentResult.feedback}</p>
                  </div>

                  {currentResult.missingPoints && currentResult.missingPoints.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Puntos a mejorar:</p>
                      <ul className="space-y-1">
                        {currentResult.missingPoints.map((point, idx) => (
                          <li key={idx} className="text-sm text-slate-800 flex items-start gap-2">
                            <span className="text-orange-600">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-sm font-medium text-slate-700 mb-1">Respuesta correcta:</p>
                    <p className="text-sm text-slate-900">{currentCard.back}</p>
                  </div>

                  <Button onClick={nextEvaluationCard} className="w-full gap-2">
                    {currentEvalIndex < evaluationCards.length - 1
                      ? 'Siguiente Tarjeta'
                      : secondChanceCards.length > 0 &&
                        secondChanceCards.includes(currentCard.id) &&
                        currentResult.attempts === 1
                      ? 'Continuar'
                      : 'Ver Resultados'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Evaluation Completed */}
        {mode === 'evaluate' && isCompleted && (
          <Card className="border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Evaluación Completada
              </CardTitle>
              <CardDescription>Resumen de tu desempeño</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluationResults.map((result) => {
                const card = evaluationCards.find((c) => c.id === result.cardId);
                if (!card) return null;

                return (
                  <div
                    key={result.cardId}
                    className="bg-white rounded-lg p-4 border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-medium text-slate-900 flex-1">{card.front}</p>
                      <Badge
                        variant={
                          result.status === 'correct'
                            ? 'default'
                            : result.status === 'partial'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {result.score}%
                      </Badge>
                    </div>
                    {result.attempts > 1 && (
                      <p className="text-xs text-slate-500">
                        Intentos: {result.attempts} (segunda oportunidad usada)
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t">
                <p className="text-center text-sm text-slate-700 mb-4">
                  Promedio:{' '}
                  {Math.round(
                    evaluationResults.reduce((sum, r) => sum + r.score, 0) /
                      evaluationResults.length
                  )}
                  %
                </p>
                <Button onClick={finishEvaluation} className="w-full">
                  Finalizar Evaluación
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
