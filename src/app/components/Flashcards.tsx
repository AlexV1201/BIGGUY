import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, RotateCw, ChevronLeft, ChevronRight, Sparkles, Plus } from "lucide-react";
import { Progress } from "./ui/progress";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  mastered: boolean;
}

export function Flashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: "1",
      front: "¿Qué es la fotosíntesis?",
      back: "Proceso por el cual las plantas convierten la luz solar, agua y dióxido de carbono en glucosa y oxígeno.",
      category: "Biología",
      mastered: false,
    },
    {
      id: "2",
      front: "Fórmula del teorema de Pitágoras",
      back: "a² + b² = c², donde c es la hipotenusa del triángulo rectángulo.",
      category: "Matemáticas",
      mastered: true,
    },
    {
      id: "3",
      front: "¿Cuál fue la causa principal de la Primera Guerra Mundial?",
      back: "El asesinato del archiduque Francisco Fernando de Austria en Sarajevo, combinado con alianzas políticas complejas y tensiones imperialistas.",
      category: "Historia",
      mastered: false,
    },
    {
      id: "4",
      front: "¿Qué es un enlace covalente?",
      back: "Un enlace químico en el que dos átomos comparten uno o más pares de electrones.",
      category: "Química",
      mastered: false,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedFile, setSelectedFile] = useState("");

  const filteredCards = flashcards.filter(
    (card) => categoryFilter === "all" || card.category === categoryFilter
  );

  const currentCard = filteredCards[currentIndex];
  const categories = ["all", ...Array.from(new Set(flashcards.map((c) => c.category)))];
  const masteredCount = flashcards.filter((c) => c.mastered).length;
  const progress = (masteredCount / flashcards.length) * 100;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const toggleMastered = () => {
    if (currentCard) {
      setFlashcards(
        flashcards.map((card) =>
          card.id === currentCard.id ? { ...card, mastered: !card.mastered } : card
        )
      );
      toast.success(
        currentCard.mastered ? "Marcada como no dominada" : "¡Tarjeta dominada!"
      );
    }
  };

  const generateFlashcards = () => {
    const newCards: Flashcard[] = [
      {
        id: `${Date.now()}-1`,
        front: "¿Qué es la mitosis?",
        back: "Proceso de división celular que resulta en dos células hijas genéticamente idénticas.",
        category: "Biología",
        mastered: false,
      },
      {
        id: `${Date.now()}-2`,
        front: "Ley de Newton: Primera Ley",
        back: "Un objeto en reposo permanece en reposo y un objeto en movimiento permanece en movimiento a menos que actúe sobre él una fuerza externa.",
        category: "Física",
        mastered: false,
      },
    ];

    setFlashcards([...flashcards, ...newCards]);
    toast.success(`${newCards.length} tarjetas generadas con IA`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generar con IA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generar Tarjetas con IA</DialogTitle>
                  <DialogDescription>
                    Selecciona un archivo y la IA creará tarjetas de memorización automáticamente
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedFile} onValueChange={setSelectedFile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar archivo de la biblioteca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file1">Introducción a la Química Orgánica.pdf</SelectItem>
                      <SelectItem value="file2">Historia Mundial Siglo XX.docx</SelectItem>
                      <SelectItem value="file3">Matemáticas Avanzadas - Cálculo.pdf</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={generateFlashcards} className="w-full">
                    Generar Tarjetas
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Tarjetas de Memorización
            </h1>
            <p className="text-slate-600">
              Aprende de forma efectiva con repetición espaciada
            </p>
          </div>

          {/* Progress */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tu Progreso</CardTitle>
                <Badge variant="secondary">
                  {masteredCount} / {flashcards.length} dominadas
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-slate-600 mt-2">
                {Math.round(progress)}% completado
              </p>
            </CardContent>
          </Card>

          {/* Filter */}
          <div className="mb-6">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "Todas las categorías" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Flashcard */}
          {filteredCards.length > 0 && currentCard ? (
            <>
              <div className="mb-6 perspective-1000">
                <div
                  className={`relative w-full h-80 cursor-pointer transition-transform duration-500 transform-style-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front */}
                  <Card
                    className="absolute w-full h-full backface-hidden shadow-xl"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge>{currentCard.category}</Badge>
                        <span className="text-sm text-slate-500">
                          {currentIndex + 1} / {filteredCards.length}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48">
                      <p className="text-2xl text-center font-medium text-slate-900">
                        {currentCard.front}
                      </p>
                    </CardContent>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <p className="text-sm text-slate-500">
                        Haz clic para ver la respuesta
                      </p>
                    </div>
                  </Card>

                  {/* Back */}
                  <Card
                    className="absolute w-full h-full backface-hidden bg-blue-50 shadow-xl"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{currentCard.category}</Badge>
                        <span className="text-sm text-slate-500">
                          {currentIndex + 1} / {filteredCards.length}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48">
                      <p className="text-xl text-center text-slate-900">
                        {currentCard.back}
                      </p>
                    </CardContent>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <p className="text-sm text-slate-500">
                        Haz clic para voltear
                      </p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3 justify-center mb-4">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  size="lg"
                  disabled={filteredCards.length <= 1}
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
                  Voltear
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="lg"
                  disabled={filteredCards.length <= 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={toggleMastered}
                  variant={currentCard.mastered ? "secondary" : "default"}
                  className="gap-2"
                >
                  {currentCard.mastered ? "Marcar como no dominada" : "Marcar como dominada"}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600 mb-4">
                  No hay tarjetas en esta categoría
                </p>
                <Button onClick={() => setCategoryFilter("all")}>
                  Ver todas las tarjetas
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
