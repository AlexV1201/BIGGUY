import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, FileText, Download, Sparkles, CheckSquare, List, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Topic {
  id: string;
  name: string;
  selected: boolean;
}

export function Evaluations() {
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", name: "Introducción y conceptos básicos", selected: true },
    { id: "2", name: "Teoría fundamental", selected: true },
    { id: "3", name: "Aplicaciones prácticas", selected: false },
    { id: "4", name: "Casos de estudio", selected: false },
    { id: "5", name: "Ejercicios avanzados", selected: true },
  ]);

  const [evaluationType, setEvaluationType] = useState("comprehensive");
  const [questionCount, setQuestionCount] = useState("10");
  const [includeEssay, setIncludeEssay] = useState(true);
  const [generatedEvaluation, setGeneratedEvaluation] = useState<any>(null);

  const toggleTopic = (id: string) => {
    setTopics(topics.map(t => 
      t.id === id ? { ...t, selected: !t.selected } : t
    ));
  };

  const generateEvaluation = () => {
    const selectedTopics = topics.filter(t => t.selected);
    
    if (selectedTopics.length === 0) {
      toast.error("Selecciona al menos un tema");
      return;
    }

    const evaluation = {
      title: "Evaluación Integral - " + new Date().toLocaleDateString("es"),
      type: evaluationType,
      sections: [
        {
          title: "Sección I: Opción Múltiple",
          type: "multiple-choice",
          questions: [
            {
              number: 1,
              text: "¿Cuál de las siguientes afirmaciones describe mejor el concepto principal del tema?",
              options: [
                "A) Es un proceso que ocurre naturalmente",
                "B) Es un concepto teórico sin aplicación práctica",
                "C) Es fundamental para comprender los fenómenos relacionados",
                "D) Es una teoría obsoleta"
              ],
              points: 2
            },
            {
              number: 2,
              text: "La relación entre los conceptos estudiados se puede describir como:",
              options: [
                "A) Independiente",
                "B) Complementaria",
                "C) Contradictoria",
                "D) Irrelevante"
              ],
              points: 2
            },
          ]
        },
        {
          title: "Sección II: Verdadero o Falso",
          type: "true-false",
          questions: [
            { number: 1, text: "El concepto principal tiene aplicaciones en múltiples disciplinas.", points: 1 },
            { number: 2, text: "La teoría fundamental fue desarrollada en el siglo XIX.", points: 1 },
            { number: 3, text: "Los casos de estudio demuestran la validez del concepto.", points: 1 },
          ]
        },
        {
          title: "Sección III: Respuesta Corta",
          type: "short-answer",
          questions: [
            { number: 1, text: "Define el concepto principal con tus propias palabras.", points: 3 },
            { number: 2, text: "Explica la importancia de esta teoría en el contexto actual.", points: 3 },
            { number: 3, text: "Menciona tres aplicaciones prácticas del concepto estudiado.", points: 4 },
          ]
        }
      ]
    };

    if (includeEssay) {
      evaluation.sections.push({
        title: "Sección IV: Desarrollo",
        type: "essay",
        questions: [
          {
            number: 1,
            text: "Analiza de manera crítica el impacto del concepto estudiado en su campo de aplicación. Incluye ejemplos concretos y argumenta tu posición respecto a su relevancia.",
            points: 10,
            guidelines: "Extensión mínima: 200 palabras. Incluye introducción, desarrollo y conclusión."
          }
        ]
      });
    }

    setGeneratedEvaluation(evaluation);
    toast.success("Evaluación generada exitosamente");
  };

  const getTotalPoints = () => {
    if (!generatedEvaluation) return 0;
    return generatedEvaluation.sections.reduce((total: number, section: any) => {
      return total + section.questions.reduce((sectionTotal: number, q: any) => sectionTotal + q.points, 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
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
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Generador de Evaluaciones
            </h1>
            <p className="text-slate-600">
              Crea evaluaciones completas y personalizadas para medir tu progreso
            </p>
          </div>

          <Tabs defaultValue="create" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Crear Evaluación</TabsTrigger>
              <TabsTrigger value="preview" disabled={!generatedEvaluation}>
                Vista Previa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de la Evaluación</CardTitle>
                  <CardDescription>
                    Personaliza los parámetros de tu evaluación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="eval-type">Tipo de Evaluación</Label>
                      <Select value={evaluationType} onValueChange={setEvaluationType}>
                        <SelectTrigger id="eval-type" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprehensive">Integral</SelectItem>
                          <SelectItem value="midterm">Examen Parcial</SelectItem>
                          <SelectItem value="final">Examen Final</SelectItem>
                          <SelectItem value="practice">Práctica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="question-count">Número de Preguntas</Label>
                      <Select value={questionCount} onValueChange={setQuestionCount}>
                        <SelectTrigger id="question-count" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 preguntas</SelectItem>
                          <SelectItem value="20">20 preguntas</SelectItem>
                          <SelectItem value="30">30 preguntas</SelectItem>
                          <SelectItem value="50">50 preguntas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="source-file">Archivo Fuente</Label>
                    <Select>
                      <SelectTrigger id="source-file" className="mt-2">
                        <SelectValue placeholder="Seleccionar archivo de la biblioteca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="file1">Introducción a la Química Orgánica.pdf</SelectItem>
                        <SelectItem value="file2">Historia Mundial Siglo XX.docx</SelectItem>
                        <SelectItem value="file3">Matemáticas Avanzadas - Cálculo.pdf</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-essay" 
                      checked={includeEssay}
                      onCheckedChange={(checked) => setIncludeEssay(checked as boolean)}
                    />
                    <Label htmlFor="include-essay" className="cursor-pointer">
                      Incluir pregunta de desarrollo
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seleccionar Temas</CardTitle>
                  <CardDescription>
                    Elige los temas que quieres incluir en la evaluación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topics.map(topic => (
                      <div key={topic.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                        <Checkbox
                          id={topic.id}
                          checked={topic.selected}
                          onCheckedChange={() => toggleTopic(topic.id)}
                        />
                        <Label htmlFor={topic.id} className="flex-1 cursor-pointer">
                          {topic.name}
                        </Label>
                        {topic.selected && (
                          <Badge variant="secondary">Seleccionado</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={generateEvaluation} size="lg" className="w-full gap-2">
                <Sparkles className="h-5 w-5" />
                Generar Evaluación con IA
              </Button>
            </TabsContent>

            <TabsContent value="preview">
              {generatedEvaluation && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl mb-2">
                            {generatedEvaluation.title}
                          </CardTitle>
                          <CardDescription>
                            Tipo: {evaluationType} • Total de puntos: {getTotalPoints()}
                          </CardDescription>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Exportar PDF
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>

                  {generatedEvaluation.sections.map((section: any, sectionIndex: number) => (
                    <Card key={sectionIndex}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {section.type === "multiple-choice" && <CheckSquare className="h-5 w-5" />}
                          {section.type === "true-false" && <List className="h-5 w-5" />}
                          {section.type === "short-answer" && <Edit3 className="h-5 w-5" />}
                          {section.type === "essay" && <FileText className="h-5 w-5" />}
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {section.questions.map((question: any, qIndex: number) => (
                          <div key={qIndex} className="pb-6 border-b last:border-0">
                            <div className="flex items-start justify-between mb-3">
                              <p className="font-medium text-slate-900">
                                {question.number}. {question.text}
                              </p>
                              <Badge variant="outline">{question.points} pts</Badge>
                            </div>

                            {section.type === "multiple-choice" && question.options && (
                              <div className="space-y-2 ml-6">
                                {question.options.map((option: string, optIndex: number) => (
                                  <div key={optIndex} className="text-slate-700">
                                    {option}
                                  </div>
                                ))}
                              </div>
                            )}

                            {section.type === "true-false" && (
                              <div className="ml-6 space-y-1">
                                <div className="flex gap-4">
                                  <Label className="cursor-pointer flex items-center gap-2">
                                    <Checkbox />
                                    Verdadero
                                  </Label>
                                  <Label className="cursor-pointer flex items-center gap-2">
                                    <Checkbox />
                                    Falso
                                  </Label>
                                </div>
                              </div>
                            )}

                            {section.type === "short-answer" && (
                              <div className="ml-6">
                                <Textarea 
                                  placeholder="Espacio para la respuesta..."
                                  className="resize-none"
                                  rows={3}
                                  disabled
                                />
                              </div>
                            )}

                            {section.type === "essay" && question.guidelines && (
                              <div className="ml-6">
                                <p className="text-sm text-slate-600 mb-2">
                                  <strong>Indicaciones:</strong> {question.guidelines}
                                </p>
                                <Textarea 
                                  placeholder="Espacio para el desarrollo..."
                                  className="resize-none"
                                  rows={10}
                                  disabled
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Download className="h-4 w-4" />
                      Exportar como PDF
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <FileText className="h-4 w-4" />
                      Exportar como DOCX
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
