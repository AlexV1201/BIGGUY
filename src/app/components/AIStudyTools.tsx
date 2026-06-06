import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { ArrowLeft, Brain, Sparkles, FileText, List, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

export function AIStudyTools() {
  const [selectedFile, setSelectedFile] = useState("");
  const [summaryType, setSummaryType] = useState("general");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const files = [
    "Introducción a la Química Orgánica.pdf",
    "Historia Mundial Siglo XX.docx",
    "Matemáticas Avanzadas - Cálculo.pdf",
  ];

  const generateSummary = () => {
    if (!selectedFile) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockSummaries = {
        general: `# Resumen General

Este documento cubre los conceptos fundamentales del tema seleccionado. A continuación, se presentan los puntos clave:

## Puntos Principales

1. **Concepto Principal**: El material introduce los conceptos básicos y establece las bases teóricas necesarias para comprender el tema en profundidad.

2. **Desarrollo Teórico**: Se desarrollan las ideas principales mediante ejemplos prácticos y casos de estudio que facilitan la comprensión.

3. **Aplicaciones Prácticas**: Se presentan aplicaciones del mundo real que demuestran la relevancia del material estudiado.

## Conclusiones Clave

- Los conceptos están interrelacionados y forman un sistema coherente
- La práctica regular es esencial para dominar el material
- Las aplicaciones prácticas refuerzan el aprendizaje teórico`,

        detailed: `# Resumen Detallado

## Introducción
Este análisis exhaustivo cubre todos los aspectos importantes del material de estudio seleccionado.

## Sección 1: Fundamentos
- **Definiciones básicas**: Términos y conceptos esenciales que forman la base del conocimiento
- **Principios fundamentales**: Las leyes o reglas que rigen el campo de estudio
- **Marco teórico**: Contexto histórico y desarrollo conceptual

## Sección 2: Desarrollo del Tema
- **Teorías principales**: Explicación detallada de las teorías más importantes
- **Metodologías**: Enfoques y técnicas utilizadas en el campo
- **Casos de estudio**: Análisis de ejemplos específicos que ilustran los conceptos

## Sección 3: Aplicaciones
- **Aplicaciones prácticas**: Uso del conocimiento en situaciones reales
- **Ejercicios tipo**: Problemas comunes y métodos de resolución
- **Proyectos sugeridos**: Ideas para aplicar lo aprendido

## Conceptos Clave para Recordar
1. Fundamento A: Descripción detallada
2. Fundamento B: Descripción detallada
3. Fundamento C: Descripción detallada

## Recomendaciones de Estudio
- Revisar los conceptos básicos regularmente
- Practicar con ejercicios variados
- Conectar teoría con aplicaciones prácticas`,

        bulletPoints: `# Resumen en Puntos Clave

## 📌 Conceptos Fundamentales
• Definición y alcance del tema principal
• Terminología esencial que debes conocer
• Relación con otros campos de estudio
• Marco histórico y evolución del campo

## 🎯 Ideas Principales
• Primera idea central y su importancia
• Segunda idea central con ejemplos
• Tercera idea central y aplicaciones
• Conexiones entre conceptos

## 💡 Aplicaciones Prácticas
• Uso en la vida cotidiana
• Aplicaciones profesionales
• Casos de estudio relevantes
• Ejercicios de práctica recomendados

## ⚡ Puntos Críticos
• Concepto más importante: descripción breve
• Error común a evitar
• Técnica de estudio recomendada
• Recursos adicionales sugeridos

## 📚 Para Profundizar
• Temas relacionados a explorar
• Lecturas complementarias
• Ejercicios de práctica
• Proyectos de aplicación`,
      };

      setGeneratedSummary(mockSummaries[summaryType as keyof typeof mockSummaries]);
      setIsGenerating(false);
      toast.success("Resumen generado exitosamente");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-slate-900">
                Resúmenes con IA
              </h1>
            </div>
            <p className="text-slate-600">
              Genera resúmenes inteligentes de tus materiales de estudio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-select">Seleccionar Archivo</Label>
                  <Select value={selectedFile} onValueChange={setSelectedFile}>
                    <SelectTrigger id="file-select" className="mt-2">
                      <SelectValue placeholder="Elige un archivo de tu biblioteca" />
                    </SelectTrigger>
                    <SelectContent>
                      {files.map((file) => (
                        <SelectItem key={file} value={file}>
                          {file}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="summary-type">Tipo de Resumen</Label>
                  <Select value={summaryType} onValueChange={setSummaryType}>
                    <SelectTrigger id="summary-type" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          General
                        </div>
                      </SelectItem>
                      <SelectItem value="detailed">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Detallado
                        </div>
                      </SelectItem>
                      <SelectItem value="bulletPoints">
                        <div className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Puntos Clave
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateSummary} 
                  className="w-full gap-2"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generar Resumen
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Características</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="mt-0.5">IA</Badge>
                  <div>
                    <p className="font-medium text-sm">Resumen Inteligente</p>
                    <p className="text-sm text-slate-600">
                      Identifica automáticamente los conceptos más importantes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="mt-0.5" variant="secondary">Rápido</Badge>
                  <div>
                    <p className="font-medium text-sm">Procesamiento Veloz</p>
                    <p className="text-sm text-slate-600">
                      Obtén resúmenes en segundos, no en horas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="mt-0.5" variant="outline">Flexible</Badge>
                  <div>
                    <p className="font-medium text-sm">Múltiples Formatos</p>
                    <p className="text-sm text-slate-600">
                      Elige el estilo de resumen que mejor se adapte a ti
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Summary */}
          {generatedSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Resumen Generado
                </CardTitle>
                <CardDescription>
                  Archivo: {selectedFile}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                      {generatedSummary}
                    </pre>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Copiar al Portapapeles
                  </Button>
                  <Button variant="outline" size="sm">
                    Exportar como PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    Crear Flashcards
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
